import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { GraphQLSchemaWithContext, createYoga } from 'graphql-yoga';
import endpointMonitor from '../middleware/monitoring.js';
import rateLimiter from '../middleware/rate-limit.js';
import { TypeInfo, GraphQLSchema } from 'graphql'

const app = express();
const port = process.env.PORT || 4000

//loadSchema can be any public graphql endpoint
const spaceXSchema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()] });
const swapiSchema = await loadSchema('https://swapi-graphql.netlify.app/.netlify/functions/index', { loaders: [new UrlLoader()] });
const countriesSchema = await loadSchema('https://countries.trevorblades.com/graphql', { loaders: [new UrlLoader()] });

const spaceXTypeInfo = new TypeInfo(spaceXSchema);
const swapiTypeInfo = new TypeInfo(swapiSchema);
const countriesTypeInfo = new TypeInfo(countriesSchema);

const spacex = createYoga({
    schema: spaceXSchema,
    graphiql: true,
    graphqlEndpoint: '/spacex',
});
const swapi = createYoga({
  schema: swapiSchema,
  graphiql: true,
  graphqlEndpoint: '/starwars',
});
const countries = createYoga({
  schema: countriesSchema,
  graphiql: true,
  graphqlEndpoint: '/countries',
});

interface testConfig {
  complexityLimit: number,
  paginationLimit: number,
  schema: GraphQLSchema,
  typeInfo: TypeInfo,
  monitor: boolean,
}

const spacexConfig: testConfig = {
  complexityLimit: 400,
  paginationLimit: 10,
  schema: spaceXSchema,
  typeInfo: spaceXTypeInfo,
  monitor: true,
}

const swapiConfig: testConfig = {
  complexityLimit: 200,
  paginationLimit: 10,
  schema: swapiSchema,
  typeInfo: swapiTypeInfo,
  monitor: true,
}

const countriesConfig: testConfig = {
  complexityLimit: 200,
  paginationLimit: 10,
  schema: countriesSchema,
  typeInfo: countriesTypeInfo,
  monitor: true,
}

app.use(express.json());

app.use('/spacex', rateLimiter(spacexConfig), endpointMonitor, spacex);
app.use('/starwars', rateLimiter(swapiConfig), endpointMonitor, swapi);
app.use('/countries', rateLimiter(countriesConfig), endpointMonitor, countries);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});
