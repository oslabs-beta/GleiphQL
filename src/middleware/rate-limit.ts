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
import { infoPrefix } from 'graphql-yoga';

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
    if (this.parsedAst) {

      const schemaType = new TypeInfo(this.schema)

      //traverse selection sets propagating from document node

      visit(this.parsedAst, visitWithTypeInfo(schemaType, {
        enter: (node, key, parent,  path, ancestors) => {

          if(node.kind === Kind.DOCUMENT) {

          let baseMult = 1;

          const fragDefStore: Record<string, any> = {};

          //define cost of fragment spreads

          for(let i = 0; i < node.definitions.length; i++) {
            const def = node.definitions[i] as DefinitionNode;
            if(def.kind === 'FragmentDefinition'){
              let selectionSet;
              const fragDef = def as FragmentDefinitionNode;
              const typeCondition = fragDef.typeCondition.name.value
              const type = this.schema.getType(typeCondition);
              selectionSet = fragDef.selectionSet;
              const fragDepthState = {exceeded: false, depth: this.depth};
              const fragDepth = this.checkDepth(selectionSet, fragDepthState);
              if(fragDepthState.exceeded) {
                this.excessDepth = true;
                return;
              }
              const totalFragCost = this.resolveSelectionSet(selectionSet, type, schemaType, baseMult, [node], node, fragDefStore);
              fragDefStore[typeCondition] = {totalFragCost, fragDepth};
            }
          }


          for(let i = 0; i < node.definitions.length; i++) {
            const def = node.definitions[i] as DefinitionNode;
            if(def.kind === 'OperationDefinition'){
              let selectionSet;
              const operationDef = def as OperationDefinitionNode;
              const operationType = operationDef.operation;
              const rootType = this.schema.getQueryType();
              if(operationType === 'query') selectionSet = operationDef.selectionSet;
              const queryDepthState = {exceeded: false, depth: this.depth};
              const queryDepth = this.checkDepth(selectionSet, queryDepthState)
              if(queryDepthState.exceeded) {
                this.excessDepth = true;
                return;
              }
              this.depth = queryDepthState.depth;
              const totalCost = this.resolveSelectionSet(selectionSet, rootType, schemaType, baseMult, [node], node, fragDefStore)
              this.typeComplexity += totalCost;
            }
          }
            }
          },
    }))
  }

    this.complexityScore = this.typeComplexity;

    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity, excessDepth: this.excessDepth, depth: this.depth};
  }

  //helper function recursively resolves the cost of each selection set
  private resolveSelectionSet(selectionSet: any, objectType: any, schemaType: TypeInfo, mult: number = 1, ancestors : any[], document: DocumentNode, fragDefs: Record<string, any>) {

    let cost = 0;
    const fragStore: Record<string, number> = {};

    selectionSet.selections.forEach((selection: any) => {

      if(selection.kind === Kind.FRAGMENT_SPREAD) {
        let fragSpreadMult = mult;
        let fragSpreadCost = 0;
        const fragName = selection.name.value;
        //@ts-ignore
        const fragDef = document?.definitions.find(def => def.kind === 'FragmentDefinition' && def.name.value === fragName);
        //@ts-ignore
        if(!fragDef) return;
        //@ts-ignore
        const typeName = fragDef.typeCondition.name.value;
        if(fragDefs[typeName]) fragSpreadCost = fragDefs[typeName].totalFragCost;

        fragStore[fragName] = fragSpreadCost * fragSpreadMult;
      }

      if(selection.kind === Kind.INLINE_FRAGMENT) {
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

        if(this.variables) {
          checkSkip = this.checkSkip(selection);
        }

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
        const costDirective = this.parseDirectives(fieldDef, 0);
        if(argCosts && argCosts.length) cost += Number(argCosts[0].directiveValue) * mult

        if(skip === false) costDirective.costDirective ? cost += Number(costDirective.costDirective) * mult : cost += mult;
        if(isListType(nullableType)) costDirective.paginationLimit ? newMult *= costDirective.paginationLimit : newMult *= this.defaultPaginationLimit
        if(isListType(nullableType) && slicingArguments.length) slicingArguments[0].argumentValue ? newMult = mult * slicingArguments[0].argumentValue : newMult = newMult;



        if(subSelection && (isInterfaceType(unwrappedType) || isObjectType(unwrappedType)) || isUnionType(unwrappedType)) {
          const types = isInterfaceType(unwrappedType) || isUnionType(unwrappedType) ? this.schema.getPossibleTypes(unwrappedType) : [unwrappedType];
          const store: Record<string, number> = {};
          ancestors.push(objectType);

          types.forEach(type => {
            store[type.name] = store[type.name] || 0;
            store[type.name] = Math.max(store[type.name], this.resolveSelectionSet(subSelection, type, schemaType, newMult, ancestors, document, fragDefs));
          })

          const maxInterface = Object.values(store).reduce((a, b) => Math.max(a, b));
          cost += maxInterface;

          ancestors.pop();
        }
      }
    })

    if(Object.values(fragStore).length) cost += Object.values(fragStore).reduce((a, b) => Math.max(a, b));

    return cost;
  }

  //helper recursively finds the depth of fragments/queries, aborts if depth exceeds preconfigured depth limit
  private checkDepth(selection: any, state: { exceeded: boolean, depth: number }, depth: number = 2, limit: number = this.defaultDepthLimit) {
    if (state.exceeded) {
      return;
    }

    if (depth > limit + 1) {
      state.depth = depth;
      state.exceeded = true;
      return;
    }

    const selectionSet = selection.selections;
    selectionSet.forEach((selection: any) => {
      if (selection.selectionSet) {
        state.depth = depth;
        this.checkDepth(selection.selectionSet, state, depth + 1, limit);
      }
    });
  }

  //finds @skip/@include directives exposed by query and disregards fields as appropriate
  private checkSkip(selection: any) {
    let variables: Record<string, number | boolean> = {};

    if(!selection.directives.length) return;

    for (let i = 0; i < selection.directives.length; i++) {
      const directive = selection.directives[i];
      const directiveName = directive.name.value;

      if(!this.allowedDirectives.includes(directiveName)) continue;

      const directiveArguments = directive.arguments;

      if(!directiveArguments.length) continue;
      if(directiveArguments[0].value.kind !== 'Variable') continue;

      const variable = directiveArguments[0].value.name.value;
      if(this.variables[variable] === undefined) {
        continue;
      }

      if(directiveName === 'skip') variables[directiveName] = this.variables[variable];
      if(directiveName === 'include') variables[directiveName] = this.variables[variable];
    }

    return variables;
  }

  //detects and retrieves slicing arguments (first, last etc.)
  private parseSlicingArguments(selection: any) {
    if(!selection.arguments) return;

    const argumentDirectives = selection.arguments.flatMap((arg: any) => {
      const argName = arg.name.value;
      let argValue = arg.value.value;
      if(arg.value.kind === 'Variable') {
        if(this.variables) argValue = this.variables[arg.value.name.value]
      }
      return {
        argumentName: argName,
        argumentValue: argValue
      };
    })

    return argumentDirectives.filter((arg: any) => {
      if(!this.slicingArgs.includes(arg.argumentName)) {
        return;
      }
      return arg;
    })
  }

  //helper retrieves @cost directives applied to arguments
  private parseArgumentDirectives(fieldDef: GraphQLField<unknown, unknown, any>, args: any[]) {
    if(!fieldDef.astNode?.arguments) return

    const argumentDirectives = fieldDef.astNode.arguments.flatMap((arg: any) => {
      const argName = arg.name.value;
      return arg.directives?.map((directive: any) => ({
        argName,
        directiveName: directive.name.value,
        //@ts-ignore
        directiveValue: directive.arguments?.find(arg => arg.name.value === 'value')?.value.value,
        }));
      });
      const argumentCosts = argumentDirectives.filter((directive: any, index) => (directive.directiveName === 'cost' && args[index].argumentName === directive.argName));
      return argumentCosts;
  }

  //helper retrieves @cost directives applied to fields
  private parseDirectives(fieldDef: GraphQLField<unknown, unknown, any>, baseVal: number) {
    if(!fieldDef.astNode?.directives) return {costDirective: baseVal, paginationLimit: null};

    const directives = this.getDirectives(fieldDef.astNode.directives);

    if(!directives.length) return {costDirective: baseVal, paginationLimit: null};

    const costPaginationDirectives = this.getCostDirectives(directives, baseVal);

    if(costPaginationDirectives?.costDirective) baseVal = costPaginationDirectives.costDirective;

    return {costDirective: baseVal, paginationLimit: costPaginationDirectives?.paginationLimit};
  }

  //sub helper for parseDirectives
  private getDirectives(astNodeDirectives: readonly graphql.ConstDirectiveNode[]) {
    const directives: DirectivesInfo[] = astNodeDirectives.map(directives => ({
      name: directives.name,
      arguments: directives.arguments as readonly graphql.ConstArgumentNode[]
    }))

    return directives;
  }

  //sub-helper for parseDirectives
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

    return {costDirective: baseVal, paginationLimit: listLimit}
  }

}

//end of class

// helper function to send data to web-app
const sendData = async (endpointData: any) => {
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

      console.log('This is the complexity score:', complexityScore);

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
            complexityScore.excessDepth === true ? res.locals.gleiphqlData.depth =  null : res.locals.gleiphqlData.depth = complexityScore.depth
            sendData(res.locals.gleiphqlData)
          }
          const error = {
            errors: [
              {
                message: `Token limit exceeded`,
                extensions: {
                  cost: {
                    requestedQueryCost: complexityScore.complexityScore,
                    currentTokensAvailable:  Number(tokenBucket[requestIP].tokens.toFixed(2)),
                    maximumTokensAvailable: config.complexityLimit,
                    depthLimitExceeded: complexityScore.excessDepth,
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
          console.log('Complexity or depth of this query is too high');
          res.status(429).json(error);
          return next(Error);
        }
        tokenBucket[requestIP].tokens -= complexityScore.complexityScore;
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
            console.log('This is the complexity score:', complexityScore);

            // if the user wants to use redis, a redis client will be created and used as a cache
            if (config.redis === true) {
              await apolloCache.redis(config, complexityScore.complexityScore, requestContext)
            }
            // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
            else if (config.redis !== true) {
              tokenBucket = apolloCache.nonRedis(config, complexityScore.complexityScore, tokenBucket)

              if (complexityScore.complexityScore >= tokenBucket[requestIP].tokens || complexityScore.excessDepth === true) {
                requestContext.contextValue.blocked = true
                if (complexityScore.excessDepth === true) requestContext.contextValue.excessDepth = true 
                console.log('Complexity or depth of this query is too high');
                throw new GraphQLError('Complexity or depth of this query is too high', {
                  extensions: {
                    cost: {
                      requestedQueryCost: complexityScore.complexityScore,
                      currentTokensAvailable:  Number(tokenBucket[requestIP].tokens.toFixed(2)),
                      maximumTokensAvailable: config.complexityLimit,
                      depthLimitExceeded: complexityScore.excessDepth,
                      queryDepthLimit: config.maxDepth,
                    }
                  },
                });

              }
              tokenBucket[requestIP].tokens -= complexityScore.complexityScore;
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