import { Request, Response, NextFunction } from 'express';
import { buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode } from 'graphql';
import graphql from 'graphql';
import { useSchema } from 'graphql-yoga';
import { buildResolveInfo } from 'graphql/execution/execute';

//to-dos
//modularize code, certain functions can be offloaded
//research further into pagination conventions => currently only account for IntValues for first/last/limit
//compare limits found in arguments against both defaultLimit and limits found within schema => defaultLimit case resolved, limits found in schema not resolved
//generate casing for mutations/subscriptions

const rateLimiter = function (config: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      // const schemaType = new TypeInfo(config.schema);
      // const parsedAst = parse(req.body.query);

      const testSDL = `

directive @cost(value: Int) on FIELD_DEFINITION

type Author {
  id: ID! @cost(value: 1)
  name: String @cost(value: 2)
  books: [Book] @cost(value: 3)
}

type Book {
  id: ID! @cost(value: 1)
  title: String @cost(value: 2)
  author: Author @cost(value: 3)
}

type Query {
  authors: [Author] @cost(value: 2)
  books: [Book] @cost(value: 2)
}
      `

      const testQuery = `
      query {
        authors {
          id
          name
          books {
            title
          }
        }
        books {
          id
          title
          author {
            name
          }
        }
      }
      `

      const builtSchema = buildSchema(testSDL)
      const schemaType = new TypeInfo(builtSchema);
      const parsedAst = parse(testQuery);
      let parentTypeStack: any[]= [];
      let complexityScore = 0;
      let typeComplexity = 0;
      let resolveComplexity = 0;
      let currMult = 0;

      visit(parsedAst, visitWithTypeInfo(schemaType, {
        enter(node) {

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {

            let baseVal = 1;
            //resets list multiplier upon encountering an empty stack, indicating that a set of nested fields has been exited
            if(parentTypeStack.length === 0) currMult = 0;

            const parentType = schemaType.getParentType();
            if (parentType) {
            const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
            console.log('this is currNode', node.name.value);
            console.log('directives?', fieldDef.astNode?.directives);
            const fieldDefArgs = fieldDef.args;
            console.log('These are the fieldArgs:', fieldDef.args);
            if(fieldDef.astNode) {
              if(fieldDef.astNode.directives) {
                console.log('This is the current value of baseVal', baseVal)
                const directives: any[] = [];
                for (let i = 0; i < fieldDef.astNode.directives.length; i++) {
                  console.log('These are the directives', fieldDef.astNode.directives[i]);
                  directives.push({name: fieldDef.astNode.directives[i].name, arguments: fieldDef.astNode.directives[i].arguments})
                  console.log('These are the pushed directives', directives[i]);
                }
                if(directives.length){
                  for (let i = 0; i < directives.length; i++) {
                    const map = directives[i].arguments?.map((arg: any) => ({
                      name: directives[i].name.value,
                      value: arg.value
                    }))

                    console.log('This is the map', map)

                    const cost = map.find((ele: any) => {
                      if(ele.name === 'cost' && ele.value){
                        baseVal = ele.value.value;
                      }
                    })
                  }
                }
                console.log('This is the value of baseVal after accounting for directives', baseVal)
              }
            }


            const fieldType = getNullableType(fieldDef.type);
            // const fieldDirectives = fieldDef.astNode.directives;
            // if(fieldDirectives) {
            //   //@ts-ignore
            //   const cost = fieldDirectives.find(directive => directive.name.value === 'cost');
            // }
            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            console.log('This is the currentNode:', node.name.value);
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjusts currMult accordingly
            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last'));
              currMult = config.paginationLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                currMult = argValue;
              }
              console.log('Mult is now:', currMult);
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
              typeComplexity += currMult * baseVal;

              //handling for object types, checks for most recent ancestor list's multiplier then adjust accordingly
            } else if (fieldType instanceof GraphQLObjectType) {
              console.log(`This is the parentStack of the graphQLObject type ${node.name.value}`, parentTypeStack);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  resolveComplexity += parentTypeStack[i].currMult;
                  resolveComplexity--;
                  currMult = parentTypeStack[i].currMult
                  break;
                }
              }

              //if the currMult === 0 indicates object not nested in list, simply increment complexity score
              if(currMult !== 0) typeComplexity += currMult * baseVal; else typeComplexity+= baseVal;
              resolveComplexity++;
            }
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


      complexityScore = resolveComplexity + typeComplexity;
      console.log('This is the type complexity', typeComplexity);
      console.log('This is the resolve complexity', resolveComplexity);
      console.log('This is the complexity score:', complexityScore);

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
