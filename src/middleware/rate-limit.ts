import { Request, Response, NextFunction } from 'express';
import {
  buildSchema,
  isAbstractType,
  GraphQLInterfaceType,
  isNonNullType,
  GraphQLType,
  GraphQLField,
  parse,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  StringValueNode,
  getNamedType,
  GraphQLNamedType,
  getEnterLeaveForKind,
  GraphQLCompositeType,
  getNullableType,
  Kind,
  isListType,
  DocumentNode,
  DirectiveLocation,
  GraphQLUnionType,
  GraphQLNamedOutputType,
  getDirectiveValues,
  isCompositeType,
  GraphQLError,
  FragmentDefinitionNode,
  isInterfaceType,
  isUnionType,
  DefinitionNode,
  OperationDefinitionNode,
  isObjectType,
} from 'graphql';
import graphql from 'graphql';
import fetch from 'node-fetch';
import expressCache from './express-cache.js';
import apolloCache from './apollo-cache.js';
import { TimeSeriesAggregationType } from 'redis';

//To-dos

//Resolve Relay convention breaking analysis <= check later
//Resolve argument calls nested in list casing => should be resolved
//Do some work with variables
//Take into account @skip directives

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

//start of class

class ComplexityAnalysis {

  private config: any;
  private schema: GraphQLSchema;
  private parsedAst: DocumentNode;
  private currMult: number = 1;
  private complexityScore = 0;
  private typeComplexity = 0;
  private variables: any;
  private slicingArgs: string[] = ['limit', 'first', 'last']
  private allowedDirectives: string[] = ['skip', 'include']
  private excessDepth: boolean = false;
  private defaultPaginationLimit: number = 10;
  private defaultDepthLimit: number = 10;
  private depth: number = 1;

  constructor(schema: GraphQLSchema, parsedAst: DocumentNode, config: any, variables: any) {
    this.config = config;
    this.parsedAst = parsedAst;
    this.schema = schema
    this.variables = variables;
    this.defaultPaginationLimit = this.config.paginationLimit
    this.defaultDepthLimit = this.config.maxDepth
  }

  traverseAST () {
    console.log('in traverseAST');
    if (this.parsedAst) {

      console.log('This is the current currMult', this.currMult)

      const schemaType = new TypeInfo(this.schema)

      visit(this.parsedAst, visitWithTypeInfo(schemaType, {
        //use arrow function here within higher-order function in order to allow access to surrounding scope
        enter: (node, key, parent,  path, ancestors) => {

          if(node.kind === Kind.DOCUMENT) {
          console.log('ENTERING DOCUMENT NODE');
          console.log('DOCUMENT NODE', node);
          //casing for fragment definition, need to maintain parentTypeStack, and acknowledge fragDef exists
          //but otherwise disregard

          let baseMult = 1;

          const fragDefStore: Record<string, any> = {};

          for(let i = 0; i < node.definitions.length; i++) {
            const def = node.definitions[i] as DefinitionNode;
            if(def.kind === 'FragmentDefinition'){
              console.log('INSIDE FRAGMENT DEFINITIONS')
              let selectionSet;
              const fragDef = def as FragmentDefinitionNode;
              const typeCondition = fragDef.typeCondition.name.value
              const type = this.schema.getType(typeCondition);
              selectionSet = fragDef.selectionSet;
              const fragDepthState = {exceeded: false, depth: this.depth};
              const fragDepth = this.checkDepth(selectionSet, fragDepthState);
              if(fragDepthState.exceeded) {
                console.log('exceeded maximum user-defined depth on fragment def')
                this.excessDepth = true;
                return;
              }
              const totalFragCost = this.resolveSelectionSet(selectionSet, type, schemaType, baseMult, [node], node, fragDefStore);
              fragDefStore[typeCondition] = {totalFragCost, fragDepth};
            }
          }

          console.log('fragment spread costs?', fragDefStore);

          for(let i = 0; i < node.definitions.length; i++) {
            const def = node.definitions[i] as DefinitionNode;
            if(def.kind === 'OperationDefinition'){
              let selectionSet;
              const operationDef = def as OperationDefinitionNode;
              const operationType = operationDef.operation;
              const rootType = this.schema.getQueryType();
              if(operationType === 'query') selectionSet = operationDef.selectionSet;
              // console.log('selectionSet?', selectionSet)
              const queryDepthState = {exceeded: false, depth: this.depth};
              const queryDepth = this.checkDepth(selectionSet, queryDepthState)
              if(queryDepthState.exceeded) {
                console.log('exceeded maximum user-defined depth on query')
                this.excessDepth = true;
                return;
              }
              this.depth = queryDepthState.depth;
              const totalCost = this.resolveSelectionSet(selectionSet, rootType, schemaType, baseMult, [node], node, fragDefStore)
              this.typeComplexity += totalCost;
            }
          }
          //must create interface casing, grabbing implememting types if fragment spreads are used to query an interface
          //TO-DO
            }
          },
    }))
  }

    this.complexityScore = this.typeComplexity;

    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity, excessDepth: this.excessDepth, depth: this.depth};
  }

  private resolveSelectionSet(selectionSet: any, objectType: any, schemaType: TypeInfo, mult: number = 1, ancestors : any[], document: DocumentNode, fragDefs: Record<string, any>) {
    console.log('inside resolveSelectionSet')
    console.log('mult of current selectionSet?', mult);
    let cost = 0;
    const fragStore: Record<string, number> = {};
    // console.log('ancestors?', ancestors);

    selectionSet.selections.forEach((selection: any) => {

      if(selection.kind === Kind.FRAGMENT_SPREAD) {
        let fragSpreadMult = mult;
        let fragSpreadCost = 0;
        const fragName = selection.name.value;
        console.log('This is the node:', fragName);
        //@ts-ignore

        // console.log('doc?', document);
        const fragDef = document?.definitions.find(def => def.kind === 'FragmentDefinition' && def.name.value === fragName);
        // console.log('fragDef?', fragDef);
        //@ts-ignore
        if(!fragDef) return;
        //@ts-ignore
        const typeName = fragDef.typeCondition.name.value;
        if(fragDefs[typeName]) fragSpreadCost = fragDefs[typeName].totalFragCost;

        fragStore[fragName] = fragSpreadCost * fragSpreadMult;
        console.log('fragSpreadCost?', fragSpreadCost);
      }

      if(selection.kind === Kind.INLINE_FRAGMENT) {
        console.log('ancestors in inline-frag?', ancestors)
        //need to resolve in-line fragments within an interface
        //some casing here is causing it to fully aggregate the cost of the potential interface resolutions
        //rather than picking the largest
        const typeName = selection.typeCondition.name.value;
        const type = this.schema.getType(typeName);

        ancestors.push(selection)

        const fragCost = this.resolveSelectionSet(selection.selectionSet, type, schemaType, mult, ancestors, document, fragDefs);
        fragStore[typeName] = fragStore[typeName] || 0;
        fragStore[typeName] = fragCost;

        ancestors.pop()
      }

      if(selection.kind === Kind.FIELD) {
        const fieldName = selection.name.value;
        let checkSkip: Record<string, number | boolean> | undefined;
        let skip: boolean = false;

        // This correctly retrieves values for cost argument, just need to case so that it only runs
        // if the variable is actually populated then otherwise does other stuff, also probably
        // move to helper function
        if(this.variables) {
          checkSkip = this.checkSkip(selection);
        }

        console.log('name of node?', fieldName);
        console.log('CHECK SKIP?', checkSkip);
        let newMult = mult;

        const fieldDef = objectType.getFields()[fieldName];
        if(!fieldDef) return;
        const fieldType = fieldDef.type;
        const nullableType = getNullableType(fieldType);
        const unwrappedType = getNamedType(fieldType);
        const subSelection = selection.selectionSet
        const slicingArguments = this.parseSlicingArguments(selection)
        let argCosts;

        if(slicingArguments && slicingArguments.length) {
          argCosts = this.parseArgumentDirectives(fieldDef, slicingArguments)
        }

        if(checkSkip && (checkSkip.skip === true || checkSkip.include === false)) skip = true;
        // console.log('fieldType?', fieldType)
        const costDirective = this.parseDirectives(fieldDef, 0);
        if(argCosts && argCosts.length) cost += Number(argCosts[0].directiveValue) * mult

        console.log('SKIP???', skip)

        if(skip === false) costDirective.costDirective ? cost += Number(costDirective.costDirective) * mult : cost += mult;
        // console.log('type of argCosts', typeof argumentCosts);
        if(isListType(nullableType)) costDirective.paginationLimit ? newMult *= costDirective.paginationLimit : newMult *= this.defaultPaginationLimit
        if(isListType(nullableType) && slicingArguments.length) slicingArguments[0].argumentValue ? newMult = mult * slicingArguments[0].argumentValue : newMult = newMult;
        console.log('newMult?', newMult)


        if(subSelection && (isInterfaceType(unwrappedType) || isObjectType(unwrappedType)) || isUnionType(unwrappedType)) {
          const types = isInterfaceType(unwrappedType) || isUnionType(unwrappedType) ? this.schema.getPossibleTypes(unwrappedType) : [unwrappedType];
          const store: Record<string, number> = {};
          ancestors.push(objectType);
          if(isInterfaceType(unwrappedType)) console.log('SUBSELECTION:', subSelection);

          // console.log('implementingTypes?', types)
          types.forEach(type => {
            console.log('CURRENT STORE STATE:', store);
            store[type.name] = store[type.name] || 0;
            store[type.name] = Math.max(store[type.name], this.resolveSelectionSet(subSelection, type, schemaType, newMult, ancestors, document, fragDefs));
            // store[type.name] += this.resolveSelectionSet(subSelection, type, schemaType, newMult, ancestors, document, fragDefs)
          })

          console.log('internal store?', store);
          const maxInterface = Object.values(store).reduce((a, b) => Math.max(a, b));
          cost += maxInterface;

          ancestors.pop();
        }
      }
    })

    console.log(fragStore);
    if(Object.values(fragStore).length) cost += Object.values(fragStore).reduce((a, b) => Math.max(a, b));

    return cost;
  }

  private checkDepth(selection: any, state: { exceeded: boolean, depth: number }, depth: number = 1, limit: number = this.defaultDepthLimit) {
    if (state.exceeded) {
      return;
    }

    if (depth > limit) {
      console.log('fragment or query depth exceeds limit defined by user configuration, blocking query');
      state.depth = depth;
      state.exceeded = true;
      return;
    }

    const selectionSet = selection.selections;
    selectionSet.forEach((selection: any) => {
      // console.log('DEPTH LIMIT?', limit)
      if (selection.selectionSet) {
        state.depth = depth;
        this.checkDepth(selection.selectionSet, state, depth + 1, limit);
      }
    });
  }

  private checkSkip(selection: any) {
    let variables: Record<string, number | boolean> = {};

    if(!selection.directives.length) return;

    for (let i = 0; i < selection.directives.length; i++) {
      console.log('IN NODE DIRECTIVES FOR LOOP')
      const directive = selection.directives[i];
      const directiveName = directive.name.value;

      if(!this.allowedDirectives.includes(directiveName)) continue;

      const directiveArguments = directive.arguments;
      // console.log('NODE DIRECTIVE ARGUMENTS', directiveArguments);

      if(!directiveArguments.length) continue;
      if(directiveArguments[0].value.kind !== 'Variable') continue;

      const variable = directiveArguments[0].value.name.value;
      console.log('VARIABLE NAME?', variable);
      console.log('VARIABLE STORE?', this.variables)
      if(this.variables[variable] === undefined) {
        console.log('There is no association in the variable object with for the variable:', variable);
        continue;
      }

      console.log('VARIABLE????', this.variables, 'VARIABLE VALUE????', this.variables[variable]);

      if(directiveName === 'skip') variables[directiveName] = this.variables[variable];
      if(directiveName === 'include') variables[directiveName] = this.variables[variable];
    }

    console.log('FINAL VARIABLES DETECTED?', variables)
    return variables;
  }

  private parseSlicingArguments(selection: any) {
    // console.log('SELECTION?', selection)
    if(!selection.arguments) return;

    const argumentDirectives = selection.arguments.flatMap((arg: any) => {
      const argName = arg.name.value;
      let argValue = arg.value.value;
      if(arg.value.kind === 'Variable') {
        console.log('variable argument detected:', arg.value);
        if(this.variables) argValue = this.variables[arg.value.name.value]
      }
      return {
        argumentName: argName,
        argumentValue: argValue
      };
    })

    console.log('ARGVARDIRECTIVES???', argumentDirectives)

    return argumentDirectives.filter((arg: any) => {
      if(!this.slicingArgs.includes(arg.argumentName)) {
        console.log('not a slicing arg')
        return;
      }
      return arg;
    })
  }

  private parseArgumentDirectives(fieldDef: GraphQLField<unknown, unknown, any>, args: any[]) {
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
      const argumentCosts = argumentDirectives.filter((directive: any, index) => (directive.directiveName === 'cost' && args[index].argumentName === directive.argName));
      console.log('arg costs', argumentCosts);
      return argumentCosts;
  }

  private parseDirectives(fieldDef: GraphQLField<unknown, unknown, any>, baseVal: number) {
    if(!fieldDef.astNode?.directives) return {costDirective: baseVal, paginationLimit: null};

    const directives = this.getDirectives(fieldDef.astNode.directives);

    if(!directives.length) return {costDirective: baseVal, paginationLimit: null};

    const costPaginationDirectives = this.getCostDirectives(directives, baseVal);

    if(costPaginationDirectives?.costDirective) baseVal = costPaginationDirectives.costDirective;

    return {costDirective: baseVal, paginationLimit: costPaginationDirectives?.paginationLimit};
  }

  private getDirectives(astNodeDirectives: readonly graphql.ConstDirectiveNode[]) {
    const directives: DirectivesInfo[] = astNodeDirectives.map(directives => ({
      name: directives.name,
      arguments: directives.arguments as readonly graphql.ConstArgumentNode[]
    }))

    return directives;
  }


  private getCostDirectives(directives: DirectivesInfo[], baseVal: number) {
    if(!directives.length) return

    let listLimit = 0;

    for(let i = 0; i < directives.length; i++) {
      const costPaginationDirectives: PaginationDirectives[] = directives[i].arguments?.map((arg: any) => ({
        name: directives[i].name.value,
        value: arg.value
      }))

      costPaginationDirectives.forEach((directives: PaginationDirectives) => {
        if(directives.name === 'cost' && directives.value) baseVal = directives.value.value;
        if(directives.name === 'paginationLimit' && directives.value) listLimit = directives.value.value;
      })
    }

    console.log('This is the value of baseVal after accounting for directives', baseVal);
    console.log('This is the paginationLimit assigned by the directives', listLimit);

    return {costDirective: baseVal, paginationLimit: listLimit}
  }

}

//end of class

// helper function to send data to web-app
const sendData = async (endpointData: any) => {
  console.log('Monitor data: ', endpointData)
  try {
    const response = await fetch('http://localhost:3000/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpointData)
    });
    const data = await response.json();
  }
  catch {
    console.log('Unable to save to database')
  }
}

const expressRateLimiter = function (config: any) {

  let tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {
      const builtSchema = config.schema
      const parsedAst = parse(req.body.query)

      let variables;
      if(req.body.variables) variables = req.body.variables;

      let requestIP = req.ip

      // fixes format of ip addresses
      if (requestIP.includes('::ffff:')) {
        requestIP = requestIP.replace('::ffff:', '');
      }

      const analysis = new ComplexityAnalysis(builtSchema, parsedAst, config, variables);

      const complexityScore = analysis.traverseAST();

      console.log('This is the type complexity', complexityScore.typeComplexity);
      console.log('This is the complexity score:', complexityScore.complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      res.locals.complexityScore = complexityScore;
      res.locals.complexityLimit = config.complexityLimit;

      // if the user wants to use redis, a redis client will be created and used as a cache
      if (config.redis === true) {
        await expressCache.redis(config, complexityScore.complexityScore, req, res, next)
      }
      // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
      else if (config.redis !== true) {
        tokenBucket = expressCache.nonRedis(config, complexityScore.complexityScore, tokenBucket, req)
        if (complexityScore.complexityScore >= tokenBucket[requestIP].tokens || complexityScore.excessDepth === true) {
          if (res.locals.gleiphqlData) {
            res.locals.gleiphqlData.blocked = true
            res.locals.gleiphqlData.complexityLimit = config.complexityLimit
            res.locals.gleiphqlData.complexityScore = complexityScore
            res.locals.gleiphqlData.depth = complexityScore.depth
            sendData(res.locals.gleiphqlData)
          }
          const error = {
            errors: [
              {
                message: `Token limit exceeded`,
                extensions: {
                  cost: {
                    requestedQueryCost: complexityScore.complexityScore,
                    requestedQueryDepth: (complexityScore.depth + 1),
                    currentTokensAvailable:  Number(tokenBucket[requestIP].tokens.toFixed(2)),
                    maximumTokensAvailable: config.complexityLimit,
                    queryDepthLimit: config.maxDepth,
                  },
                  responseDetails: {
                    status: 429,
                    statusText: 'Too Many Requests',
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
        tokenBucket[requestIP].tokens -= complexityScore.complexityScore;
        console.log('Tokens after subtraction: ', tokenBucket[requestIP].tokens)
        if (res.locals.gleiphqlData) {
          res.locals.gleiphqlData.complexityLimit = config.complexityLimit
          res.locals.gleiphqlData.complexityScore = complexityScore
          res.locals.gleiphqlData.depth = complexityScore.depth
          sendData(res.locals.gleiphqlData)
        }
      }
    };
  return next();
  }
}

const apolloRateLimiter = (config: any) => {

  let tokenBucket: TokenBucket = {};
  return {
    async requestDidStart(requestContext: any) {
      return {
        async didResolveOperation(requestContext: any) {
          if (requestContext.operationName !== 'IntrospectionQuery') {
            console.log('Validation started!');
            const variables = requestContext.variables;
            const builtSchema = requestContext.schema
            const parsedAst = requestContext.document
            config.requestContext = requestContext
            let requestIP = requestContext.contextValue.clientIP

            // fixes format of ip addresses
            if (requestIP.includes('::ffff:')) {
              requestIP = requestIP.replace('::ffff:', '');
            }

            const analysis = new ComplexityAnalysis(builtSchema, parsedAst, config, variables);

            const complexityScore = analysis.traverseAST();
            requestContext.contextValue.complexityScore = complexityScore
            requestContext.contextValue.complexityLimit = config.complexityLimit
            requestContext.contextValue.depth = {depth: complexityScore.depth, excessDepth: complexityScore.excessDepth}
            console.log('This is the type complexity', complexityScore.typeComplexity);
            console.log('This is the complexity score:', complexityScore.complexityScore);

            // if the user wants to use redis, a redis client will be created and used as a cache
            if (config.redis === true) {
              await apolloCache.redis(config, complexityScore.complexityScore, requestContext)
            }
            // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
            else if (config.redis !== true) {
              tokenBucket = apolloCache.nonRedis(config, complexityScore.complexityScore, tokenBucket)

              if (complexityScore.complexityScore >= tokenBucket[requestIP].tokens || complexityScore.excessDepth === true) {
                requestContext.contextValue.blocked = true
                console.log('Complexity of this query is too high');
                throw new GraphQLError('Complexity of this query is too high', {
                  extensions: {
                    cost: {
                      requestedQueryCost: complexityScore.complexityScore,
                      requestedQueryDepth: (complexityScore.depth + 1),
                      currentTokensAvailable:  Number(tokenBucket[requestIP].tokens.toFixed(2)),
                      maximumTokensAvailable: config.complexityLimit,
                      queryDepthLimit: config.maxDepth,
                    }
                  },
                });

              }
              console.log('Tokens before subtraction: ', tokenBucket[requestIP].tokens)
              tokenBucket[requestIP].tokens -= complexityScore.complexityScore;
              console.log('Tokens after subtraction: ', tokenBucket[requestIP].tokens)
            }
          }
        },
      };
    },
  }
};

const gleiphqlContext = async ({ req }: { req: Request }) => {
  const clientIP =
    req.headers['x-forwarded-for'] || // For reverse proxies
    req.socket.remoteAddress;
  return { clientIP };
}

export { expressRateLimiter, apolloRateLimiter, gleiphqlContext }