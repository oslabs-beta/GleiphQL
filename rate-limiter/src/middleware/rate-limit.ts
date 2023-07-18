import { Request, Response, NextFunction } from 'express';
import { buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation, GraphQLUnionType, GraphQLNamedOutputType, getDirectiveValues, isCompositeType } from 'graphql';
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

//relevant interfaces
interface TokenBucket {
  [key: string]: {
    tokens: number;
    lastRefillTime: number;
  };
}


interface DirectivesInfo {
  name: graphql.NameNode,
  arguments: readonly graphql.ConstArgumentNode[],
}

interface PaginationDirectives {
  name: string,
  value: any,
}

interface ParentType {
  fieldDef: GraphQLField<unknown, unknown, any>,
  isList: boolean,
  fieldDefArgs: readonly graphql.GraphQLArgument[],
  currMult: number,
}

//start of class

class ComplexityAnalysis {

  private config: any;
  private schema: GraphQLSchema;
  private parsedAst: DocumentNode;
  private parentTypeStack: ParentType[] = [];
  private currMult: number = 0;
  private complexityScore = 0;
  private typeComplexity = 0;
  private resolveComplexity = 0;

  constructor(schema: GraphQLSchema, parsedAst: DocumentNode, config: any) {
    this.config = config;
    this.parsedAst = parsedAst;
    this.schema = schema
  }

  traverseAST () {
    console.log('in traverseAST');
    if (this.parsedAst) {

      console.log('parsedAst exists')

      console.log('schema', this.schema);

      const schemaType = new TypeInfo(this.schema)

      visit(this.parsedAst, visitWithTypeInfo(schemaType, {
        //use arrow function here within higher-order function in order to access surrounding scope
        enter: (node) => {

          if (node.kind === Kind.FIELD) {

            let baseVal = 1;
            let internalPaginationLimit: number | null = null;
            let argumentCosts = 0;

            if (this.parentTypeStack.length === 0) this.currMult = 0;

            const parentType = schemaType.getParentType();

            console.log('ParentType', parentType);

            if(!parentType) return;

            console.log('ParentType exists');

            const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType.getFields()[node.name.value];

            if(!fieldDef) return;

            const fieldDefArgs = fieldDef.args;
            console.log('These are relevant fieldArgs', fieldDef.args);
            const fieldType = fieldDef.type;
            const fieldTypeUnion = getNamedType(fieldType);
            console.log('Union?', fieldTypeUnion);
            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));
            const argumentDirectiveCost = this.parseArgumentDirectives(fieldDef);
            const directiveAdjustedBaseVal = this.parseDirectives(fieldDef, baseVal)

            if(argumentDirectiveCost) {
              argumentDirectiveCost.forEach((directive: any) => {
                console.log('Attempting to resolve cost of resolving argument')
                const directiveValue = Number(directive.directiveValue)
                argumentCosts += directiveValue;
                })
            }

            baseVal = directiveAdjustedBaseVal.costDirective;
            if(directiveAdjustedBaseVal.paginationLimit) internalPaginationLimit = directiveAdjustedBaseVal.paginationLimit;

            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last' || arg.name.value === 'before' || arg.name.value === 'after'));
              this.currMult = this.config.paginationLimit;

              if(internalPaginationLimit) this.currMult = internalPaginationLimit;

              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                //unclear how we want to handle this base behavior, may be best to create a default case that is editable by user
                if(internalPaginationLimit) {
                  if(argValue > internalPaginationLimit) console.log('The passed in argument exceeds paginationLimit, define intended default behavior for this case')
                }
                  this.currMult = argValue;
              }

              console.log('Mult is now:', this.currMult);

              this.resolveParentTypeStack(isList, argumentCosts, baseVal);

              } else if (fieldTypeUnion instanceof GraphQLUnionType) {
                const costAssociations = this.resolveUnionTypes(fieldTypeUnion)
              } else {
                console.log(`This is the parentStack of the current GraphQL field type ${node.name.value}`, this.parentTypeStack);

                this.resolveParentTypeStack(isList, argumentCosts, baseVal);
              }
                const currMult = this.currMult
                this.parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult});
            }
          },
          leave:(node) => {
            if (node.kind === Kind.FIELD) {
              this.parentTypeStack.pop();
            }
          }
      }))
    }

    this.complexityScore = this.typeComplexity + this.resolveComplexity;
    
    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity, resolveComplexity: this.resolveComplexity};
  }

  resolveParentTypeStack(isList: boolean, argumentCosts: number, baseVal: number) {
    if(isList === true) {
      for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
        if(this.parentTypeStack[i].isList === true) {
        //assuming the list is currently nested within another list, adjust resolve complexity by number of list calls
        //indicated by the multiplier inherited by the previous list
        const lastListMultiplier = this.parentTypeStack[i].currMult;
        this.resolveComplexity += lastListMultiplier;
        this.resolveComplexity--;
        this.currMult = this.currMult * lastListMultiplier
        argumentCosts = argumentCosts * lastListMultiplier
        break;
        }
      }

      //base case addition of resolveComplexity, offset in above for-loop for list cases
        this.resolveComplexity++;
        this.typeComplexity += (this.currMult * baseVal + argumentCosts);
    } else {

      for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
        if(this.parentTypeStack[i].isList === true) {
          const lastListMultiplier = this.parentTypeStack[i].currMult;
          this.resolveComplexity += lastListMultiplier;
          this.resolveComplexity--;
          this.currMult = lastListMultiplier
          break;
        }
      }

        //if the currMult === 0 indicates object not nested in list, simply increment complexity score
      if(this.currMult !== 0) {
        this.typeComplexity += this.currMult * baseVal + argumentCosts;
      } else {
        this.typeComplexity+= baseVal + argumentCosts;
      }
        this.resolveComplexity++;
    }
  }

  resolveUnionTypes(fieldType: GraphQLUnionType) {
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

      for(let i = this.parentTypeStack.length-1; i > 0; i--) {
        if(this.parentTypeStack[i].isList === true) {
          console.log('Union type is nested within a list/lists');
          containedMult = containedMult * this.parentTypeStack[i].currMult;
          console.log(`The original multiplier of ${containedMult} has been updated to the multiplier of the most recent ancestor list, ${this.parentTypeStack[i].currMult}`)
          break;
        }
      }

      console.log('This is the main type', containedType)

      if(!containedType.astNode) return;

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
                  ele.cost += (Number(argument.value) * containedMult);
                  }
                }
              })
            })
          }
        })
      })

    })
    console.log('cost associations post-resolution', costAssociation);
    return costAssociation;
  }

  parseArgumentDirectives(fieldDef: GraphQLField<unknown, unknown, any>) {
    if(!fieldDef.astNode?.arguments) return

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
  }

  parseDirectives(fieldDef: GraphQLField<unknown, unknown, any>, baseVal: number) {
    if(!fieldDef.astNode?.directives) return {costDirective: baseVal, paginationLimit: null};

    const directives = this.getDirectives(fieldDef.astNode.directives);

    if(!directives.length) return {costDirective: baseVal, paginationLimit: null};

    const costPaginationDirectives = this.getCostDirectives(directives, baseVal);

    if(costPaginationDirectives?.costDirective) baseVal = costPaginationDirectives.costDirective;

    return {costDirective: baseVal, paginationLimit: costPaginationDirectives?.paginationLimit};
  }

  getDirectives(astNodeDirectives: readonly graphql.ConstDirectiveNode[]) {
    const directives: DirectivesInfo[] = astNodeDirectives.map(directives => ({
      name: directives.name,
      arguments: directives.arguments as readonly graphql.ConstArgumentNode[]
    }))

    return directives;
  }

  getCostDirectives(directives: DirectivesInfo[], baseVal: number) {
    if(!directives.length) return

    let listLimit = 0;

    for(let i = 0; i < directives.length; i++) {
      const costPaginationDirectives: PaginationDirectives[] = directives[i].arguments?.map((arg: any) => ({
        name: directives[i].name.value,
        value: arg.value
      }))

      costPaginationDirectives.forEach((directives: PaginationDirectives) => {
        if(directives.name === 'cost' && directives.value) baseVal = directives.value.value;
        if(directives.name === 'paginationLimit' && directives.value) listLimit = directives.value;
      })
    }

    console.log('This is the value of baseVal after accounting for directives', baseVal);
    console.log('This is the paginationLimit assigned by the directives', listLimit);

    return {costDirective: baseVal, paginationLimit: listLimit}
  }

}

//end of class

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

      let requestIP = req.ip

      // fixes format of ip addresses
      if (requestIP.includes('::ffff:')) {
        requestIP = requestIP.replace('::ffff:', '');
      }

      const analysis = new ComplexityAnalysis(builtSchema, parsedAst, config);

      const complexityScore = analysis.traverseAST();

      console.log('This is the type complexity', complexityScore.typeComplexity);
      console.log('This is the resolve complexity', complexityScore.resolveComplexity);
      console.log('This is the complexity score:', complexityScore.complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      //if(config.monitor === true) {
        res.locals.complexityScore = complexityScore;
        res.locals.complexityLimit = config.complexityLimit;
      //   return next();
      // }

      // if the user wants to use redis, a redis client will be created and used as a cache
      if (config.redis === true) {
        await cache.redis(config, complexityScore.complexityScore, req, res, next)
      }
      // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
      else if (config.redis !== true) {
        tokenBucket = cache.nonRedis(config, complexityScore.complexityScore, tokenBucket, req)

        if (complexityScore.complexityScore >= tokenBucket[requestIP].tokens) {
          console.log('Complexity of this query is too high');
          return next(Error);
        }
        console.log('Tokens before subtraction: ', tokenBucket[requestIP].tokens)
        tokenBucket[requestIP].tokens -= complexityScore.complexityScore;
        console.log('Tokens after subtraction: ', tokenBucket[requestIP].tokens)
      }

    };
  return next();
  }
}
export default rateLimiter;