import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { createYoga } from 'graphql-yoga'
import endpointMonitor from '../middleware/monitoring.js';
import rateLimiter from '../middleware/rate-limit.js';
import { TypeInfo } from 'graphql'

const app = express();

//loadSchema can be any public graphql endpoint
const publicSchema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()]})

const schemaTypeInfo = new TypeInfo(publicSchema);

const yoga = createYoga({
  schema: publicSchema,
  graphiql: true
})

const limit = 200;

const listLimit = 10;

app.use(express.json());

app.use('/graphql', rateLimiter(limit, listLimit, publicSchema, schemaTypeInfo, {testConfig: 'testConfig'}), endpointMonitor, yoga)

app.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql")
})