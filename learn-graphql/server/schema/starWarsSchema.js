// Schema to explor the star wars api
const { GraphQLSchema } = require('graphql');
const RootQuery = require('./starWarsQueries');
const Mutation = require('./starWarsMutations');


const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

module.exports = schema;



