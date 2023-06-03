import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { createYoga } from 'graphql-yoga';
import endpointMonitor from '../middleware/monitoring.js';
import rateLimiter from '../middleware/rate-limit.js';

const app = express();
const port = process.env.PORT || 4000

//loadSchema can be any public graphql endpoint
const spaceXSchema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()] });
const swapiSchema = await loadSchema('https://swapi-graphql.netlify.app/.netlify/functions/index', { loaders: [new UrlLoader()] });
const countriesSchema = await loadSchema('https://countries.trevorblades.com/graphql', { loaders: [new UrlLoader()] });

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

app.use(express.json());

app.use('/spacex', rateLimiter(spaceXSchema, { testConfig: 'testConfig' }), endpointMonitor, spacex);
app.use('/starwars', rateLimiter(swapiSchema, { testConfig: 'testConfig' }), endpointMonitor, swapi);
app.use('/countries', rateLimiter(countriesSchema, { testConfig: 'testConfig' }), endpointMonitor, countries);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});