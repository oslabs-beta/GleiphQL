// Schema to explor the star wars api
const graphql = require('graphql');
const fetch = require('node-fetch');
const _ = require('lodash');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

// define types:
const FilmType = new GraphQLObjectType({
  name: 'Film',
  fields: () => ({
    title: { type: GraphQLString },
    episode_id: { type: GraphQLInt },
    opening_crawl: { type: GraphQLString },
    director: { type: GraphQLString },
    release_date: { type: GraphQLString },
    characters: { type: GraphQLList },
  }),
  args: {
    id: { type: GraphQLInt },
  },
  resolve: async (_, { id }) => {
    try {
      const response = await fetch(`http://swapi.dev/api/films/${id}/`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to fetch film from inside schemaaaa`);
    }
  }
});


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
          const response = await fetch(`http://swapi.dev/api/films/${args.id}/`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch film`);
        }
      }
    },
    // people (single)
  //   people: {
  //     type: PeopleType,
  //     args: { id: { type: GraphQLID } },
  //     resolve(parent, args) {
  //       return _.find(people, { id: args.id } );
  //     } 
  //   },
  //   // planets
  //   planets: {
  //     type: PlanetType,
  //     args: { id: { type: GraphQLString } },
  //     resolve(parent, args) {
  //       return _.find(planet, { id: args.id });
  //     }
  //   },
  //   // species
  //   species: {
  //     type: SpeciesType,
  //     args: { id: { type: GraphQLString } },
  //     resolve(parent, args) {
  //       return _.find(species, { id: args.id });
  //     }
  //   },
  //   // starships
  //   starships: {
  //     type: StarshipType, 
  //     args: { id: { type: GraphQLString } },
  //     resolve(parent, args) {
  //       return _.find(starship, { id: args.id });
  //     }
  //   },
  //   // vehicles
  //   vehicles: {
  //     type: VehicleType,
  //     args: { id: { type: GraphQLString } },
  //     resolve(parent, args) {
  //       return _.find(vehicle, { id: args.id });
  //     }
  //   }
  // }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});

/*
  author (id: 3) {
    name
    age
    books {
      name
      genre
      author {
        id
        name
        books{
          genre
          name
          author {
            name
            age
            id
          }
        }
      }
    }
  }
*/