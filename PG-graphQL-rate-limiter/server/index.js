const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const { simpleEstimator, getComplexity, directiveEstimator } = require('graphql-query-complexity');
const graphql = require('graphql');
const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema, 
  GraphQLInt,
  parse,
  GraphQLError
} = graphql;
// const schema = require('./schema')
const { loadSchema } = require('@graphql-tools/load')
const { UrlLoader } = require('@graphql-tools/url-loader')

const app = express();


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/connect', async (req, res) => {
  const schema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()] })
  const query = parse(`
  {
    launchesPast(limit: 100) {
      mission_name
      launch_date_local
      launch_site {
        site_name_long
      }
      links {
        article_link
        video_link
      }
      rocket {
        rocket_name
      }
    }
    capsules {
      landings
      missions {
        flight
        name
      }
    }
  }
`)
console.log('parsed query: ', query.definitions[0].selectionSet.selections[0].arguments)

const calculateQueryDepth = (selections) => {
  let maxDepth = 0;
  
  for (const selection of selections) {
    if (selection.selectionSet) {
      const currentDepth = calculateQueryDepth(selection.selectionSet.selections);
      maxDepth = Math.max(maxDepth, currentDepth + 1);
    }
  }
  return maxDepth;
};
try {
  const complexity = getComplexity({
    estimators: [simpleEstimator({ defaultComplexity: 1 })],
    schema,
    query,
    variables: {
      count: 10,
    },
  });
  const depth = calculateQueryDepth(query.definitions[0].selectionSet.selections);
  console.log('Query depth:', depth);
  console.log('Complexity: ', complexity); // Output: 3
} catch (e) {
  // Log error in case complexity cannot be calculated (invalid query, misconfiguration, etc.)
  console.error('Could not calculate complexity', e.message);
}
  res.send({schemaInfo: "filteredSchema"})
})

app.get('*',  (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use((req, res) => res.status(404).send('Page not found'));

app.listen(8080, () => {
  console.log('Server listening on port: 8080...http://localhost:8080/api/connect/');
});