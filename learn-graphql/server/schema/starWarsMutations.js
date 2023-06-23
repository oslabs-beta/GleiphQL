const { 
  GraphQLObjectType, 
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
// import connection to database
const client = require('../db');
// import types for mutations query
const { 
  FilmType, 
  PeopleType, 
  PlanetType, 
  SpeciesType, 
  StarshipType, 
  VehicleType 
} = require('./starWarsTypes');

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // name of the mutation
    createFilm: {
      // specifies the return type will be a newly created film type
      type: FilmType,
      // defines the input arguments for the mutation
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        episode_id: { type: GraphQLNonNull(GraphQLString) },
        opening_crawl: { type: GraphQLNonNull(GraphQLString) },
        director: { type: GraphQLString },
        producer: { type: GraphQLString },
        release_date: { type: GraphQLString },
        created: { type: GraphQLString },
        edited: { type: GraphQLString },
      },
      // The resolver function responsible for executing the logic of the mutation. It receives the parent object (represented by '_', but not used in this case) and the input arguments as parameters
      resolve: async (_, args) => {
        try {
          // create the query to insert values into the correct table
          const query = `
            INSERT INTO films (title, episode_id, opening_crawl, director, producer, release_date, created, edited)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;

          // create values array for args
          const values = [
            args.title,
            args.episode_id,
            args.opening_crawl,
            args.director,
            args.producer,
            args.release_date,
            args.created,
            args.edited
          ];
          // insert a new film into the database
          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new film`);
        }
      },
    },

    // Update resolver where the film id is the only required field. All other fields are optional but should be inputted in the same sequence they're written here
    updateFilm: {
      type: FilmType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLString },
        episode_id: { type: GraphQLString },
        opening_crawl: { type: GraphQLString },
        director: { type: GraphQLString },
        producer: { type: GraphQLString },
        release_date: { type: GraphQLString },
        created: { type: GraphQLString },
        edited: { type: GraphQLString },
      },
      resolve: async (_, args) => {
        try {
          const query = `UPDATE films
          SET ${args.title?  'title = $2' : ''}
          ${args.episode_id? ', episode_id = $3' : ''} 
          ${args.opening_crawl? ', opening_crawl = $4' : ''}
          ${args.director? ', director = $5' : ''}
          ${args.producer? ', producer = $6' : ''}
          ${args.release_date? ', release_date = $7' : ''}
          ${args.created? ', created = $8' : ''}
          ${args.edited? ', edited = $9' : ''}
          WHERE id = $1 RETURNING *;
          `;
          
          console.log(query);
          
          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update the film`)
        }
      },
    },

    deleteFilm: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM films 
            WHERE id = $1
          `;

          const values = [id];
          await client.query(query, values);
          return `Film deleted successfully`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete the film`);
        }
      },
    },

    createPerson: {
      type: PeopleType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        birth_year: { type: GraphQLString },
        eye_color: { type: GraphQLString },
        gender: { type: GraphQLString },
        hair_color: { type: GraphQLString },
        skin_color: { type: GraphQLString },
        homeworld: { type: GraphQLString },
        url: { type: GraphQLString },
        created: { type: GraphQLString },
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            INSERT INTO people (name, birth_year, eye_color, gender, hair_color, skin_color, homeworld, url, created, edited)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
          `;

          const values = [
            args.name,
            args.birth_year,
            args.eye_color,
            args.gender,
            args.hair_color,
            args.skin_color,
            args.homeworld,
            args.url,
            args.created,
            args.edited,
          ];

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new person`)
        }
      },
    },

    updatePerson: {
      type: PeopleType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
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
      },
      resolve: async (_, args) => {
        try {
          const query = `
            UPDATE people
            SET ${args.name? 'name = $2' : ''}
            ${args.birth_year? ', birth_year = $3' : ''}
            ${args.eye_color? ', eye_color = $4' : ''}
            ${args.gender? ', gender = $5' : ''}
            ${args.hair_color? ', hair_color = $6' : ''}
            ${args.skin_color? ', skin_color = $7' : ''}
            ${args.homeworld? ', homeworld = $8' : ''}
            ${args.url? ', url = $9' : ''}
            ${args.created? ', created = $10' : ''}
            ${args.edited? ', edited = $11' : ''}
            WHERE id = $1
            RETURNING *
          `;

          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update a person`);
        }
      },
    },

    deletePerson: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM people
            WHERE id = $1
          `;

          const values = [id];
          await client.query(query, values);
          return `Person deleted successfully`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete a person`)
        }
      },
    },

    createPlanet: {
      type: PlanetType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        diameter: { type: GraphQLNonNull(GraphQLString) },
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
      },
      resolve: async (_, args) => {
        try {
          const query = `
            INSERT INTO planets (name, diameter, rotation_period, gravity, population, climate, terrain, surface_water, url, created, edited)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
          `;

          const values = [
            args.name,
            args.diameter,
            args.rotation_period,
            args.gravity,
            args.population,
            args.climate,
            args.terrain,
            args.surface_water,
            args.url,
            args.created,
            args.edited
          ];

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new planet`)
        }
      },
    },

    updatePlanet: {
      type: PlanetType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
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
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            UPDATE planets
            SET ${args.name? 'name = $2' : ''}
            ${args.diameter? ', diameter = $3' : ''}
            ${args.rotation_period? ', rotation_period = $4' : ''}
            ${args.orbital_period? ', orbital_period = $5' : ''}
            ${args.gravity? ', gravity = $6' : ''}
            ${args.population? ', population = $7' : ''}
            ${args.climate? ', climate = $8' : ''}
            ${args.terrain? ', terrain = $9' : ''}
            ${args.surface_water? ', surface_water = $10' : ''}
            ${args.url? ', url = $11' : ''} 
            ${args.created? ', created = $12' : ''}
            ${args.edited? ', edited = $13' : ''}
            WHERE id = $1
            RETURNING *
          `;

          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update the planet`);
        }
      },
    },

    deletePlanet: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM planets
            WHERE id = $1
          `;

          const values = [id];
          await client.query(query, values);
          return `Planet deleted successfully`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete a planet`)
        }
      },
    },

    createSpecies: {
      type: SpeciesType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
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
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            INSERT INTO species (name, classification, designation, average_height, eye_colors, hair_colors, skin_colors, language, homeworld, url, created, edited)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
          `;

          const values = [
            args.name,
            args.classification,
            args.designation, 
            args.average_height,
            args.eye_colors,
            args.hair_colors,
            args.skin_colors,
            args.language,
            args.homeworld,
            args.url,
            args.created,
            args.edited
          ];

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new species`)
        }
      },
    },

    updateSpecies: {
      type: SpeciesType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
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
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            UPDATE species
            SET ${args.name? 'name = $2' : ''}
            ${args.classification? ', classification = $3' : ''}
            ${args.designation? ', designation = $4' : ''}
            ${args.average_height? ', average_height = $5' : ''}
            ${args.eye_colors? ', eye_colors = $6' : ''}
            ${args.hair_colors? ', hair_colors = $7' : ''}
            ${args.skin_colors? ', skin_colors = $8' : ''}
            ${args.language? ', language = $9' : ''}
            ${args.homeworld? ', homeworld = $10' : ''}
            ${args.url? ', url = $11' : ''}
            ${args.created? ', created = $12' : ''}
            ${args.edited? ', edited = $13' : ''}
            WHERE id = $1
            RETURNING *
          `;

          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update the species`);
        }
      }
    },

    deleteSpecies: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM species
            WHERE id = $1
          `;
          
          const values = [id];
          await client.query(query, values);
          return `Specie deleted successfully`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete the species`);
        }
      },
    },

    createStarship: {
      type: StarshipType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
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
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            INSERT INTO starships (name, model, starship_class, cost_in_credits, length, crew, passengers, max_atmosphering_speed, hyperdrive_rating, MGLT, cargo_capacity, consumables, url, created, edited)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
          `;

          const values = [
            args.name, 
            args.mode,
            args.starship_class,
            args.cost_in_credits,
            args.length,
            args.crew,
            args.hyperdrive_rating,
            args.MGLT,
            args.cargo_capacity,
            args.consumables,
            args.consumable,
            args.url,
            args.created,
            args.edited
          ];

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new starship`)
        }
      },
    },

    updateStarship: {
      type: StarshipType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
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
      },
      resolve: async (_, args) => {
        try {
          const query = `
            UPDATE starships
            SET ${args.name? 'name = $2' : ''}
            ${args.model? ', model = $3' : ''}
            ${args.starship_class? ', starship_class = $4' : ''}
            ${args.cost_in_credits? ', cost_in_credits = $5' : ''}
            ${args.length? ', length = $6' : ''}
            ${args.crew? ', crew = $7' : ''}
            ${args.passengers? ', passengers = $8' : ''}
            ${args.max_atmosphering_speed? ', max_atmosphering_speed = $9' : ''}
            ${args.hyperdrive_rating? ', hyperdrive_rating = $10' : ''}
            ${args.MGLT? ', MGLT = $11' : ''}
            ${args.cargo_capacity? ', cargo_capacity = $12' : ''}
            ${args.consumables? ', consumables = $13' : ''}
            ${args.url? ', url = $14' : ''}
            ${args.created? ', created = $15' : ''}
            ${args.edited? ', edited = $16' : ''}
            WHERE id = $1
            RETURNING *
          `;

          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update a starship`)
        }
      },
    },

    deleteStarship: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM starships
            WHERE id = $1
          `;

          const values = [id];
          await client.query(query, values);
          return `Starship deleted successfully`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete a starship`)
        }
      },
    },

    createVehicle: {
      type: VehicleType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
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
        edited: { type: GraphQLString }
      },
      resolve: async (_, args) => {
        try {
          const query = `
            INSERT INTO vehicles (name, model, vehicle_class, manufacturer, length, cost_in_credits, crew, passengers, cargo_capacity, consumables, url, created, edited)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
          `;

          const values = [
            args.name,
            args.model,
            args.vehicle_class,
            args.manufacturer,
            args.length,
            args.cost_in_credits,
            args.crew,
            args.passengers,
            args.cargo_capacity,
            args.consumables,
            args.url,
            args.created,
            args.edited
          ];

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to create a new vehicle`);
        }
      },
    },

    updateVehicle: {
      type: VehicleType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
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
      },
      resolve: async (_, args) => {
        try {
          const query = `
            UPDATE vehicles
            SET ${args.name? 'name = $2' : ''}
            ${args.model? ', model = $3' : ''}
            ${args.vehicle_class? ', vehicle_class = $4' : ''}
            ${args.manufacturer? ', manufacturer = $5' : ''} 
            ${args.length? ', length = $6' : ''}
            ${args.cost_in_credits? ', cost_in_credits = $7' : ''}
            ${args.crew? ', crew = $8' : ''}
            ${args.passengers? ', passengers = $9' : ''}
            ${args.cargo_capacity? ', cargo_capacity = $10' : ''}
            ${args.consumables? ', consumables = $11' : ''}
            ${args.url? ', url = $12' : ''}
            ${args.created? ', created = $13' : ''}
            ${args.edited? ', edited = $14' : ''}
            WHERE id = $1
            RETURNING *
          `;

          const values = [];

          for(const key in args) {
            if(args !== undefined) values.push(args[key]);
          }

          const result = await client.query(query, values);
          return result.rows[0];

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to update vehicle`);
        }
      }
    },

    deleteVehicle: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }) => {
        try {
          const query = `
            DELETE FROM vehicles
            WHERE id = $1
          `;

          const values = [id];
          await client.query(query, values);
          return `Vehicle successfully deleted`;

        } catch(error) {
          console.error(error);
          throw new Error(`Failed to delete a vehicle`);
        }
      },
    },
    // add more resolvers here
  },
});


module.exports = Mutation;