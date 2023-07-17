import { Request, Response, NextFunction } from 'express';
import { buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation, GraphQLUnionType, GraphQLNamedOutputType } from 'graphql';
import graphql from 'graphql';
import { useSchema } from 'graphql-yoga';
import { createClient } from 'redis';
import cache from './cache.js';


const testSDL = `
directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
directive @paginationLimit(value: Int) on FIELD_DEFINITION

type Author {
  id: ID! @cost(value: 1)
  name: String @cost(value: 200) => typeInfo vs resolveInfo
  books: [Book] @cost(value: 3)
}

type Book {
  id: ID! @cost(value: 1)
  title: String @cost(value: 2)
  author: Author @cost(value: 3)
}

type Query {
  authors: [Author] @cost(value: 2)
  books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
}
      `

      const testSDLPolymorphism = `
      directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
directive @paginationLimit(value: Int) on FIELD_DEFINITION

type Author {
  id: ID! @cost(value: 1)
  name: String @cost(value: 200)
  books: [Book] @cost(value: 3)
}

type Book {
  id: ID! @cost(value: 1)
  title: String @cost(value: 2)
  author: Author @cost(value: 3)
}

union SearchResult = Author | Book

type Query {
  authors: [Author] @cost(value: 2)
  books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
  search(term: String): [SearchResult]
}
`

const testQueryPolymorphism = `
query SearchQuery {
  search(term: "example") {
    ... on Author {
      id
      name
    }
    ... on Book {
      id
      title
    }
  }
}
`

      const testQuery = `
      query {
        books(limit: 4) {
          id
          title
          author {
            name
          }
        }
      }
      `

      const testQueryFrag = `
      query {
        ...BookFields
      }

      fragment BookFields on Query {
        books(limit: 4) {
          id
          title
          author {
            name
          }
        }
      }

      `

//To-dos

//Resolve Relay convention breaking analysis
//Resolve argument calls nested in list casing => should be resolved
//Resolve polymorphism of union/interface types => AAAAAAAAAAAAAAAAAAAAAAAAAH


//What problems do you need to account for?

//We are doing static analysis
//We have very limited information before query execution
  //Schema definition => which is also provided by the user (developer)
  //Query => user (person querying developer's GraphQL information)
  //Accounting for worst-case scenario => must account for worst case scenario for heuristic to be valubable
    //External fetches => implement user configurability for cost of fields
    //Resolver definition cannot be accessed by analysis because they do not exist in SDL => implement user configurability for cost

//Static analysis
  //User configurability of fields by directives
  //



// //sample schema to test directive work


//to-dos
//modularize code, certain functions can be offloaded
//generate casing for mutations/subscriptions
//implement support for resolvers => check if resolvers are saved in schema => should be in okay state => need to figure out if resolver cost can be separated
//fix typescript typing issues, define interfaces for complex object types passed to helper functions
//attempt to refactor the class, to handle modularization of interdependent data structures using class state

//unimplemented class shell

interface TokenBucket {
  [key: string]: {
    tokens: number;
    lastRefillTime: number;
  };
}

class ComplexityAnalysis {

  private config: any;
  private schema: GraphQLSchema;
  private parsedAst: DocumentNode;
  private parentTypeStack: ParentType[] = [];
  private currMult: number = 0;
  private complexityScore = 0;
  private typeComplexity = 0;
  private resolveComplexity = 0;
  private tokenBucket: TokenBucket = {};
  private ip: string;

  constructor(ip: string, schema: GraphQLSchema, parsedAst: DocumentNode, config: any, tokenBucket: TokenBucket) {
    this.config = config;
    this.tokenBucket = tokenBucket;
    this.parsedAst = parsedAst;
    this.ip = ip;
    this.schema = schema
  }

  complexityAnalysis(req: Request, res: Response, next: NextFunction) {
    if (this.parsedAst) {

      const schemaType = new TypeInfo(this.schema)
      if(this.ip.includes('::ffff:')) {
        this.ip = this.ip.replace('::ffff:', '');
      }

      visit(this.parsedAst, visitWithTypeInfo(schemaType, {
        //use arrow function here within higher-order function in order to access surrounding scope
        enter: (node) => {

          if (node.kind === Kind.FIELD) {

            let baseVal = 1;
            let internalPaginationLimit = 0;
            let argumentCosts = 0;

            if (this.parentTypeStack.length === 0) this.currMult = 0;

            const parentType = schemaType.getParentType();

            if(parentType) {
              const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
              const fieldDefArgs = fieldDef.args;
              console.log('These are relevant fieldArgs', fieldDef.args);
              const fieldType = fieldDef.type;
              const fieldTypeUnion = getNamedType(fieldType);
              console.log('Union?', fieldTypeUnion);
              if(fieldTypeUnion instanceof GraphQLUnionType) {
                this.resolveUnionTypes(fieldTypeUnion, schemaType)
              }
            }

            }
          }
        }
      }))
    }
  }

  resolveUnionTypes(fieldType: GraphQLUnionType, schemaType: TypeInfo) {
    //modularize code
    //add resolution for union of unions if possible, exists but potentially anti-pattern
    const unionTypes = this.schema.getPossibleTypes(fieldType);
    const costAssociation = unionTypes.map(containedType => {
      return {
        name: containedType.name, cost: 0
      }
    })
    console.log('storage object pre-resolution', costAssociation)
    unionTypes.forEach(containedType => {

      let containedMult = 1;

      console.log('This is the main type', containedType)
      if(containedType instanceof GraphQLList){
        //parse arguments/directives
        //define pagination etc.
        //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHH
        this.parentTypeStack.forEach(parentType => {
          if(parentType.isList) {
            containedMult = parentType.currMult;
          }
        })
      }
      if(containedType.astNode){

        containedType.astNode.fields?.forEach(field => {
          console.log('sub directives', field.directives)
          const fieldDirectives = field.directives?.map(directive => {
            return {
              name: directive.name,
              arguments: directive.arguments
            }
          })

          fieldDirectives?.forEach(directive => {
            if(directive.name.value === 'cost'){
              console.log('Directive args?', directive.arguments)
              const args = directive.arguments?.map(argument => {
                return argument.value
              })
              args?.forEach(argument => {
                costAssociation.forEach(ele => {
                  if(ele.name === containedType.name){
                    if(argument){
                    console.log('contained arg', argument)
                    //@ts-ignore
                    ele.cost += Number(argument.value)
                    }
                  }
                })
              })
            }
          })
        })

      }
    })
    console.log('cost associations post-resolution', costAssociation);
    return costAssociation;
  }

}

const resolveUnionTypes = function(fieldType: GraphQLUnionType, schema: GraphQLSchema, typeInfo: TypeInfo, parentTypeStack: ParentType[]) {
  //modularize code
  //add resolution for union of unions if possible, exists but potentially anti-pattern
  const interfaceTypes = schema.getPossibleTypes(fieldType);
  const costAssociation = interfaceTypes.map(containedType => {
    return {
      name: containedType.name, cost: 0
    }
  })
  console.log('storage object pre-resolution', costAssociation)
  interfaceTypes.forEach(containedType => {
    console.log('This is the main type', containedType)
    if(containedType instanceof GraphQLList){
      //parse arguments/directives
      //define pagination etc.
      //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHH
      const
    }
    if(containedType.astNode){

      containedType.astNode.fields?.forEach(field => {
        console.log('sub directives', field.directives)
        const fieldDirectives = field.directives?.map(directive => {
          return {
            name: directive.name,
            arguments: directive.arguments
          }
        })

        fieldDirectives?.forEach(directive => {
          if(directive.name.value === 'cost'){
            console.log('Directive args?', directive.arguments)
            const args = directive.arguments?.map(argument => {
              return argument.value
            })
            args?.forEach(argument => {
              costAssociation.forEach(ele => {
                if(ele.name === containedType.name){
                  if(argument){
                  console.log('contained arg', argument)
                  //@ts-ignore
                  ele.cost += Number(argument.value)
                  }
                }
              })
            })
          }
        })
      })

    }
  })
  console.log('cost associations post-resolution', costAssociation);
  return costAssociation;
}

const parseArgumentDirectives = function(fieldDef: GraphQLField<unknown, unknown, any>) {
  if(fieldDef.astNode?.arguments) {
    console.log('In parseArgumentDirectives');
    //since the directive costs within directives placed in arguments are deeply nested, we have to use flatMap to efficiently extract them
    //flatMap's under the hood implementation is very similar to the flattenArray things we've done before, it just integrates mapping with that process
    const argumentDirectives = fieldDef.astNode.arguments.flatMap((arg: any) => {
      const argName = arg.name.value;
      return arg.directives?.map((directive: any) => ({
        argName,
        directiveName: directive.name.value,
        //@ts-ignore
        directiveValue: directive.arguments?.find(arg => arg.name.value === 'value')?.value.value,
      }));
    });
    console.log('argumentDirectives', argumentDirectives);
    const argumentCosts = argumentDirectives.filter((directive: any) => directive.directiveName === 'cost');
    // console.log('arg costs', argumentCosts);
    return argumentCosts;
  } else {
    return;
  }
}

interface DirectivesInfo {
  name: graphql.NameNode,
  arguments: readonly graphql.ConstArgumentNode[],
}

interface PaginationDirectives {
  name: string,
  value: any,
}

const parseDirectives = function(fieldDef: GraphQLField<unknown, unknown, any>, baseVal: number) {
  let listLimit = 0;
  if(fieldDef.astNode?.directives) {
    // console.log('This is the current value of baseVal', baseVal)
    const directives: DirectivesInfo[] = [];
    for (let i = 0; i < fieldDef.astNode.directives.length; i++) {
      // console.log('These are the directives', fieldDef.astNode.directives[i]);
      directives.push({name: fieldDef.astNode.directives[i].name, arguments: fieldDef.astNode.directives[i].arguments as readonly graphql.ConstArgumentNode[]})
      // console.log('These are the pushed directives', directives[i]);
    }
    if(directives.length){
      for (let i = 0; i < directives.length; i++) {
        const costPaginationDirectives: PaginationDirectives[] = directives[i].arguments?.map((arg: any) => ({
          name: directives[i].name.value,
          value: arg.value
        }))
        // console.log('This is the map', map)

        //.find terminates on first match so I just ran it twice, probably some way to make this dry

        costPaginationDirectives.forEach((directives: PaginationDirectives)  => {
          if(directives.name === 'cost' && directives.value) baseVal = directives.value.value;
          if(directives.name === 'paginationLimit' && directives.value) listLimit = directives.value
        })

        // costPaginationDirectives.find((costDirective: PaginationDirectives) => {
        //   if(costDirective.name === 'cost' && costDirective.value){
        //     baseVal = costDirective.value.value;
        //   }
        // })

        // costPaginationDirectives.find((paginationLimit: PaginationDirectives) => {
        //   if(paginationLimit.name === 'paginationLimit' && paginationLimit.value){
        //     listLimit = paginationLimit.value
        //   }
        // })

      }
    }
  }
    console.log('This is the value of baseVal after accounting for directives', baseVal)
    return {costDirective: baseVal, paginationLimit: listLimit}
}

interface ParentType {
  fieldDef: GraphQLField<unknown, unknown, any>,
  isList: boolean,
  fieldDefArgs: readonly graphql.GraphQLArgument[],
  currMult: number,
}

const rateLimiter = function (config: any) {
  interface TokenBucket {
    [key: string]: {
      tokens: number;
      lastRefillTime: number;
    };
  }
  let tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      const builtSchema = buildSchema(testSDLPolymorphism)
      const schemaType = new TypeInfo(builtSchema);
      const parsedAst = parse(testQueryPolymorphism);

      // const schemaType = new TypeInfo(config.schema);
      // const parsedAst = parse(req.body.query);

      let parentTypeStack: ParentType[]= [];
      let complexityScore = 0;
      let typeComplexity = 0;
      let resolveComplexity = 0;
      let currMult = 0;
      let requestIP = req.ip

      // fixes format of ip addresses
      if (requestIP.includes('::ffff:')) {
        requestIP = requestIP.replace('::ffff:', '');
      }

      visit(parsedAst, visitWithTypeInfo(schemaType, {
        enter(node) {

          //attempt to resolve polymorphism of union/interface types

          //What do you need to do to resolve the polymorphism of union types
            //Upon entry to the any given node, check if it is an inline fragment?
          if (node.kind === Kind.INLINE_FRAGMENT) {
            console.log('Inline fragment?', node.kind);

          }

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {


            let baseVal = 1;
            let internalPaginationLimit = 0;
            let argumentCosts = 0;
            //resets list multiplier upon encountering an empty stack, indicating that a set of nested fields has been exited
            if(parentTypeStack.length === 0) currMult = 0;

            const parentType = schemaType.getParentType();
            if (parentType) {
            const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
            console.log('this is currNode', node.name.value);
            // console.log('directives?', fieldDef.astNode?.directives);
            // console.log('arguments?', fieldDef.astNode?.arguments);
            const fieldDefArgs = fieldDef.args;
            console.log('These are the fieldArgs:', fieldDef.args);
            const fieldType = fieldDef.type;
            const fieldTypeUnion = getNamedType(fieldType)
            console.log('Field type?', fieldTypeUnion);
            if(fieldTypeUnion instanceof GraphQLUnionType) {
              const schema = builtSchema as GraphQLSchema
              resolveUnionTypes(fieldTypeUnion, schema, schemaType, parentTypeStack)
              const possibleTypes = schema.getPossibleTypes(fieldTypeUnion);
              console.log('These are the possible types', possibleTypes);
            }

            const fieldTypeStripped = getNullableType(fieldDef.type)

            if(fieldDef.astNode) {
              const argumentDirectiveCost = parseArgumentDirectives(fieldDef);
              // console.log('This is directive cost', directiveCost)

              //add in additional check here? a list could be nested within another list returning 10 lists and then 10 calls of the argument directive
              if(argumentDirectiveCost) {
                argumentDirectiveCost.forEach((directive: any) => {
                  console.log('initial complexity score:', complexityScore);
                  console.log('Attempting to resolve cost of resolving argument')
                  const directiveValue = Number(directive.directiveValue)
                  argumentCosts += directiveValue;
                  console.log('complexity score post addition', complexityScore);
                })
              }

              const directiveAdjustedBaseVal = parseDirectives(fieldDef, baseVal)
              baseVal = directiveAdjustedBaseVal.costDirective;
              internalPaginationLimit = directiveAdjustedBaseVal.paginationLimit;
            }

            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            console.log('This is the currentNode:', node.name.value);
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjusts currMult accordingly
            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last' || arg.name.value === 'before' || arg.name.value === 'after'));
              currMult = config.paginationLimit;
              if(internalPaginationLimit) currMult = internalPaginationLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                //unclear how we want to handle this base behavior, may be best to create a default case that is editable by user
                if(argValue > internalPaginationLimit) console.log('The passed in argument exceeds paginationLimit, define intended default behavior for this case')
                currMult = argValue;
              }
              console.log('Mult is now:', currMult);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  //assuming the list is currently nested within another list, adjust resolve complexity by number of list calls
                  //indicated by the multiplier inherited by the previous list
                  const lastListMultiplier = parentTypeStack[i].currMult;
                  resolveComplexity += lastListMultiplier;
                  resolveComplexity--;
                  currMult = currMult * lastListMultiplier
                  argumentCosts = argumentCosts * lastListMultiplier
                  break;
                }
              }

              //base case addition of resolveComplexity, offset in above for-loop for list cases
              resolveComplexity++;
              typeComplexity += (currMult * baseVal + argumentCosts);

              //handling for object types, checks for most recent ancestor list's multiplier then adjust accordingly
            } else {
              console.log(`This is the parentStack of the current GraphQL field type ${node.name.value}`, parentTypeStack);

              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  const lastListMultiplier = parentTypeStack[i].currMult;
                  resolveComplexity += lastListMultiplier;
                  resolveComplexity--;
                  currMult = lastListMultiplier
                  break;
                }
              }

              //if the currMult === 0 indicates object not nested in list, simply increment complexity score
              if(currMult !== 0) typeComplexity += currMult * baseVal + argumentCosts; else typeComplexity+= baseVal + argumentCosts;
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
        }
      }));


      complexityScore = resolveComplexity + typeComplexity;
      console.log('This is the type complexity', typeComplexity);
      console.log('This is the resolve complexity', resolveComplexity);
      console.log('This is the complexity score:', complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      //if(config.monitor === true) {
        res.locals.complexityScore = complexityScore;
        res.locals.complexityLimit = config.complexityLimit;
      //   return next();
      // }

      // if the user wants to use redis, a redis client will be created and used as a cache
      if (config.redis === true) {
        await cache.redis(config, complexityScore, req, res, next)
      }
      // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
      else if (config.redis !== true) {
        tokenBucket = cache.nonRedis(config, complexityScore, tokenBucket, req)

        if (complexityScore >= tokenBucket[requestIP].tokens) {
          console.log('Complexity of this query is too high');
          return next(Error);
        }
        console.log('Tokens before subtraction: ', tokenBucket[requestIP].tokens)
        tokenBucket[requestIP].tokens -= complexityScore;
        console.log('Tokens after subtraction: ', tokenBucket[requestIP].tokens)
      }

    };
  return next();
  }
}
export default rateLimiter;