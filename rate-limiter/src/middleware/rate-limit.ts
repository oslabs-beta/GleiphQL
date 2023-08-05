import { Request, Response, NextFunction } from 'express';
import { FragmentDefinitionNode, FragmentSpreadNode, buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation, GraphQLUnionType, GraphQLNamedOutputType, getDirectiveValues, isCompositeType, GraphQLOutputType, FragmentsOnCompositeTypesRule, isInterfaceType, ASTNode, isObjectType, isUnionType, DefinitionNode, OperationDefinitionNode } from 'graphql';
import graphql from 'graphql';
import cache from './cache.js';
import { SchemaTextFieldPhonetics } from 'redis';

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

  constructor(schema: GraphQLSchema, parsedAst: DocumentNode, config: any) {
    this.config = config;
    this.parsedAst = parsedAst;
    this.schema = schema
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
          //casing for fragment definition, need to maintain parentTypeStack, and acknowledge fragDef exists
          //but otherwise disregard

          let baseMult = 1;

          const fragDefStore: Record<string, number> = {};

          for(let i = 0; i < node.definitions.length; i++) {
            const def = node.definitions[i] as DefinitionNode;
            if(def.kind === 'FragmentDefinition'){
              console.log('INSIDE FRAGMENT DEFINITIONS')
              let selectionSet;
              const fragDef = def as FragmentDefinitionNode;
              const typeCondition = fragDef.typeCondition.name.value
              const type = this.schema.getType(typeCondition);
              selectionSet = fragDef.selectionSet;
              const totalFragCost = this.resolveSelectionSet(selectionSet, type, schemaType, baseMult, [node], node, fragDefStore);
              fragDefStore[typeCondition] = totalFragCost;
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

    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity};
  }

  private resolveSelectionSet(selectionSet: any, objectType: any, schemaType: TypeInfo, mult: number = 1, ancestors : any[], document: DocumentNode, fragDefs: Record<string, number>) {
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
        if(fragDefs[typeName]) fragSpreadCost = fragDefs[typeName];

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
        console.log('name of node?', fieldName);
        const fieldDef = objectType.getFields()[fieldName];
        const costDirective = this.parseDirectives(fieldDef, 0);
        const argumentCosts = this.parseArgumentDirectives(fieldDef);
        const fieldType = fieldDef.type;
        const nullableType = getNullableType(fieldType);
        const unwrappedType = getNamedType(fieldType);
        // console.log('fieldType?', fieldType)
        const subSelection = selection.selectionSet
        cost += Number(costDirective.costDirective) * mult;
        // console.log('type of argCosts', typeof argumentCosts);

        let newMult = mult;
        if(isListType(nullableType)) costDirective.paginationLimit ? newMult *= costDirective.paginationLimit : newMult *= this.config.paginationLimit

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

  private parseArgumentDirectives(fieldDef: GraphQLField<unknown, unknown, any>) {
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


const rateLimiter = function (config: any) {

  let tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      const builtSchema = buildSchema(config.schema)
      const parsedAst = parse(req.body.query);

      let requestIP = req.ip

      // fixes format of ip addresses
      if (requestIP.includes('::ffff:')) {
        requestIP = requestIP.replace('::ffff:', '');
      }

      const analysis = new ComplexityAnalysis(builtSchema, parsedAst, config);

      const complexityScore = analysis.traverseAST();

      console.log('This is the type complexity', complexityScore.typeComplexity);
      console.log('This is the complexity score:', complexityScore.complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      res.locals.complexityScore = complexityScore;
      res.locals.complexityLimit = config.complexityLimit;

      // if the user wants to use redis, a redis client will be created and used as a cache
      if (config.redis === true) {
        await cache.redis(config, complexityScore.complexityScore, req, res, next)
      }
      // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
      else if (config.redis !== true) {
        tokenBucket = cache.nonRedis(config, complexityScore.complexityScore, tokenBucket, req)
        const error = {
          errors: [
            {
              message: `Token limit exceeded`,
              extensions: {
                cost: {
                  requestedQueryCost: complexityScore.complexityScore,
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

        if (complexityScore.complexityScore >= tokenBucket[requestIP].tokens) {

          console.log('Complexity of this query is too high');
          res.status(429).json(error);
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