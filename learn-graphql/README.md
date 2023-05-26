/* A quick setup to learn and play around with graph QL queries.

To exercise graph QL queries:
- Change directory to "server" from within "learn-graphql" folder
- npm install
- run "npm run dev"
- Navigate to http://localhost:8000/graphql
- Create queries

- Check index.js file. Can switch out the schemas to play around with. Uncomment the schema you wish to use and be sure to comment out the other. There are currently two schemas:
  a) books and authors schema which has mock data that is declared locally in its schema file
  b) starwars api that uses swapi.dev endpoint. 


This is the current longest query able to run before getting time out error:

{
	people(id: 10) {
    name
    birth_year
    eye_color
    gender
    hair_color
    height
    mass
    skin_color
    homeworld
    films {
      title
      episode_id
      opening_crawl
      director
      release_date
      characters {
        name
        # films {
        #   title
        # }
      }
    }
  }
}

Notice I commented out films for each character. Running that was too expensive. 
*/