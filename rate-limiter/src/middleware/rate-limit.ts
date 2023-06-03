import { Request, Response, NextFunction } from 'express';
import { isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';

const rateLimiter = function (complexityLimit: number, listLimit: number, schema: GraphQLSchema, schemaTypeInfo: TypeInfo, config: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      //function parses passed in AST assigns given listLimit to any limit argument nodes encountered
      //unclear how useful this functionality actually is, but interesting to note that it is possible to parse and reconstruct a query AST
      //presumably the endpoint would have configured some sort of list pagination/heuristics on their end
      //unclear whether providing this throttle function would be overly useful in the library itself
      const throttle = function(ast: DocumentNode, listLimit: number) {
        let newAst = visit(ast, {
          //@ts-ignore
          Argument(node) {
            if (node.name.value === 'limit' && node.value.kind === 'IntValue') {
              let argValue = parseInt(node.value.value, 10);
              console.log(`Argvalue = ${argValue}`);
              if (argValue > listLimit) {
                console.log(`ArgValue has exceeded passed in limit, modifying`)
                return {
                  ...node,
                  value: {
                    ...node.value,
                    value: listLimit.toString(),
                  },
                };
              }
            }
          },
        });
        req.body.query = print(newAst);
        return newAst;
      }

      const parsedAst = parse(req.body.query);
      const throttledAst = throttle(parsedAst, listLimit);
      let parentTypeStack: any[]= [];
      let complexityScore = 0;
      let currMult = 0;

      visit(throttledAst, visitWithTypeInfo(schemaTypeInfo, {
        enter(node) {

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {

            //resets list multiplier upon encountering an empty stack, indicating that a set of nested fields has been exited
            if(parentTypeStack.length === 0) currMult = 0;

            const parentType = schemaTypeInfo.getParentType();
            if (parentType) {
            const fieldDef = parentType && isAbstractType(parentType) ? schemaTypeInfo.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
            const fieldDefArgs = fieldDef.args;
            console.log('These are the fieldArgs:', fieldDef.args);
            const fieldType = getNullableType(fieldDef.type);
            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            console.log('This is the currentNode:', node.name.value);
            console.log(parentTypeStack);
            // let currMult = 0;
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjust currMult accordingly
            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => arg.name.value === 'limit');
              currMult = listLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                if(argValue < listLimit) currMult = argValue;
                // console.log('Mult is now:', currMult);
              }
              console.log('Mult is now:', currMult);
              for (let i  =0; i < parentTypeStack.length; i++) {
                if(parentTypeStack[i].isList === true) currMult = currMult * parentTypeStack[i].currMult
              }
              complexityScore += currMult;

              //handling for object types, checks for most recent ancestor list's multiplier then adjust accordingly
            } else if (fieldType instanceof GraphQLObjectType) {
              console.log(`This is the parentStack of the graphQLObject type ${node.name.value}`, parentTypeStack);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  currMult = parentTypeStack[i].currMult
                  break;
                }
              }

              //if the currMult === 0 indicates object not nested in list, simply increment complexity score
              if(currMult !== 0) complexityScore += currMult; else complexityScore++;
            }
            // console.log('This is the nested list count:', nestedListCount);

            parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult});

          }
        }
        }
        },
        leave(node) {
          if (node.kind === Kind.FIELD) {
            parentTypeStack.pop();
          }
          console.log('Exiting node')
        }
      }));

      console.log('This is the complexity score:', complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      if(complexityScore >= complexityLimit) {
        console.log('Complexity of this query is too high');
        return next(Error);
      }
};
return next();
  }
}
export default rateLimiter;
