const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  parse,
} = require('graphql');
// import connection to database
const client = require('../db');
// import types for main query
const { FilmType, PeopleType, PlanetType, SpeciesType, StarshipType, VehicleType } = require('./starWarsTypes');


// Root Query:
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  // https://swapi.dev/documentation#root, Can declare all the foot fields here:
  fields: {
    film: {
      type: FilmType,
      args: { 
        id: { type: GraphQLInt } 
      },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM films WHERE id = $1';
          const values = [args.id];
          const response = await client.query(query, values);
          return response.rows[0];
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch film`);
        }
      }
    },
    // people (single)
    people: {
      type: PeopleType,
      args: { id: { type: GraphQLInt } },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM people WHERE id = $1';
          const values = [args.id];
          const response = await client.query(query, values);
          return response.rows[0];
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch person`);
        }
      } 
    },
    
    planet: {
      type: PlanetType,
      args: { id: { type: GraphQLInt } },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM planets WHERE id = $1';
          const values = [args.id];
          const response = await client.query(query, values);
          return response.rows[0];
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch planets`);
        }
      }
    },
    
    species: {
      type: SpeciesType,
      args: { id: { type: GraphQLInt } },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM species WHERE id = $1';
          const values = [args.id];
          const response = await client.query(query, values);
          return response.rows[0];
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch species`);
        }
      }
    },
    
    starship: {
      type: StarshipType, 
      args: { id: { type: GraphQLInt } },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM starships WHERE id = $1';
          const values = [args.id];
          const response = await client.query(query, values);
          return response.rows[0];
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch starship`);
        }
      }
    },

    vehicle: {
      type: VehicleType,
      args: { id: { type: GraphQLInt } },
      resolve: async (_, args) => {
        try {
          const query = 'SELECT * FROM vehicles WHERE id = $1';
          const response = await client.query(query, values);
          return response.rows[0];
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch vehicle`);
        }
      }
    },
  }
});


module.exports = RootQuery;