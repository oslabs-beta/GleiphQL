// Schema to explor the star wars api
const graphql = require('graphql');
const _ = require('lodash');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  parse,
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
    characters: { 
      type: new GraphQLList(PeopleType),
      resolve: async (parent, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/people/`);
          const data = await response.json();
          // console.log(`this is data: ${JSON.stringify(data)}`)
          console.log(`parent: ${JSON.stringify(parent.edisode_id)}`)
          console.log(`args: ${JSON.stringify(args.id)}`)

          const dataArr = _.values(data); // Convert the object into an array of values
          console.log(`data array: ${JSON.stringify(dataArr)}`)
          // const filteredData = _.filter(dataArr, (item) => {
          //   // add logic here
          //   console.log(`items: ${item}`)
          // });
          
        } catch(error) {
          console.error(error);
          throw new Error(`Unable to fetch characters list from inside RootQuery`);
        }
        //return _.filter(fetchCharacters, {characterId: parent.id })
      } 
    }
  })
});


const PeopleType = new GraphQLObjectType({
  name: 'People',
  fields: () => ({
    name: { type: GraphQLString },
    birth_year: { type: GraphQLString },
    eye_color: { type: GraphQLString },
    gender: { type: GraphQLString },
    hair_color: { type: GraphQLString },
    height: { type: GraphQLString },
    mass: { type: GraphQLString },
    skin_color: { type: GraphQLString },
    homeworld: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    films: { 
      type: new GraphQLList(FilmType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
        // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchFilms, {characterId: parent.id })
      } 
    },
    species: {
      type: new GraphQLList(SpeciesType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
        // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchSpecies, {speciesId: parent.id })
      }
    },
    starships: {
      type: new GraphQLList(StarshipType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
        // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchStarships, {starshipId: parent.id })
      }
    },
    vehicles: {
      type: new GraphQLList(VehicleType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
        // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchVehicles, {vehicleId: parent.id })
      }
    }
  })
});


const PlanetType = new GraphQLObjectType({
  name: 'Planet',
  fields: () => ({
    name: { type: GraphQLString },
    diameter: { type: GraphQLString },
    rotation_period: { type: GraphQLString },
    orbital_period: { type: GraphQLString },
    gravity: { type: GraphQLString },
    population: { type: GraphQLString },
    climate: { type: GraphQLString },
    terrain: { type: GraphQLString },
    surface_water: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    residents: {
      type: new GraphQLList(PeopleType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
         // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchCharacters, {residentId: parent.id })
      }
    },
    films: { 
      type: new GraphQLList(FilmType),
      // CHECK THIS RESOLVER
      resolve(parent, args) {
        // DOUBLE CHECK TO SEE THAT THERE'S A FILMS GROUP IN ROOT QUERY
        return _.filter(fetchFilms, {characterId: parent.id })
      } 
    }
  })
});


const SpeciesType = new GraphQLObjectType({
  name: 'Species',
  fields: () => ({
    name: { type: GraphQLString },
    classification: { type: GraphQLString },
    designation: { type: GraphQLString },
    average_height: { type: GraphQLString },
    eye_colors: { type: GraphQLString },
    hair_colors: { type: GraphQLString },
    skin_colors: { type: GraphQLString },
    language: { type: GraphQLString },
    homeworld: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    people: {
      type: new GraphQLList(PeopleType),
      resolve(parent, args) {
        return _.filter(fetchCharacters, {peopleId: parent.id })
      }
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent, args) {
        return _.filter(fetchFilms, {speciesId: parent.id })
      }
    }
  })
});


const StarshipType = new GraphQLObjectType({
  name: 'Startship',
  fields: () => ({
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    starship_class: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    cost_in_credits: { type: GraphQLString },
    length: { type: GraphQLString },
    crew: { type: GraphQLString },
    passengers: { type: GraphQLString },
    max_atmosphering_speed: { type: GraphQLString },
    hyperdrive_rating: { type: GraphQLString },
    MGLT: { type: GraphQLString },
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent, args) {
        return _.filter(fetchFilms, {starshipId: parent.id })
      }
    },
    pilots: {
      type: new GraphQLList(PeopleType),
      resolve(parent, args) {
        return _.filter(fetchCharacters, {pilotId: parent.id })
      }
    }
  })
});


const VehicleType = new GraphQLObjectType({
  name: 'Vehicle',
  fields: () => ({
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    vehicle_class: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    length: { type: GraphQLString },
    cost_in_credits: { type: GraphQLString },
    crew: { type: GraphQLString },
    passengers: { type: GraphQLString },
    max_atmosphering_speed: { type: GraphQLString },
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent, args) {
        return _.filter(fetchFilms, {vehicleId: parent.id })
      }
    }
  })
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
    people: {
      type: PeopleType,
      args: { id: { type: GraphQLID } },
      resolve: async (_, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/people/${args.id}/`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch person`);
        }
      } 
    },
    // planets
    planet: {
      type: PlanetType,
      args: { id: { type: GraphQLString } },
      resolve: async (_, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/planets/${args.id}/`);
          const data = await response.json();
          return data;
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch planets`);
        }
      }
    },
    // species
    species: {
      type: SpeciesType,
      args: { id: { type: GraphQLString } },
      resolve: async (_, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/species/${args.id}/`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch species`);
        }
      }
    },
    // starships
    starship: {
      type: StarshipType, 
      args: { id: { type: GraphQLString } },
      resolve: async (_, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/starships/${args.id}/`);
          const data = await response.json();
          return data;
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch startship`);
        }
      }
    },
    // vehicles
    vehicle: {
      type: VehicleType,
      args: { id: { type: GraphQLString } },
      resolve: async (_, args) => {
        try {
          const response = await fetch(`http://swapi.dev/api/vehicles/${args.id}/`);
          const data = await response.json();
          return data;
        } catch(error) {
          console.error(error);
          throw new Error(`Error from RootQuery, failed to fetch vehicle`);
        }
      }
    },
  }
});

// Defining functions to fetch lists of fields
const fetchFilms = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/films/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(`Error in fetching films list, Root Query`);
  }
};

const fetchCharacters = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/people/`);
    const data = await response.json();
    return data;
  } catch(error) {
    console.error(error);
    throw new Error(`Unable to fetch characters list from inside RootQuery`);
  }
};

const fetchPlanets = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/planets/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to get list of planets from root query`);
  }
};

const fetchSpecies = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/species/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch more species list from root query`);
  }
};

const fetchStarships = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/starships/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch starships list from inside root query`);
  }
};

const fetchVehicles = async() => {
  try {
    const response = await fetch(`http://swapi.dev/api/vehicles/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Error from vehicles root query`);
  }
};



console.log()


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