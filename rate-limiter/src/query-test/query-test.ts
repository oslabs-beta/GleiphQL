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
//const spaceXSchema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()] });
const swapiSchema = await loadSchema('https://swapi-graphql.netlify.app/.netlify/functions/index', { loaders: [new UrlLoader()] });
const countriesSchema = await loadSchema('https://countries.trevorblades.com/graphql', { loaders: [new UrlLoader()] });

//const spaceXTypeInfo = new TypeInfo(spaceXSchema);
const swapiTypeInfo = new TypeInfo(swapiSchema);
const countriesTypeInfo = new TypeInfo(countriesSchema);

// const spacex = createYoga({
//     schema: spaceXSchema,
//     graphiql: true,
//     graphqlEndpoint: '/spacex',
// });
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

interface RateLimitConfig {
  complexityLimit: number,
  paginationLimit: number,
  schema: GraphQLSchema,
  typeInfo: TypeInfo,
  monitor?: boolean,
  refillTime: number,
  refillAmount: number,
  redis?: boolean
}

interface MonitorConfig {
  gliephqlUsername: string,
  gleiphqlPassword: string,
}

const monitorConfig: MonitorConfig = {
  gliephqlUsername: "andrew@gmail.com", // these are not in a dotenv file for example purposes only
  gleiphqlPassword: "password", // these are not in a dotenv file for example purposes only
}

// const spacexConfig: rateLimitConfig = {
//   complexityLimit: 3000,
//   paginationLimit: 10,
//   schema: spaceXSchema,
//   typeInfo: spaceXTypeInfo,
//   monitor: true,
// }

const swapiConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: swapiSchema,
  typeInfo: swapiTypeInfo,
  monitor: true,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
}

const countriesConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: countriesSchema,
  typeInfo: countriesTypeInfo,
  monitor: true,
  refillTime: 86400000,   // 24 hours
  refillAmount: 3000,
  redis: false
}

app.use(express.json());

// app.use('/spacex', rateLimiter(spacexConfig), endpointMonitor, spacex);
app.use('/starwars', rateLimiter(swapiConfig), endpointMonitor(monitorConfig), swapi);
app.use('/countries', rateLimiter(countriesConfig), endpointMonitor(monitorConfig), countries);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});
