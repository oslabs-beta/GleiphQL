import { Request, Response, NextFunction } from 'express';
import { FragmentDefinitionNode, FragmentSpreadNode, buildSchema, isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode, DirectiveLocation, GraphQLUnionType, GraphQLNamedOutputType, getDirectiveValues, isCompositeType, GraphQLOutputType, FragmentsOnCompositeTypesRule, isInterfaceType, ASTNode } from 'graphql';
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
  private fragDefs: any = {};
  private queriedTypes: any[] = [];

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

          console.log('ENTERING NEW NODE');
          //casing for fragment definition, need to maintain parentTypeStack, and acknowledge fragDef exists
          //but otherwise disregard
          if(node.kind === Kind.FRAGMENT_DEFINITION) {
            console.log('this is a fragmentDef:', node)
            this.fragDefs[node.name.value] = node;
            console.log('fragDefs after addition', this.fragDefs);
            this.parentTypeStack.push({isFragDef: true})
            return;
          }

          //All the things related to a field being nested in something are resolved
          const subUnionType = this.hasUnionAncestor();
          const subInterfaceType = this.hasInterfaceAncestor();
          const subFragType = this.hasFragSpreadAncestor();
          const subList = this.hasListAncestor();

          //must create interface casing, grabbing implememting types if fragment spreads are used to query an interface
          //TO-DO
          if(node.kind === Kind.FRAGMENT_SPREAD) {
            const fragStore = {
              name: node.name.value,
              cost: 0
            }
            const fragName = node.name.value;
            console.log('This is the node:', fragName);
            //@ts-ignore
            let document;

            for(let i = ancestors.length -1; i >= 0; i--) {
              const ancestor = ancestors[i] as ASTNode;
              if(ancestor.kind === 'Document') {
                document = ancestor;
              }
            }
            console.log('doc?', document);
            const fragDef = document?.definitions.find(def => def.kind === 'FragmentDefinition' && def.name.value === fragName);
            console.log('fragDef?', fragDef);
            //@ts-ignore
            if(!fragDef) return;
            //@ts-ignore
            const typeName = fragDef.typeCondition.name.value;
            const objectType = this.schema.getType(typeName);

            console.log('objectType?', objectType);
            //@ts-ignore
            const selectionSet = fragDef.selectionSet

            //What does this do?
            //We enter the selectionSet of the fragment spread
            //Upon encountering a fieldNode, we assess the parentType of the specific node in the selectionSet
            //If said fieldNode is an interface, we then find the implementing types of said interface
            //What is the difference between what we derive from objectType
            visit(selectionSet, visitWithTypeInfo(schemaType, {
              enter: (node) => {
                if(node.kind === Kind.FIELD) {
                  const name = node.name.value;
                  console.log('subNode of selectionSet', name);
                  const parentType = schemaType.getParentType();
                  //@ts-ignore
                  const currObjDef =  objectType.getFields()[name];
                  const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType?.getFields()[node.name.value];
                  if(!fieldDef) return;
                  const fieldType = fieldDef.type;
                  const namedType = getNamedType(fieldType);
                  const isInterface = isInterfaceType(namedType);
                  // console.log('fieldDef?', fieldDef)
                  //we need to make some sort of call upon encounter of an interface that initiates a private store
                  //we then return out the proper costs out of said encapsulated store, then store it in the fragStore of the
                  //internal visit function
                  if(isInterface) {
                    if(namedType) {
                      console.log('selectionSet of interface?', node.selectionSet)
                      const implementingTypes = this.schema.getPossibleTypes(namedType);
                      console.log('implementingTypes?', implementingTypes);
                    }
                  }

                  if(!currObjDef) return;
                  const directives = this.parseDirectives(currObjDef, 0);
                  console.log('directives?', directives);
                  fragStore.cost += Number(directives.costDirective);
                }
                console.log('fragStore?', fragStore)
              }
            }))
            // if(this.fragDefs[node.name.value]) {
            //   console.log('There is a corresponding fragment definition');
            //   console.log('Fragment def:', this.fragDefs[node.name.value])
            //   const selectionSet = this.fragDefs[node.name.value].selectionSet;
            //   visit(selectionSet, visitWithTypeInfo(schemaType, {
            //     enter: (node) => {
            //       if(node.kind === Kind.FIELD) {
            //         console.log('This is a subnode of a selection set:', node);
            //         const parentType = schemaType.getParentType();
            //         console.log('This is the parentType', parentType);
            //         if(!parentType || !isInterfaceType(parentType)) {
            //           console.log('failed to retrieve parentType in subAST')
            //           return;
            //         }
            //         const fieldDef = parentType.getFields()[node.name.value];
            //         if(isInterfaceType(parentType)) {
            //           const implementingTypes = this.schema.getPossibleTypes(parentType);
            //           console.log('possibleTypes?', implementingTypes);
            //         }
            //         console.log('fieldDef?', fieldDef);
            //         const directives = fieldDef?.astNode?.directives;
            //       }
            //     }
            //   }))
            // }
            return;
          }

          if(node.kind !== Kind.FIELD) {
            console.log('not field, exiting');
            return;
          }

          console.log('Current node', node.name.value);

          let baseVal = 1;
          let internalPaginationLimit: number | null = null;
          let argumentCosts = 0;

          //we are entering an unnested field, so we reset the current multiplier held in class state
          if (this.parentTypeStack.length === 0) this.currMult = 1;

          const parentType = schemaType.getParentType();

          // console.log('ParentType', parentType);

          if(!parentType) return;

          // console.log('ParentType exists');

          const fieldDef = parentType && isAbstractType(parentType) ? schemaType.getFieldDef() : parentType.getFields()[node.name.value];

          if(!fieldDef) return;

          const fieldDefArgs = fieldDef.args;
          // console.log('These are relevant fieldArgs', fieldDef.args);
          const fieldType = fieldDef.type;
          //Graphql sometimes wraps types in strange wrappers, so getNamedType will grab the 'true' field
          const fieldTypeUnion = getNamedType(fieldType);
          const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));
          const isUnion = fieldTypeUnion instanceof GraphQLUnionType;
          const isInterface = fieldTypeUnion instanceof GraphQLInterfaceType;
          let implementingFrags: any;
          console.log('isUnion?', isUnion);
          console.log('interface?', isInterface);
          console.log('isList?', isList);

          //very specific casing, for short-circuited polymorphism
          if(isInterface) {
            const implementingTypes = this.schema.getPossibleTypes(fieldTypeUnion)

            for (const type of implementingTypes) {
              implementingFrags = node.selectionSet?.selections.find(
                (sel) => sel.kind === Kind.INLINE_FRAGMENT && sel.typeCondition?.name.value === type.name
              );
              if(implementingFrags && implementingFrags.typeCondition.name.value) this.queriedTypes.push(implementingFrags.typeCondition.name.value);
            }
          }

          //Grab arguments and directives and associated costs for the current field
          const argumentDirectiveCost = this.parseArgumentDirectives(fieldDef);
          const directiveAdjustedBaseVal = this.parseDirectives(fieldDef, baseVal);

          baseVal = Number(directiveAdjustedBaseVal.costDirective);

          if(directiveAdjustedBaseVal.paginationLimit) {
            internalPaginationLimit = Number(directiveAdjustedBaseVal.paginationLimit);
            // console.log('Internal pagination limits', internalPaginationLimit);
          }

          if(argumentDirectiveCost) {
            //list could be nested in another list, need to case out
            argumentDirectiveCost.forEach((directive: any) => {
              // console.log('Attempting to resolve cost of resolving argument')
              const directiveValue = Number(directive.directiveValue)
              //simply appending this value to baseVal possibly resolves argument resolution calls in nestedLists
              baseVal += directiveValue;
              // argumentCosts += directiveValue;
              })
          }

          if(subFragType) {
            // console.log('subordinate to fragment spread, aborting');
            // console.log('This is the subordinate fragment:', node.name.value);
            const currMult = this.currMult;
            this.parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult, isUnion, isInterface});
            return;
          }

          // if(subUnionType) {
          //   // console.log('Field has union ancestor, complexity calculation should have been resolved in resolveUnionTypes of ancestor, aborting traversal')
          //   const currMult = this.currMult;
          //   // need to push something here to maintain stack integrity
          //   this.parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult, isUnion, isInterface});
          //   return;
          // }

          if(subList.hasListAncestor) {
            // console.log('This node has a list ancestor:', subList)
            this.currMult = subList.ancestorMult;
          }

          //compares the current field against the field in each implementing type
          //each implementing type has a running store for the potentialCost
          //this tallies the cost of the field on each implementing type
          if(subInterfaceType.hasInterfaceAncestor || subUnionType.hasUnionAncestor) {
            let subStoreRef;
            if(subInterfaceType.hasInterfaceAncestor) subStoreRef = this.interfaceStore;
            if(subUnionType.hasUnionAncestor) subStoreRef = this.unionStore;

            if(!subStoreRef) return;

            if(isInterface || isUnion) {
              let storeRef;
              if(isInterface) storeRef = this.interfaceStore;
              if(isUnion) storeRef = this.unionStore
              if(isList) {
                this.typeComplexity += baseVal * this.currMult;
                if(internalPaginationLimit) this.currMult = this.currMult * internalPaginationLimit; else this.currMult = this.currMult * this.config.paginationLimit
              } else {
                this.typeComplexity += baseVal * this.currMult;
              }
              if(storeRef) {
                for(let i = 0; i < storeRef.length; i++) {
                  for (const types in storeRef[i].matchingTypes) {
                    // console.log('resetting matchingTypes field-by-field', this.interfaceStore[i].matchingTypes);
                    storeRef[i].matchingTypes[types] = false;
                    // console.log('field reset, logging matchingTypes', this.interfaceStore[i].matchingTypes);
                  }
                }
              }
            }

            const implementingTypesArray = [];
            // console.log('This field has an interface as an ancestor, here is fieldType:', fieldType);
            // console.log('Here is fieldTypeUnion:', fieldTypeUnion);
            let implementingTypes;
            if(subUnionType.hasUnionAncestor) implementingTypes = subUnionType.possibleTypes;
            if(subInterfaceType.hasInterfaceAncestor) implementingTypes = subInterfaceType.possibleTypes;
            // console.log('Implementing types', implementingTypes);

            if(!implementingTypes) return;

            for (const type of implementingTypes) {
              const typeNames = subStoreRef.map(types => types.name);

              if(!typeNames.includes(type.name)) subStoreRef.push({
                name: type.name,
                potentialCost: 0,
                matchingTypes: {}
              })
            }

            for (const type of implementingTypes) {

              interface typeAssociation {
                name: string
                matchingTypes: any
              }

              const typeAssociation: typeAssociation = {
                name: type.name,
                matchingTypes: 0
              }

              const fields = type.getFields();

              for (const fieldName in fields) {

                const fieldDef = fields[fieldName];

                // console.log('FieldDef within implementing types', fieldDef);

                const name = fieldDef.name;

                if (fieldName === node.name.value) {
                  const directives = this.parseDirectives(fieldDef, 0);
                  const argDirectives = this.parseArgumentDirectives(fieldDef);
                  if(directives.costDirective) {
                    // console.log(`This is the potential cost of the field ${node.name.value}, ${directives.costDirective}, name of implementing field is ${type.name}`);
                    for (let i = 0; i < subStoreRef.length; i++) {
                      if (subStoreRef[i].name === type.name && !subStoreRef[i].matchingTypes[fieldName]) {
                        // console.log('The name stored in the possibleTypes array matches the name of the field')
                        // console.log('directives?', directives.costDirective);
                        // console.log('currMult?', this.currMult);
                        subStoreRef[i].potentialCost += (Number(directives.costDirective) * this.currMult)
                        subStoreRef[i].matchingTypes[fieldName] = true;
                      }
                    }
                    ///generate casing for fields without explicit cost ie abstract fields nested within other interfaces
                  } else {
                    for (let i = 0; i < subStoreRef.length; i++ ) {
                      if(subStoreRef[i].name === type.name && !subStoreRef[i].matchingTypes[fieldName]) {
                        subStoreRef[i].potentialCost += baseVal * this.currMult;
                        subStoreRef[i].matchingTypes[fieldName] = true;
                      }
                    }
                  }
                }
              }
             }

             for (let i = 0; i < implementingTypesArray.length; i++) {
              // console.log(this.unionStore[i].name);
              // console.log(this.unionStore[i].potentialCost);
            }
          } else if(isList === true) {
            // console.log('this is the heldMult', this.currMult);
            const heldMult = this.currMult;
            //resolve the base cost of the listType first
            // console.log('this is the type complexity')
            this.typeComplexity += baseVal * this.currMult;
            // console.log(`${node.name.value} is a list`);
            const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last' || arg.name.value === 'before' || arg.name.value === 'after'));
            this.currMult = heldMult * this.config.paginationLimit

            if(internalPaginationLimit) this.currMult = heldMult * internalPaginationLimit;

            if (argNode && argNode.value.kind === 'IntValue') {
              const argValue = parseInt(argNode.value.value, 10);
              // console.log(`Found limit argument with value ${argValue}`);
              //unclear how we want to handle this base behavior, may be best to create a default case that is editable by user
              if(internalPaginationLimit) {
                if(argValue > internalPaginationLimit) console.log('The passed in argument exceeds paginationLimit, define intended default behavior for this case')
              }
                this.currMult = heldMult * argValue;
            }

            // console.log('Mult is now:', this.currMult);

            this.resolveParentTypeStack(isList, argumentCosts, baseVal);

            // } else if (fieldTypeUnion instanceof GraphQLUnionType) {
            //   const largestUnion = this.resolveUnionTypes(fieldTypeUnion, internalPaginationLimit, isList)
            //   const currMult = largestUnion.containedMult
            //   this.typeComplexity += largestUnion.cost;
            //   this.parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult, isUnion, isInterface, implementingFrags});
            //   return;

            } else {
              // console.log(`This is the parentStack of the current GraphQL field type ${node.name.value}`, this.parentTypeStack);

              this.resolveParentTypeStack(isList, argumentCosts, baseVal);
            }
              const currMult = this.currMult
              this.parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult, isUnion, isInterface, implementingFrags});
              console.log('this is the typeComplexity', this.typeComplexity)
            },
        leave:(node) => {
          if (node.kind === Kind.FIELD || node.kind === Kind.FRAGMENT_DEFINITION) {
            this.parentTypeStack.pop();
          }
          if(this.parentTypeStack.length === 0) {
            // console.log('current interfaceStore before resolution', this.interfaceStore);
            let largestInterfaceCost: number = -Infinity;
            console.log('interfaceStore?', this.interfaceStore);
            console.log('unionStore?', this.unionStore);
            console.log('queriedTypes?', this.queriedTypes);
            let largestUnion: number = -Infinity;
            for(let i = 0; i < this.interfaceStore.length; i++) {
               if(this.queriedTypes.length === 1 && this.interfaceStore[i].name === this.queriedTypes[0]) {
                largestInterfaceCost = this.interfaceStore[i].potentialCost;
                break;
                }
                if (this.interfaceStore[i].potentialCost > largestInterfaceCost) largestInterfaceCost = this.interfaceStore[i].potentialCost
            }

            for(let i = 0; i < this.unionStore.length; i++) {
              if(this.unionStore[i].potentialCost >  largestUnion) largestUnion = this.unionStore[i].potentialCost;
            }

            if(largestInterfaceCost >= 0) this.typeComplexity += largestInterfaceCost;
            if(largestUnion >= 0) this.typeComplexity += largestUnion;
            this.queriedTypes = [];
            this.interfaceStore = [];
            this.unionStore = [];
            console.log('type complexity post resolution of interface', this.typeComplexity);
            // console.log('current interfaceStore post resolution', this.interfaceStore);
            // console.log('current unionStore', this.unionStore);
          }
        }
    }))
  }

    this.complexityScore = this.typeComplexity + this.resolveComplexity;

    return {complexityScore: this.complexityScore, typeComplexity: this.typeComplexity, resolveComplexity: this.resolveComplexity};
  }

  resolveParentTypeStack(isList: boolean, argumentCosts: number, baseVal: number) {
    if(isList === true) {
      console.log('list casing handled?')

    } else {

      console.log('Resolving typeStack for non-list')
      for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
        if(this.parentTypeStack[i].isList === true) {
          const lastListMultiplier = this.parentTypeStack[i].currMult;
          this.resolveComplexity += lastListMultiplier;
          this.resolveComplexity--;
          this.currMult = lastListMultiplier
          break;
        }
      }

        //if the currMult === 1 indicates object not nested in list, simply increment complexity score
      if(this.currMult !== 1) {
        this.typeComplexity += this.currMult * baseVal + argumentCosts;
      } else {
        this.typeComplexity+= baseVal + argumentCosts;
      }
        this.resolveComplexity++;
    }
  }

  resolveUnionTypes(fieldType: GraphQLUnionType, paginationLimit: number | null, isList: boolean) {
    //modularize code
    //add resolution for union of unions if possible, exists but potentially anti-pattern
    console.log('Is union a list?', isList);
    console.log('If there is a list, is there pagination limit defined?', paginationLimit);
    const unionTypes = this.schema.getPossibleTypes(fieldType);
    const costAssociation = unionTypes.map(containedType => {
      return {
        name: containedType.name, cost: 0, containedMult: 0
      }
    })

    console.log('storage object pre-resolution', costAssociation)

    unionTypes.forEach(containedType => {

      let containedMult = 1;
      if(paginationLimit) containedMult *= paginationLimit;

      for(let i = this.parentTypeStack.length-1; i > 0; i--) {
        if(this.parentTypeStack[i].isList === true) {
          console.log('Union type is nested within a list/lists');
          containedMult = containedMult * this.parentTypeStack[i].currMult;
          console.log(`The original multiplier of ${containedMult} has been updated to the multiplier of the most recent ancestor list, ${this.parentTypeStack[i].currMult}`)
          break;
        }
      }

      costAssociation.forEach(ele => {
        ele.containedMult = containedMult;
      })

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

    const largestUnion = this.findLargestUnion(costAssociation);

    console.log('Largest union?', largestUnion);

    return largestUnion;
  }

  findLargestUnion(costAssociations: {
    name: string;
    cost: number;
    containedMult: number;
  }[]){
    const largestCost = {
      name: '',
      cost: -Infinity,
      containedMult: 0
    }

    costAssociations.forEach(ele => {
      if(ele.cost > largestCost.cost){
        largestCost.name = ele.name;
        largestCost.cost = ele.cost;
        largestCost.containedMult = ele.containedMult
      }
    })

    return largestCost
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
        if(directives.name === 'paginationLimit' && directives.value) listLimit = directives.value.value;
      })
    }

    console.log('This is the value of baseVal after accounting for directives', baseVal);
    console.log('This is the paginationLimit assigned by the directives', listLimit);

    return {costDirective: baseVal, paginationLimit: listLimit}
  }


  hasFragSpreadAncestor() {
    let hasFragSpreadAncestor = false;

    for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
      if(this.parentTypeStack[i].isFragDef) hasFragSpreadAncestor = true;
    }

    return hasFragSpreadAncestor;
  }


  hasUnionAncestor() {
    let hasUnionAncestor = false;
    let ancestorType!: GraphQLOutputType;
    let possibleTypes!: readonly GraphQLObjectType<any, any>[]

    for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
      if(this.parentTypeStack[i].isUnion) {
        hasUnionAncestor = true;
        ancestorType = this.parentTypeStack[i].fieldDef.type;
        break;
      }
    }

    const ancestorUnionType = getNamedType(ancestorType);

    if(ancestorUnionType instanceof GraphQLUnionType) {
      possibleTypes = this.schema.getPossibleTypes(ancestorUnionType);
    }

    return {hasUnionAncestor, ancestorUnionType, possibleTypes};
  }

  hasInterfaceAncestor() {
    let hasInterfaceAncestor = false;
    let ancestorType!: GraphQLOutputType;
    let possibleTypes!: readonly GraphQLObjectType<any, any>[]
    let inLine: any;

    for(let i = this.parentTypeStack.length-1; i >= 0; i--) {
      if(this.parentTypeStack[i].isInterface) {
        hasInterfaceAncestor = true;
        ancestorType = this.parentTypeStack[i].fieldDef.type;
        if(this.parentTypeStack[i].implementingFrags) inLine = this.parentTypeStack[i].implementingFrags;
        break;
      }
    }

    const ancestorImplementingType = getNamedType(ancestorType);

    if(ancestorImplementingType instanceof GraphQLInterfaceType) possibleTypes = this.schema.getPossibleTypes(ancestorImplementingType);

    return {hasInterfaceAncestor, ancestorImplementingType, possibleTypes, inLine};
  }

  hasListAncestor() {
    let hasListAncestor = false;
    let mostRecentAncestorMult = 0;

    for (let i = this.parentTypeStack.length-1; i >= 0; i--) {
      if(this.parentTypeStack[i].isList) {
        hasListAncestor = true;
        mostRecentAncestorMult = this.parentTypeStack[i].currMult;
        // console.log('listAncestor', this.parentTypeStack[i]);
        break;
      }
    }

    return {hasListAncestor: hasListAncestor, ancestorMult: mostRecentAncestorMult};
  }

}

//end of class

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

const rateLimiter = function (config: any) {

  let tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      const builtSchema = buildSchema(testSDLPolymorphism2)
      const parsedAst = parse(testQueryPolymorphism4);

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