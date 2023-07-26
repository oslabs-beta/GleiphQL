import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { GraphQLSchemaWithContext, createYoga } from 'graphql-yoga';
import endpointMonitor from '../middleware/monitoring.js';
import rateLimiter from '../middleware/rate-limit.js';
import { TypeInfo, GraphQLSchema, GraphQLError } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone';
import rateLimiterPlugin from '../middleware/apollo-plugin.js';
import pmTEST from './pm-test.js';

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
  gliephqlUsername: 'andrew@gmail.com', // these are not in a dotenv file for example purposes only
  gleiphqlPassword: 'password', // these are not in a dotenv file for example purposes only
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

const pmConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 10,
  schema: pmTEST.builtSchema,
  typeInfo: pmTEST.schemaType,
  monitor: true,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
}

app.use(express.json());


const gleiphQLRateLimit = () => {
  interface TokenBucket {
    [key: string]: {
      tokens: number;
      lastRefillTime: number;
    };
  }
  let tokenBucket: TokenBucket = {};
  return {
  async requestDidStart(requestContext: any) {
    return {
      async didResolveOperation(requestContext: any) {
        if (requestContext.operationName !== 'IntrospectionQuery') {
          console.log('Validation started!', requestContext.operationName);
          const result = await rateLimiterPlugin({
            complexityLimit: 3000,
            paginationLimit: 10,
            schema: requestContext.schema,
            typeInfo: swapiTypeInfo,
            monitor: true,
            refillTime: 300000,   // 5 minutes
            refillAmount: 1000,
            redis: false,
            requestContext,
            testast: requestContext.document,
            tokenBucket,
          })
          if (result === 'TEST') {
            throw new GraphQLError('Complexity of this query is too high', {
              extensions: { 
                code: 'TOO MANY REQUESTS', 
                TEST: 'TEST' 
              },
            });
          }
        }
      },
    };
  },
  }
};

const apolloServer = new ApolloServer({
  schema: swapiSchema,
  plugins: [
    gleiphQLRateLimit()
  ],
});

const { url } = await startStandaloneServer(apolloServer, {
  context: async ({ req }) => {
    const clientIP =
      req.headers['x-forwarded-for'] || // For reverse proxies
      req.socket.remoteAddress;  
    return { clientIP };
  },
});
console.log(`🚀 Server ready at ${url}`);

// app.use('/spacex', rateLimiter(spacexConfig), endpointMonitor, spacex);
app.use('/starwars', rateLimiter(swapiConfig), endpointMonitor(monitorConfig), swapi);
app.use('/countries', rateLimiter(countriesConfig), endpointMonitor(monitorConfig), countries);
app.use('/pmTest', rateLimiter(pmConfig), endpointMonitor(monitorConfig), pm);

// app.listen(port, () => {
//     console.info(`Server is running on http://localhost:${port}/spacex http://localhost:${port}/starwars http://localhost:${port}/countries`);
// });
