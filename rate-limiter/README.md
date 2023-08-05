# GraphQL Endpoint Monitor
The GraphQL Endpoint Monitor is a package designed to log and monitor traffic metrics for a GraphQL endpoint. The package is available as an Express Middlware or as a plugin for Apollo server. It sends the collected data to a web application for visualization. This package is intended to be used alongside the expressRateLimiter middleware, with the expressRateLimiter middleware placed after the expressEndpointMonitor middleware in the middleware chain.

## Metrics Collected
The `expressEndpointMonitor` middleware and `apolloEndpointMonitor` plugin collects the following metrics for each GraphQL request:


| Metric           | Type     | Description                                                                              |
| :--------------- | :------- | :--------------------------------------------------------------------------------------- |
| depth            | Number   | The depth of the GraphQL query.                                                          |
| ip               | String   | The IP address of the client making the request.                                         |
| url              | String   | The URL of the GraphQL endpoint.                                                         |
| timestamp        | String   | The timestamp when the request was made.                                                 |
| objectTypes      | {String} | An object containing the count of each GraphQL object type used in the query.            |
| queryString      | String   | The original GraphQL query string.                                                       |
| `complexityScore`| Number   | The complexity score of the GraphQL query.                                               |
| `blocked`        | Boolean  | If the query was blocked by the rate limiter.                                            |
| `complexityLimit`| Number   | The complexity limit set by the user in the rate limiter.                                |

These metrics will be sent to the web application for visualization and monitoring.

## Prerequisites
1. Signup/login to the [GleiphQL developer portal](gleiphql.com).

2. Add the endpoint URL to your account. Make sure the endpoint url you enter in the developer portal matches the endpoint URL of your graphQL API. 

3. Import and configure the [GleiphQL rate-limiting package](https://www.npmjs.com/)

## Express Installation and Usage
If you would like to monitor your endpoint with Express, follow the instructions in this section. The `expressEndpointMonitor` middleware is intended to be used alongside the `expressRateLimiter` middleware, with the expressRateLimiter middleware placed AFTER the expressEndpointMonitor middleware in the middleware chain.

Installation:

```
npm install gleiphql --save
```
Usage:
```
import express from 'express';
import { expressEndpointMonitor, expressRateLimiter } from 'gleiphql';
import { createHandler } from 'graphql-http/lib/use/express';

const app = express();

// Configuration for the expressEndpointMonitor middleware.
const monitorConfig = {
  gliephqlUsername: process.env.GLEIPHQL_USERNAME,
  gliephqlPassword: process.env.GLEIPHQL_PASSWORD,
};

// Apply the expressEndpointMonitor middleware before the expressRateLimiter middleware.
app.use('/graphql', expressEndpointMonitor(monitorConfig), expressRateLimiter(rateLimitConfig), createHandler({ schema }));

// Your other middleware and routes go here.
// ...

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000.');
});
```

The `expressEndpointMonitor` middleware takes a configuration object with the following properties:
* `gliephqlUsername`: The username to access the web application where the metrics will be displayed.
* `gliephqlPassword`: The password for the web application authentication.



## Apollo Server Installation and Usage
If you would like to monitor your endpoint with Apollo server, follow the instructions in this section. The `apolloEndpointMonitor` plugin is intended to be used alongside the `apolloRateLimiter` plugin and the `gleiphqlContext` function, with the apolloEndpointMonitor plugin placed alongside the apolloRateLimiter plugin in the Apollo server.

Installation:
```
npm install gleiphql --save
```

Usage:
```
import express from 'express';
import { apolloRateLimiter, apolloEndpointMonitor, gleiphqlContext } from 'gleiphql';
import { createHandler } from 'graphql-http/lib/use/express';


// Configuration for the expressEndpointMonitor middleware.
const monitorConfig = {
  gliephqlUsername: process.env.GLEIPHQL_USERNAME,
  gliephqlPassword: process.env.GLEIPHQL_PASSWORD,
};

// Apply the apolloEndpointMonitor plugin along with the apolloRateLimiter middleware.
const apolloServer = new ApolloServer({
  schema: schema,
  plugins: [
    apolloRateLimiter(apolloConfig),
    apolloEndpointMonitor(monitorConfig)
  ],
});

// Add the gleipqlContext to the stand alone server
const { url } = await startStandaloneServer(apolloServer, {
  context: gleiphqlContext
});
console.log(`🚀 Server ready at ${url}`);
```

The `apolloEndpointMonitor` plugin takes a configuration object with the following properties:
* `gliephqlUsername`: The username to access the web application where the metrics will be displayed.
* `gliephqlPassword`: The password for the web application authentication.


## Contributing
If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on our GitHub repository.