import { generateRandomQuery } from 'ibm-graphql-query-generator'
import { GraphQLSchema } from 'graphql';

export const queryGen = function(schema: GraphQLSchema){

  const cfg = {
    'depthProbability':        0.5,
    'breadthProbability':      0.5,
    'maxDepth':                5,
    'ignoreOptionalArguments': true,
    'argumentsToIgnore':       [],
    'argumentsToConsider':     [],
    'providerMap':             {'*__*__*': null},
    'considerInterfaces':      false,
    'considerUnions':          false,
    'seed':                    1,
    'pickNestedQueryField':    false
  }
  //@ts-ignore
  const query = generateRandomQuery(schema, cfg);
  console.log(query);
}