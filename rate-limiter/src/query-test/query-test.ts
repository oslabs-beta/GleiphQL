import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { GraphQLSchemaWithContext, createYoga } from 'graphql-yoga';
import { TypeInfo, GraphQLSchema, GraphQLError } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone';
import pmTEST from './pm-test.js';
import { expressMiddleware } from '@apollo/server/express4';
import { expressRateLimiter, expressEndpointMonitor, apolloRateLimiter, apolloEndpointMonitor } from '../index.js';

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
const pm = createYoga({
  schema: pmTEST.builtSchema,
  graphiql: true,
  graphqlEndpoint: '/pmTest',
});

interface RateLimitConfig {
  complexityLimit: number,
  paginationLimit: number,
  schema: GraphQLSchema,
  typeInfo: TypeInfo,
  refillTime: number,
  refillAmount: number,
  redis?: boolean
}

interface MonitorConfig {
  gliephqlUsername: string,
  gleiphqlPassword: string,
}

const monitorConfig: MonitorConfig = {
  gliephqlUsername: 'andrew@gmail.com', // these are not in a dotenv file for example purposes only
  gleiphqlPassword: 'password', // these are not in a dotenv file for example purposes only
}

const spacexConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: spaceXSchema,
  typeInfo: spaceXTypeInfo,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
}

const swapiConfig: RateLimitConfig = {
  complexityLimit: 30000,
  paginationLimit: 10,
  schema: swapiSchema,
  typeInfo: swapiTypeInfo,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
}

const countriesConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: countriesSchema,
  typeInfo: countriesTypeInfo,
  refillTime: 86400000,   // 24 hours
  refillAmount: 3000,
  redis: false
}

const pmConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: pmTEST.builtSchema,
  typeInfo: pmTEST.schemaType,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
}

const apolloConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  typeInfo: swapiTypeInfo,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
}

app.use(express.json());


const apolloServer = new ApolloServer({
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
    context: async ({ req }) => {
      const clientIP =
        req.headers['x-forwarded-for'] || // For reverse proxies
        req.socket.remoteAddress;  
      return { clientIP };
    }
}))
app.use('/spacex', expressEndpointMonitor(monitorConfig), expressRateLimiter(spacexConfig), spacex);
app.use('/starwars', expressEndpointMonitor(monitorConfig), expressRateLimiter(swapiConfig), swapi);
app.use('/countries', expressRateLimiter(countriesConfig), expressEndpointMonitor(monitorConfig), countries);
app.use('/pmTest', expressEndpointMonitor(monitorConfig), expressRateLimiter(pmConfig), pm);

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
});
