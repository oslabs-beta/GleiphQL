import { Request, Response, NextFunction } from 'express';
import { FragmentDefinitionNode, FragmentSpreadNode, buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation, GraphQLUnionType, GraphQLNamedOutputType, getDirectiveValues, isCompositeType, GraphQLOutputType, FragmentsOnCompositeTypesRule, isInterfaceType, ASTNode, isObjectType, isUnionType, DefinitionNode, OperationDefinitionNode } from 'graphql';
import graphql from 'graphql';
import cache from './cache.js';
import { SchemaTextFieldPhonetics } from 'redis';

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

      const interfaceTestQuery1 = `
      query {
        search {
          ... on Author {
            id
            name
          }
          ... on Book {
            id
            name
          }
        }
      }
      `

    const interfaceTestQuery2 = `
    query {
      search {
        ... on Searchable {
          id
          name
        }
      }
    }
    `
      const testSDLPolymorphism = `
      directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
      directive @paginationLimit(value: Int) on FIELD_DEFINITION

      interface Searchable {
        id: ID!
        name: String
      }

      type Author implements Searchable {
        id: ID! @cost(value: 1)
        name: String @cost(value: 200)
        books: [Book] @cost(value: 3)
      }

      type Book implements Searchable {
        id: ID! @cost(value: 1)
        name: String @cost(value: 2)
        author: Author @cost(value: 3)
      }

      union SearchResult = Author | Book

      type Query {
        authors: [Author] @cost(value: 2)
        books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
        search: [Searchable]
      }
`

//doesn't work, I assume the isInterface behavior might be overwriting isList, causing the mults to not be properly conserved

const testQueryPolymorphism3 = `
query {
  content {
    ... on Post {
      id
      title
      body
      tags
    }

    ... on Image {
     id
     title
     uri
    }
  }
}
`

const testQueryPolymorphism4 = `

fragment postFields on Post {
  id
  title
  body
  tags
  related {
    content {
      id
      title
    }
  }
}

fragment imageFields on Image {
  id
  title
  uri
  related {
    content {
      id
      title
    }
  }
}

query {
  content {
    ...postFields
    ...imageFields
  }
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

      const testQueryInlineFrag = `
      query {
        books(limit: 4) {
          id
          title
          author {
            ... on Author {
              name
            }
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
//Resolve polymorphism of union/interface types => close to resolution

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

//further to-dos

//modularize code, certain functions can be offloaded => mostly done
//generate casing for mutations/subscriptions => haha maybe later
//implement support for resolvers => check if resolvers are saved in schema => should be in okay state => need to figure out if resolver cost can be separated
//fix typescript typing issues, define interfaces for complex object types passed to helper functions
//attempt to refactor the class, to handle modularization of interdependent data structures using class state => mostly done
//fix casing for argument implementation costs, need to multiply said cost with nestedLists, can possibly be resolved by simply coupling argumentCosts with baseVal
//ensure that inline-fragments are appropriately handled
//resolve calling for lists of unions


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
  isUnion: boolean,
  isInterface: boolean,
}

interface ParentTypeFragDef {
  isFragDef: boolean;
}

//start of class

class ComplexityAnalysis {

  private config: any;
  private schema: GraphQLSchema;
  private parsedAst: DocumentNode;
  private parentTypeStack: any[] = [];
  private currMult: number = 1;
  private complexityScore = 0;
  private typeComplexity = 0;
  //resolve complexity will soon be defunct
  private resolveComplexity = 0;
  private interfaceStore: any[] = [];
  private unionStore: any[] = [];
  private queriedTypes: any[] = [];
  private fragDefs: Record<string, number> = {};

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

          //All the things related to a field being nested in something are resolved
          // const subUnionType = this.hasUnionAncestor();
          // const subInterfaceType = this.hasInterfaceAncestor();
          // const subFragType = this.hasFragSpreadAncestor();
          // const subList = this.hasListAncestor();

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
              console.log('totalCost?', totalCost);
            }
          }

          //must create interface casing, grabbing implememting types if fragment spreads are used to query an interface
          //TO-DO
            }
          },
        leave:(node) => {
        }
    }))
  }

    this.complexityScore = this.typeComplexity + this.resolveComplexity;

    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity, resolveComplexity: this.resolveComplexity};
  }

  resolveSelectionSet(selectionSet: any, objectType: any, schemaType: TypeInfo, mult: number = 1, ancestors : any[], document: DocumentNode, fragDefs: Record<string, number>) {
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

  // resolveParentTypeStack(isList: boolean, argumentCosts: number, baseVal: number) {
  //   if(isList === true) {
  //     console.log('list casing handled?')

  //   } else {

  //     console.log('Resolving typeStack for non-list')
  //     for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
  //       if(this.parentTypeStack[i].isList === true) {
  //         const lastListMultiplier = this.parentTypeStack[i].currMult;
  //         this.resolveComplexity += lastListMultiplier;
  //         this.resolveComplexity--;
  //         this.currMult = lastListMultiplier
  //         break;
  //       }
  //     }

  //       //if the currMult === 1 indicates object not nested in list, simply increment complexity score
  //     if(this.currMult !== 1) {
  //       this.typeComplexity += this.currMult * baseVal + argumentCosts;
  //     } else {
  //       this.typeComplexity+= baseVal + argumentCosts;
  //     }
  //       this.resolveComplexity++;
  //   }
  // }

  // resolveUnionTypes(fieldType: GraphQLUnionType, paginationLimit: number | null, isList: boolean) {
  //   //modularize code
  //   //add resolution for union of unions if possible, exists but potentially anti-pattern
  //   console.log('Is union a list?', isList);
  //   console.log('If there is a list, is there pagination limit defined?', paginationLimit);
  //   const unionTypes = this.schema.getPossibleTypes(fieldType);
  //   const costAssociation = unionTypes.map(containedType => {
  //     return {
  //       name: containedType.name, cost: 0, containedMult: 0
  //     }
  //   })

  //   console.log('storage object pre-resolution', costAssociation)

  //   unionTypes.forEach(containedType => {

  //     let containedMult = 1;
  //     if(paginationLimit) containedMult *= paginationLimit;

  //     for(let i = this.parentTypeStack.length-1; i > 0; i--) {
  //       if(this.parentTypeStack[i].isList === true) {
  //         console.log('Union type is nested within a list/lists');
  //         containedMult = containedMult * this.parentTypeStack[i].currMult;
  //         console.log(`The original multiplier of ${containedMult} has been updated to the multiplier of the most recent ancestor list, ${this.parentTypeStack[i].currMult}`)
  //         break;
  //       }
  //     }

  //     costAssociation.forEach(ele => {
  //       ele.containedMult = containedMult;
  //     })

  //     console.log('This is the main type', containedType)

  //     if(!containedType.astNode) return;

  //     containedType.astNode.fields?.forEach(field => {
  //       console.log('sub directives', field.directives)
  //       const fieldDirectives = field.directives?.map(directive => {
  //         return {
  //           name: directive.name,
  //           arguments: directive.arguments
  //         }
  //       })

  //       fieldDirectives?.forEach(directive => {
  //         if(directive.name.value === 'cost'){
  //           console.log('Directive args?', directive.arguments)
  //           const args = directive.arguments?.map(argument => {
  //             return argument.value
  //           })
  //           args?.forEach(argument => {
  //             costAssociation.forEach(ele => {
  //               if(ele.name === containedType.name){
  //                 if(argument){
  //                 console.log('contained arg', argument)
  //                 //@ts-ignore
  //                 ele.cost += (Number(argument.value) * containedMult);
  //                 }
  //               }
  //             })
  //           })
  //         }
  //       })
  //     })

  //   })
  //   console.log('cost associations post-resolution', costAssociation);

  //   const largestUnion = this.findLargestUnion(costAssociation);

  //   console.log('Largest union?', largestUnion);

  //   return largestUnion;
  // }

  // findLargestUnion(costAssociations: {
  //   name: string;
  //   cost: number;
  //   containedMult: number;
  // }[]){
  //   const largestCost = {
  //     name: '',
  //     cost: -Infinity,
  //     containedMult: 0
  //   }

  //   costAssociations.forEach(ele => {
  //     if(ele.cost > largestCost.cost){
  //       largestCost.name = ele.name;
  //       largestCost.cost = ele.cost;
  //       largestCost.containedMult = ele.containedMult
  //     }
  //   })

  //   return largestCost
  // }

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
        if(directives.name === 'paginationLimit' && directives.value) listLimit = directives.value.value;
      })
    }

    console.log('This is the value of baseVal after accounting for directives', baseVal);
    console.log('This is the paginationLimit assigned by the directives', listLimit);

    return {costDirective: baseVal, paginationLimit: listLimit}
  }


  // hasFragSpreadAncestor() {
  //   let hasFragSpreadAncestor = false;

  //   for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
  //     if(this.parentTypeStack[i].isFragDef) hasFragSpreadAncestor = true;
  //   }

  //   return hasFragSpreadAncestor;
  // }


  // hasUnionAncestor() {
  //   let hasUnionAncestor = false;
  //   let ancestorType!: GraphQLOutputType;
  //   let possibleTypes!: readonly GraphQLObjectType<any, any>[]

  //   for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
  //     if(this.parentTypeStack[i].isUnion) {
  //       hasUnionAncestor = true;
  //       ancestorType = this.parentTypeStack[i].fieldDef.type;
  //       break;
  //     }
  //   }

  //   const ancestorUnionType = getNamedType(ancestorType);

  //   if(ancestorUnionType instanceof GraphQLUnionType) {
  //     possibleTypes = this.schema.getPossibleTypes(ancestorUnionType);
  //   }

  //   return {hasUnionAncestor, ancestorUnionType, possibleTypes};
  // }

  // hasInterfaceAncestor() {
  //   let hasInterfaceAncestor = false;
  //   let ancestorType!: GraphQLOutputType;
  //   let possibleTypes!: readonly GraphQLObjectType<any, any>[]
  //   let inLine: any;

  //   for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
  //     if(this.parentTypeStack[i].isInterface) {
  //       hasInterfaceAncestor = true;
  //       ancestorType = this.parentTypeStack[i].fieldDef.type;
  //       if(this.parentTypeStack[i].implementingFrags) inLine = this.parentTypeStack[i].implementingFrags;
  //       break;
  //     }
  //   }

  //   const ancestorImplementingType = getNamedType(ancestorType);

  //   if(ancestorImplementingType instanceof GraphQLInterfaceType) possibleTypes = this.schema.getPossibleTypes(ancestorImplementingType);

  //   return {hasInterfaceAncestor, ancestorImplementingType, possibleTypes, inLine};
  // }

  // hasListAncestor() {
  //   let hasListAncestor = false;
  //   let mostRecentAncestorMult = 0;

  //   for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
  //     if(this.parentTypeStack[i].isList) {
  //       hasListAncestor = true;
  //       mostRecentAncestorMult = this.parentTypeStack[i].currMult;
  //       // console.log('listAncestor', this.parentTypeStack[i]);
  //       break;
  //     }
  //   }

  //   return {hasListAncestor: hasListAncestor, ancestorMult: mostRecentAncestorMult};
  // }

}

//end of class

const testQueryPolymorphism8 = `
fragment contentFields on Content {
  id
  title
  ... on Post {
    body
    tags
  }
  ... on Image {
    uri
  }
  related {
    content {
      id
      title
    }
  }
}

query {
  content {
    ...contentFields
  }
}
`

const testQueryPolymorphism7 = `
query {
  unionContent {
    ... on Post {
      id
      title
      body
      tags
      related {
        content {
          id
          title
        }
      }
    }
    ... on Image {
      id
      title
      uri
      related {
        content {
          id
          title
        }
      }
    }
  }
}

`

const testQueryBasic = `
query {
  posts {
    id
    title
  }
}
`

const testQueryNested =`
query {
  posts {
    id
    title
    related {
      content {
        ... on Post {
          id
          title
        }
      }
    }
  }
}
`

const testQueryPolymorphism2 = `
query {
  content {
      id
      title
      related {
        content {
          id
        }
      }
    }
}
`

const testQuery7 = `
query {
  content {
    id
    title
    ... on Post {
      related {
        content {
          id
          title
        }
      }
    }
    ... on Image {
      uri
    }
  }
}
`

const testQueryPolymorphism6 = `
fragment postFields on Post {
  id
  title
  body
  tags
  related {
    content {
      ... on Post {
        id
        title
      }
      ... on Image {
        id
        title
      }
    }
  }
}

fragment imageFields on Image {
  id
  title
  uri
  related {
    content {
      ... on Post {
        id
        title
      }
      ... on Image {
        id
        title
      }
    }
  }
}

query {
  content {
    ...postFields
    ...imageFields
  }
}
`

const testSDLPolymorphism2 = `
directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
directive @paginationLimit(value: Int) on FIELD_DEFINITION

type Related {
  content: [Content!]!
}

interface Content {
  id: ID!
  title: String!
  related: Related
}

type Post implements Content {
  id: ID! @cost(value: 3)
  title: String! @cost(value: 4)
  body: String! @cost(value: 10)
  tags: [String!]! @cost(value: 5)
  related: Related
}

type Image implements Content {
  id: ID! @cost(value: 5)
  title: String! @cost(value: 6)
  uri: String! @cost(value: 2)
  related: Related
}

union UnionContent = Post | Image

type Query {
  content: [Content] @paginationLimit(value: 10)
  posts: [Post] @cost(value: 3) @paginationLimit(value: 10)
  images: [Image] @cost(value: 5) @paginationLimit(value: 10)
  related: [Related] @paginationLimit(value: 10)
  unionContent: [UnionContent] @paginationLimit(value: 10)
}
`

//internal costs seem to be correct based on modified specification
//but related guard seems to be breaking
//implementing band-aid fix is possible here, but may be forced to resolve interfaces separately
//if a chain of forced resolution interfaces is called like ...on Post into ...on Image in the same nested
//structure, current band-aid implementations will break
const testQueryPolymorphism5 = `
query {
  posts {
    id
    title
    related {
      content {
        ... on Post {
          id
          title
          related {
            content {
              ... on Post {
                id
                title
                related {
                  content {
                    ... on Post {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  images {
    id
    title
    related {
      content {
        ... on Image {
          id
          title
          related {
            content {
              ... on Image {
                id
                title
                related {
                  content {
                    ... on Image {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const testQuery6 = `query TestQuery1 {
  unionContent {
    ... on Post {
      id
      title
      related {
        content {
          id
          title
        }
      }
    }
    ... on Image {
      id
      title
      uri
    }
  }
}`

const testQuery8 = `
query {
  unionContent {
    ... on Post {
      id
      title
    }
    ... on Image {
      id
      title
    }
  }
}

`

const testQuery9 = `
query {
  unionContent {
    ... on Post {
      id
      title
      related {
        content {
          id
          title
        }
      }
    }
    ... on Image {
      id
      title
      uri
    }
  }
}
`

const testQuery10 = `
query {
  posts {
    id
    title
    body
    tags
  }
}
`

const rateLimiter = function (config: any) {

  let tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      const builtSchema = buildSchema(testSDLPolymorphism2)
      const parsedAst = parse(testQueryPolymorphism6);

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