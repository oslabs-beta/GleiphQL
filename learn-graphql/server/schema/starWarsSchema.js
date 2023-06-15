// Schema to explor the star wars api
const graphql = require('graphql');
const _ = require('lodash');
// const fetch = require('node-fetch').default;
const client = require('../db');


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
    producer: { type: GraphQLString },
    release_date: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    characters: { 
      type: new GraphQLList(PeopleType),
      resolve(parent) {
        return fetchCharactersForFilm(parent);
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
    skin_color: { type: GraphQLString },
    homeworld: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    films: { 
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilmsForPerson(parent); 
      } 
    },
    species: {
      type: new GraphQLList(SpeciesType),
      resolve(parent) {
        return fetchSpeciesForPerson(parent);
      }
    },
    starships: {
      type: new GraphQLList(StarshipType),
      resolve(parent) {
        return fetchStarshipsForPerson(parent);  // working on this 
      }
    },
    vehicles: {
      type: new GraphQLList(VehicleType),
      resolve(parent) {
        return fetchVehiclesForPerson(parent);
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
        return fetchPeopleForPlanets(parent);
      }
    },
    films: { 
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilmsForPlanets(parent);
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
        return fetchPeopleForSpecies(parent);
      }
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilmsForSpecies(parent);
      }
    }
  })
});


const StarshipType = new GraphQLObjectType({
  name: 'Starship',
  fields: () => ({
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    starship_class: { type: GraphQLString },
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
        return fetchFilmsForStarships(parent);
      }
    },
    pilots: {
      type: new GraphQLList(PeopleType),
      resolve(parent) {
        return fetchPilotsForStarships(parent);
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
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    url: { type: GraphQLString },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    films: {
      type: new GraphQLList(FilmType),
      resolve(parent) {
        return fetchFilmsForVehicles(parent);
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

// Defining functions to fetch lists of fields

const fetchFilmsForPerson = async(parent) => {
  try {
    const personId = parent.id;
    const query = `
      SELECT films.*
      FROM films_people
      JOIN films ON films_people.film_id = films.id
      WHERE films_people.person_id = $1;
    `;
    const values = [personId];

    const response = await client.query(query, values);
    return response.rows;
  } catch (error) {
    console.error(error)
    throw new Error(`Error in fetching films list, Root Query`);
  }
};


const fetchCharactersForFilm = async(parent) => {
  try {
    const filmId = parent.id;
    const query = `
      SELECT people.*
      FROM films_people
      JOIN people ON films_people.person_id = people.id
      WHERE films_people.film_id = $1
      `;
    const values = [filmId];

    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error(`Unable to fetch characters list from inside RootQuery`);
  }
};


const fetchSpeciesForPerson = async(parent) => {
  try {
    const personId = parent.id;
    const query = `
      SELECT species.*
      FROM species_people
      JOIN species ON species_people.species_id = species.id
      WHERE species_people.person_id = $1
    `;
    const values = [personId];
    
    const response = await client.query(query, values);
    return response.rows;

  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch more species list from root query`);
  }
};


const fetchStarshipsForPerson = async(parent) => {
  try {
    const starshipId = parent.id;
    const query = `
      SELECT starships.*
      FROM starships_people
      JOIN starships ON starships_people.starship_id = starship_id
      WHERE starships_people.pilot_id = $1
    `;
    const values = [starshipId];

    const response = await client.query(query, values);
    return response.rows;

  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch starships list from inside root query`);
  }
};

const fetchVehiclesForPerson = async(parent) => {
  try {
    const vehicleId = parent.id;
    const query = `
      SELECT vehicles.*
      FROM vehicles_people
      JOIN vehicles ON vehicles_people.vehicles_id = vehicles_id
      WHERE vehicles_people.pilot_id = $1
    `;
    const values = [vehicleId];
    
    const response = await client.query(query, values);
    return response.rows;

  } catch (error) {
    console.error(error);
    throw new Error(`Error from vehicles root query`);
  }
};

const fetchPeopleForPlanets = async(parent) => {
  try {
    const peopleId = parent.id;
    const query = `
      SELECT people.*
      FROM planets_people
      JOIN people ON planets_people.resident_id = people_id
      WHERE planets_people.planet_id = $1
    `;
    const values = [peopleId];

    const response = await client.query(query, values);
    return response.rows;

  } catch (error) {
    console.error(error);
    throw new Error(`Error from fetching people for planets`)
  }
};

const fetchFilmsForPlanets = async(parent) => {
  try {
    const filmId = parent.id;
    const query = `
      SELECT films.*
      FROM films_planets
      JOIN films ON films_planets.film_id = film_id
      WHERE films_planets.planet_id = $1
    `;
    const values = [filmId];

    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error(`Error with fetching films for planets`)
  }
};


const fetchPeopleForSpecies = async(parent) => {
  try {
    const personId = parent.id;
    const query = `
      SELECT people.*
      FROM species_people
      JOIN people ON species_people.person_id = person_id
      WHERE species_people.species_id = $1
    `;
    const values = [personId];
    
    const response = await client.query(query, values);
    return response.rows;
  } catch(error) {
    console.error(error);
    throw new Error(`Error with fetching people for species`)
  }
};

const fetchFilmsForSpecies = async(parent) => {
  try {
    const filmId = parent.id;
    const query = `
      SELECT films.*
      FROM films_species
      JOIN films ON films_species.film_id = film_id
      WHERE films_species.species_id = $1
    `;
    const values = [filmId];

    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error('Error with fetching films for species')
  }
};

const fetchFilmsForStarships = async(parent) => {
  try {
    const filmId = parent.id;
    const query = `
      SELECT films.*
      FROM films
      JOIN films_starships ON films.id = films_starships.film_id
      WHERE films_starships.starship_id = 1;
    
    `;
    const values = [filmId];

    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error('Error with fetching films for starships');
  }
};


const fetchPilotsForStarships = async(parent) => {
  try {
    const pilotId = parent.id;
    const query = `
      SELECT people.*
      FROM starships_people
      JOIN people ON starships_people.person_id = person_id
      WHERE starships_people.starship_id = $1
    `;
    const values = [pilotId];

    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error('Error with fetching pilots for starships')
  }
};


const fetchFilmsForVehicles = async(parent) => {
  try {
    const filmId = parent.id;
    const query = `
      SELECT films.*
      FROM films
      JOIN films_vehicles ON films.id = films_vehicles.film_id
      WHERE films_vehicles.vehicle_id = $1;
    `;
    const values = [filmId];
    
    const response = await client.query(query, values);
    return response.rows;

  } catch(error) {
    console.error(error);
    throw new Error('Error with fetching films for vehicles');
  }
};


module.exports = new GraphQLSchema({
  query: RootQuery
});
