import { ApolloServer, gql } from 'apollo-server';
import axios from 'axios';

// define your graphQL schema
const typeDefs = gql`
  type Film {
    title: String
    episode_id: String 
    opening_crawl: String 
    director: String 
    producer: String 
    release_date: Int
    species: String
    starships: String
    vehicles: String  
    characters: String 
    planets: String 
    url: String 
    created: Int
    edited: Int
  }
  
  type People {
    birth_year
    eye_color
    films 
    gender
    hair_color
    height
    homeworld
    mass
    name
    skin_color
    created 
    edited 
    species 
    starships
    vehicles
    url 
  }
  
  type Planet {
    name 
    diameter 
    rotation_period
    orbital_period
    gravity
    population
    climate
    terrain
    surface_water
    residents 
    films 
    url 
    created 
    edited 
  }
    species {
      name
      classification
      designation 
      average_height 
      average_lifespan
      eye_colors 
      haircolors 
      skin_color
      language 
      homeworld 
      people 
      films 
      url 
      created 
      edited 
    }
    starships {
      name
      model
      starship_class
      manufacturer
      cost_in_credits
      length
      crew
      passengers
      max_atmostphering_speed
      hyperdrive_rating
      MGLT
      cargo_capacity
      consumables
      films
      pilots 
      url 
      created 
      edited 
      name 
      model
    }
    vehicles {
      name
      model 
      vehicles_class
      manufacturer 
      length 
      cost_in_credits 
      crew 
      passengers 
      max_atmostphering_speed 
      cargo_capacity
      consumables 
      films 
      pilot 
      url 
      created 
      edited 
      name
      model
    }
  }
`;