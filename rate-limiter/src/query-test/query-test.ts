import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { createYoga } from 'graphql-yoga';
import endpointMonitor from '../middleware/monitoring.js';
import rateLimiter from '../middleware/rate-limit.js';
import { TypeInfo } from 'graphql'

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

const limit = 200;

const listLimit = 10;

app.use(express.json());

app.use('/spacex', rateLimiter(limit, listLimit, spaceXSchema, spaceXTypeInfo, { testConfig: 'testConfig' }), endpointMonitor, spacex);
app.use('/starwars', rateLimiter(limit, listLimit, swapiSchema, swapiTypeInfo, { testConfig: 'testConfig' }), endpointMonitor, swapi);
app.use('/countries', rateLimiter(limit, listLimit, countriesSchema, countriesTypeInfo, { testConfig: 'testConfig' }), endpointMonitor, countries);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});
