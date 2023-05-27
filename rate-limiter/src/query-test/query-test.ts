import { config } from 'dotenv';
config();
import express from 'express';
import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { createYoga } from 'graphql-yoga'
import endpointMonitor from '../middleware/monitoring.js';

const app = express();

//loadSchema can be any public graphql endpoint
const publicSchema = await loadSchema('https://spacex-production.up.railway.app/', { loaders: [new UrlLoader()]})

const yoga = createYoga({
  schema: publicSchema,
  graphiql: true
})

app.use(express.json());

app.use('/graphql', endpointMonitor, yoga)

app.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})