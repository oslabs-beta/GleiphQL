import { Request, Response, NextFunction } from 'express';
import { isAbstractType, buildSchema, GraphQLInterfaceType, printSchema, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode } from 'graphql';
import graphql from 'graphql';
import { useSchema } from 'graphql-yoga';
import { getDirective } from '@graphql-tools/utils';

//to-dos
//modularize code, certain functions can be offloaded
//research further into pagination conventions => currently only account for IntValues for first/last/limit
//compare limits found in arguments against both defaultLimit and limits found within schema => defaultLimit case resolved, limits found in schema not resolved
//generate casing for mutations/subscriptions

const schemaSDL = `
  directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type Query {
    publicField: String
    authenticatedField: String @auth
    adminField: String @auth(requires: ADMIN)
  }
`;

const query = `query MyQuery {
  publicField
  authenticatedField
  adminField
}`

// console.log(getDirective(schemaSDL, 'cost', ))
const schemaBuilt = buildSchema(schemaSDL);

// console.log('This is the built schema', schemaBuilt)

const queryAST = parse(query);

const schemaASTType = new TypeInfo(schemaBuilt);


console.log('This is the schemaTypeInfo lol', schemaASTType.getDirective);

const rateLimiter = function (config: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      // console.log('does this shit work lol?', config.schema);

      //function parses passed in AST assigns given listLimit to any limit argument nodes encountered
      //unclear how useful this functionality actually is, but interesting to note that it is possible to parse and reconstruct a query AST
      //presumably the endpoint would have configured some sort of list pagination/heuristics on their end
      //unclear whether providing this throttle function would be overly useful in the library itself
      const throttle = function(ast: DocumentNode, paginationLimit: number) {
        let newAst = visit(ast, {
          //@ts-ignore
          Argument(node) {
            if (node.name.value === 'limit' && node.value.kind === 'IntValue' || node.name.value === 'first' && node.value.kind === 'IntValue' || node.name.value === 'last' && node.value.kind === 'IntValue') {
              let argValue = parseInt(node.value.value, 10);
              console.log(`Argvalue = ${argValue}`);
              if (argValue > paginationLimit) {
                console.log(`ArgValue has exceeded passed in limit, modifying`)
                return {
                  ...node,
                  value: {
                    ...node.value,
                    value: paginationLimit.toString(),
                  },
                };
              }
            }
          },
        });
        req.body.query = graphql.print(newAst);
        return newAst;
      }

      const parsedAst = parse(req.body.query);
      const throttledAst = throttle(parsedAst, config.paginationLimit);
      let parentTypeStack: any[]= [];
      let complexityScore = 0;
      let typeComplexity = 0;
      let resolveComplexity = 0;
      let currMult = 0;

      visit(queryAST, visitWithTypeInfo(schemaASTType, {
        enter(node) {

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {
            // console.log(schemaBuilt);
            // console.log(getDirective(schemaBuilt, node, 'cost'))

            //resets list multiplier upon encountering an empty stack, indicating that a set of nested fields has been exited
            if(parentTypeStack.length === 0) currMult = 0;

            const parentType = schemaASTType.getParentType();
            if (parentType) {
            const fieldDef = parentType && isAbstractType(parentType) ? schemaASTType.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
            console.log('this is currNode', node.name.value)
            console.log('directives?', fieldDef.astNode?.directives);
            if(fieldDef.astNode){
              if(fieldDef.astNode.directives){
              const directivesArgs = [];
              for (let i = 0; i < fieldDef.astNode.directives.length; i++) {
                console.log('Name and args', {name : fieldDef.astNode.directives[i].name.value, arguments: fieldDef.astNode.directives[i].arguments})
                directivesArgs.push(fieldDef.astNode.directives[i].arguments);
              }
              if(directivesArgs.length > 0){
              for (let i = 0; i < directivesArgs.length; i++) {
                const map = directivesArgs[i]?.map(arg => ({
                  name: arg.name.value,
                  value: arg.value
                }))
                console.log('These are directiveArgs', map)
              }
            }
            }
            }
            const fieldDefArgs = fieldDef.args;
            // console.log('These are the fieldArgs:', fieldDef.args);
            const fieldType = getNullableType(fieldDef.type);
            // console.log('This is astNode', fieldDef.astNode);
            // console.log('This is the field def', fieldDef)
            // if(fieldDef.directives) {
            //   //@ts-ignore
            //   const cost = fieldDirectives.find(directive => directive.name.value === 'cost');
            // }
            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            // console.log('This is the currentNode:', node.name.value);
            // console.log(parentTypeStack);
            // let currMult = 0;
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjusts currMult accordingly
            if(isList === true) {
              // console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last'));
              currMult = config.paginationLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                // console.log(`Found limit argument with value ${argValue}`);
                if(argValue < config.paginationLimit) currMult = argValue;
                // console.log('Mult is now:', currMult);
              }
              // console.log('Mult is now:', currMult);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  //assuming the list is currently nested within another list, adjust resolve complexity by number of list calls
                  //indicated by the multiplier inherited by the previous list
                  resolveComplexity += parentTypeStack[i].currMult;
                  resolveComplexity--;
                  currMult = currMult * parentTypeStack[i].currMult
                  break;
                }
              }

              //base case addition of resolveComplexity, offset in above for-loop for list cases
              resolveComplexity++;
              typeComplexity += currMult;

              //handling for object types, checks for most recent ancestor list's multiplier then adjust accordingly
            } else if (fieldType instanceof GraphQLObjectType) {
              // console.log(`This is the parentStack of the graphQLObject type ${node.name.value}`, parentTypeStack);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  resolveComplexity += parentTypeStack[i].currMult;
                  resolveComplexity--;
                  currMult = parentTypeStack[i].currMult
                  break;
                }
              }

              //if the currMult === 0 indicates object not nested in list, simply increment complexity score
              if(currMult !== 0) typeComplexity += currMult; else typeComplexity++;
              resolveComplexity++;
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
          // console.log('Exiting node')
        }
      }));


      complexityScore = resolveComplexity + typeComplexity;
      // console.log('This is the type complexity', typeComplexity);
      // console.log('This is the resolve complexity', resolveComplexity);
      // console.log('This is the complexity score:', complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      if(config.monitor === true) {
        res.locals.complexityScore = complexityScore;
        res.locals.complexityLimit = config.complexityLimit;
        return next();
      }
      if(complexityScore >= config.complexityLimit) {

        console.log('Complexity of this query is too high');
        return next(Error);
      }
};
return next();
  }
}
export default rateLimiter;
