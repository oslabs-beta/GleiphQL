import { Request, Response, NextFunction } from 'express';
import { buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation } from 'graphql';
import graphql from 'graphql';
import { useSchema } from 'graphql-yoga';
import { createClient } from 'redis';
import cache from './cache.js';


//to-dos
//modularize code, certain functions can be offloaded
//generate casing for mutations/subscriptions
//implement support for resolvers => check if resolvers are saved in schema => should be in okay state => need to figure out if resolver cost can be separated
//fix typescript typing issues, define interfaces for complex object types passed to helper functions
//attempt to refactor the class, to handle modularization of interdependent data structures using class state

//unimplemented class shell

class ComplexityAnalysis {

  private parentTypeStack: any[] = [];
  private currMult: number = 0;
  private complexityScore = 0;
  private typeComplexity = 0;
  private resolveComplexity = 0;

  constructor(private config: any) { }

  complexityAnalysis(req: Request, res: Response, next: NextFunction) {
    if (req.body.query) {
      const schemaType = new TypeInfo(this.config.schema);
      const parsedAst = parse(req.body.query)
    }
  }

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
  }
  return 
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
        costPaginationDirectives.find((costDirective: PaginationDirectives) => {
          if(costDirective.name === 'cost' && costDirective.value){
            baseVal = costDirective.value.value;
          }
        })

        costPaginationDirectives.find((paginationLimit: PaginationDirectives) => {
          if(paginationLimit.name === 'paginationLimit' && paginationLimit.value){
            listLimit = paginationLimit.value
          }
        })
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

      const schemaType = new TypeInfo(config.schema);
      const parsedAst = parse(req.body.query);

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

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {

            let baseVal = 1;
            let paginationLimit = 0;
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
            const fieldType = getNullableType(fieldDef.type);

            if(fieldDef.astNode) {
              const directiveCost = parseArgumentDirectives(fieldDef);
              // console.log('This is directive cost', directiveCost)
              if(directiveCost) {
                directiveCost.forEach((directive: any) => {
                  console.log('initial complexity score:', complexityScore);
                  complexityScore += Number(directive.directiveValue);
                  console.log('complexity score post addition', complexityScore);
                })
              }
              const directiveAdjustedBaseVal = parseDirectives(fieldDef, baseVal)
              baseVal = directiveAdjustedBaseVal.costDirective;
            }

            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            console.log('This is the currentNode:', node.name.value);
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjusts currMult accordingly
            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last' || arg.name.value === 'before' || arg.name.value === 'after'));
              currMult = config.paginationLimit;
              if(paginationLimit) currMult = paginationLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                //unclear how we want to handle this base behavior, may be best to create a default case that is editable by user
                if(argValue > paginationLimit) console.log('The passed in argument exceeds paginationLimit, define default behavior for this case')
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
          const error = {
            errors: [
              {
                message: `Token limit exceeded`,
                extensions: {
                  cost: {
                    requestedQueryCost: complexityScore,
                    currentTokensAvailable:  Number(tokenBucket[requestIP].tokens.toFixed(2)),
                    maximumTokensAvailable: config.complexityLimit,
                  },
                  responseDetails: {
                    status: 429,
                    statusText: "Too Many Requests",
                  }
                }
              }
            ]
          }
          console.log('Complexity of this query is too high');
          res.status(429).json(error);
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