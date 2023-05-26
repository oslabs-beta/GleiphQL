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
      resolve(parent) {
        return fetchCharacters(parent);
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
      resolve(parent) {
        return fetchFilms(parent);
      } 
    },
    species: {
      type: new GraphQLList(SpeciesType),
      resolve(parent) {
        return fetchSpecies(parent);
      }
    },
    starships: {
      type: new GraphQLList(StarshipType),
      resolve(parent) {
        return fetchStarships(parent);
      }
    },
    vehicles: {
      type: new GraphQLList(VehicleType),
      resolve(parent) {
        return fetchVehicles(parent);
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
      resolve(parent) {
        return fetchCharacters(parent);
      }
    },
    films: { 
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilms(parent);
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
      resolve(parent) {
        return fetchFilms(parent);
      }
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilms(parent);
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
      resolve(parent) {
        return fetchFilms(parent);
      }
    },
    pilots: {
      type: new GraphQLList(PeopleType),
      resolve(parent) {
        return fetchCharacters(parent);
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
const fetchFilms = async(parent) => {
  try {
    const filmPromises = parent.films.map(async (filmUrl) => {
      const response = await fetch(filmUrl);
      const filmData = await response.json();
      return filmData;
    })
    const films = await Promise.all(filmPromises);
    return films;
  } catch (error) {
    console.error(error)
    throw new Error(`Error in fetching films list, Root Query`);
  }
};


const fetchCharacters = async(parent) => {
  try {
    const characterPromises = parent.characters.map(async (characterUrl) => {
      const response = await fetch(characterUrl);
      const characterData = await response.json();
      return characterData;
    });

    const characters = await Promise.all(characterPromises);
    return characters;

  } catch(error) {
    console.error(error);
    throw new Error(`Unable to fetch characters list from inside RootQuery`);
  }
};


const fetchSpecies = async(parent) => {
  try {
    const speciesPromises = parent.characters.map(async (speciesUrl) => {
      const response = await fetch(speciesUrl);
      const speciesData = await response.json();
      return speciesData;
    })
    
    const species = await Promise.all(speciesPromises);
    return species;

  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch more species list from root query`);
  }
};


const fetchStarships = async(parent) => {
  try {
    const starshipsPromises = parent.starships.map(async (starshipsUrl) => {
      const response = await fetch(starshipsUrl);
      const starshipsData = await response.json();
      return starshipsData;
    })
    
    const starships = await Promise.all(starshipsPromises);
    return starships;

  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch starships list from inside root query`);
  }
};

const fetchVehicles = async(parent) => {
  try {
    const vehiclesPromises = parent.vehicles.map(async (vehiclesUrl) => {
      const response = await fetch(vehiclesUrl);
      const vehiclesData = await response.json();
      return vehiclesData;
    })
    
    const vehicles = await Promise.all(vehiclesPromises);
    return vehicles;

  } catch (error) {
    console.error(error);
    throw new Error(`Error from vehicles root query`);
  }
};

module.exports = new GraphQLSchema({
  query: RootQuery
});
