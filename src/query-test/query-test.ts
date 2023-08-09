import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { createYoga } from 'graphql-yoga';
import { ApolloServer, BaseContext } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import pmTEST from './pm-test.js';
import { expressMiddleware } from '@apollo/server/express4';
import { expressRateLimiter, expressEndpointMonitor, apolloRateLimiter, apolloEndpointMonitor, gleiphqlContext } from '../index.js';
import { MonitorConfig, RateLimitConfig, ApolloConfig} from '../types';

const app = express();
const port = process.env.PORT || 4000;

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
const pm = createYoga({
  schema: pmTEST.builtSchema,
  graphiql: true,
  graphqlEndpoint: '/pmtest',
});



const monitorConfig: MonitorConfig = {
  gleiphqlUsername: 'andrew@gmail.com', // these are not in a dotenv file for example purposes only
  gleiphqlPassword: 'password', // these are not in a dotenv file for example purposes only
}

const spacexConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: spaceXSchema,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
  maxDepth: 5
}

const swapiConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: swapiSchema,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
  maxDepth: 5,
}

const countriesConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: countriesSchema,
  refillTime: 86400000,   // 24 hours
  refillAmount: 3000,
  redis: false,
  maxDepth: 5
}

const pmConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: pmTEST.builtSchema,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
  maxDepth: 2
}

const apolloConfig: ApolloConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
  maxDepth: 5
}

app.use(express.json());


const apolloServer: ApolloServer<BaseContext> = new ApolloServer({
  schema: swapiSchema,
  plugins: [
    apolloRateLimiter(apolloConfig),
    apolloEndpointMonitor(monitorConfig)
  ],
});
await apolloServer.start();
// const { url } = await startStandaloneServer(apolloServer, {
//   context: async ({ req }) => {
//     const clientIP =
//       req.headers['x-forwarded-for'] || // For reverse proxies
//       req.socket.remoteAddress;
//     return { clientIP };
//   },
// });
// console.log(`🚀 Server ready at ${url}`);

app.use('/apollo', expressMiddleware(apolloServer, {
    context: gleiphqlContext
}))
app.use('/spacex', expressEndpointMonitor(monitorConfig), expressRateLimiter(spacexConfig), spacex);
app.use('/starwars', expressEndpointMonitor(monitorConfig), expressRateLimiter(swapiConfig), swapi);
app.use('/countries', expressRateLimiter(countriesConfig), expressEndpointMonitor(monitorConfig), countries);
app.use('/pmtest', expressEndpointMonitor(monitorConfig), expressRateLimiter(pmConfig), pm);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});
