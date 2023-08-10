# Summary

This package is intended to be a combined monitoring/rate limiting solution for GraphQL, with pre-query execution static complexity analysis. The primary opinionation of this cost analysis implementation is that the user's schema should be augmented with an @cost directive on relevant non-polymorphic fields and that lists should be provided with an @paginationLimit directive that detail the expected bounds of said list. These directives being applied to the schema are the primary vehicle for user configurability, along with a configuration object that defines default parameters such as whether or not you opt into usage of the monitoring portion of our package, default pagination limits to be applied to lists without an @paginationLimit directive assigned to them, maximum depth etc.

This project derived significant inspiration from this paper by [IBM](https://arxiv.org/abs/2009.05632) and certain aspects of their specification for cost analysis, such as the @cost directive.

# GraphQL Endpoint Monitor
The GraphQL Endpoint Monitor is a package designed to log and monitor traffic metrics for a GraphQL endpoint. The package is available as a plugin for Apollo server or as an Express Middlware. It sends the collected data to our [Developer Portal](gleiphql.com) for visualization. This package is intended to be used alongside our rate limiter package.

## Metrics Collected
The `apolloEndpointMonitor` plugin and `expressEndpointMonitor` middleware collects the following metrics for each GraphQL request:


| Metric           | Type     | Description                                                                              |
| :--------------- | :------- | :--------------------------------------------------------------------------------------- |
| `depth`          | Number   | The depth of the GraphQL query.                                                          |
| `ip`             | String   | The IP address of the client making the request.                                         |
| `url`            | String   | The URL of the GraphQL endpoint.                                                         |
| `timestamp`      | String   | The timestamp when the request was made.                                                 |
| `objectTypes`    | {String} | An object containing the count of each GraphQL object type used in the query.            |
| `queryString`    | String   | The original GraphQL query string.                                                       |
| `complexityScore`| Number   | The complexity score of the GraphQL query.                                               |
| `blocked`        | Boolean  | If the query was blocked by the rate limiter.                                            |
| `complexityLimit`| Number   | The complexity limit set by the user in the rate limiter.                                |

These metrics will be sent to the web application for visualization and monitoring.

## Prerequisites
1. Signup/login to the [GleiphQL developer portal](gleiphql.com).

2. Add the endpoint URL to your account. Make sure the endpoint url you enter in the developer portal matches the endpoint URL of your graphQL API.

3. Import and configure the [GleiphQL rate-limiting package](https://www.npmjs.com/)

## Apollo Server Installation and Usage
If you would like to monitor your endpoint with Apollo server, follow the instructions in this section. The `apolloEndpointMonitor` plugin is intended to be used alongside the `apolloRateLimiter` plugin and the `gleiphqlContext` function, with the apolloEndpointMonitor plugin placed alongside the apolloRateLimiter plugin in the Apollo server.

Installation:
```
npm install gleiphql
```

Usage:
```
import { apolloRateLimiter, apolloEndpointMonitor, gleiphqlContext } from 'gleiphql';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServer } from '@apollo/server';


// Configuration for the expressEndpointMonitor middleware.
const monitorConfig = {
  gleiphqlUsername: process.env.GLEIPHQL_USERNAME,
  gleiphqlPassword: process.env.GLEIPHQL_PASSWORD,
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
* `gleiphqlUsername`: The username to access the web application where the metrics will be displayed.
* `gleiphqlPassword`: The password for the web application authentication.

## Express Installation and Usage
If you would like to monitor your endpoint with Express, follow the instructions in this section. The `expressEndpointMonitor` middleware is intended to be used alongside the `expressRateLimiter` middleware, with the expressRateLimiter middleware placed AFTER the expressEndpointMonitor middleware in the middleware chain.

Installation:

```
npm install gleiphql
```
Usage:
```
import express from 'express';
import { expressEndpointMonitor, expressRateLimiter } from 'gleiphql';
import { createHandler } from 'graphql-http/lib/use/express';

const app = express();

// Configuration for the expressEndpointMonitor middleware.
const monitorConfig = {
  gleiphqlUsername: process.env.GLEIPHQL_USERNAME,
  gleiphqlPassword: process.env.GLEIPHQL_PASSWORD,
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
* `gleiphqlUsername`: The username to access the web application where the metrics will be displayed.
* `gleiphqlPassword`: The password for the web application authentication.


# GraphQL Rate-limiter

The GraphQL Rate-limiter is a package that rate-limits incoming queries based on user defined @cost and @paginationLimit directives applied on the schema level. Infinitely recursive queries are handled by a user-defined depth limit. The default value for maximum depth is 10 if not explicitly configured. The package is available as an Express Middleware or as a plugin for Apollo server. This package can be used with or without the monitoring package.

## Prerequisites

The primary opinionation of this complexity analysis is that the user augments any relevant non-abstract/polymorphic fields and relevant arguments (generally slicing arguments) with a @cost directive. Lists can be augmented with a @paginationLimit directive, or the default paginationLimit defined in the configuration object will be applied to any lists that are encountered.

An example SDL with these specifications is as follows:

```
      directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
      directive @paginationLimit(value: Int) on FIELD_DEFINITION

      type Related {
        content: [Content!]!
      }

      interface Content {
        id: ID!
        title: String!
        related: Related
      }

      type Post implements Content {
        id: ID! @cost(value: 3)
        title: String! @cost(value: 4)
        body: String! @cost(value: 10)
        tags: [String!]! @cost(value: 5)
        related: Related
      }

      type Image implements Content {
        id: ID! @cost(value: 5)
        title: String! @cost(value: 6)
        uri: String! @cost(value: 2)
        related: Related
      }

      union UnionContent = Post | Image

      type Query {
        content: [Content] @paginationLimit(value: 10)
        posts(limit: Int @cost(value:10): [Post] @cost(value: 3) @paginationLimit(value: 10)
        images: [Image] @cost(value: 5) @paginationLimit(value: 10)
        related: [Related] @paginationLimit(value: 10)
        unionContent: [UnionContent] @paginationLimit(value: 10)
      }
```


Each field is augmented with a @cost directive that assigns a cost to each field of the schema based on user input. The @cost directive is strictly there to ensure the cost data is accessible to the complexity analysis portion of the package, it should have no functionality assigned to it beyond that. Without these directives a default value of 1 will be applied to each field. While the cost analysis will still run without augmenting the given schema, the results may not be usable as a heuristic for applying pre-query execution rate-limiting.

## Express Installation and Usage

Installation:

```
npm install gleiphql
```
Usage:
```
import express from 'express';
import { expressRateLimiter } from 'gleiphql';
import { createHandler } from 'graphql-http/lib/use/express';

const app = express();

// Configuration for the expressRateLimiter middleware.

Below is a sample configuration for the sample GraphQL endpoint, the complexityLimit, paginationLimit, refillTime, and refillAmount properties are all up to user interpretation/use case.

const spacexConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 15,
  schema: spaceXSchema,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false
  maxDepth: 15
}

// Apply the expressRateLimiter middleware after the expressRateLimiter middleware, or you can elect to use the rate-limiter alone

app.use('/graphql', expressEndpointMonitor(monitorConfig), expressRateLimiter(rateLimitConfig), createHandler({ schema }));

// Your other middleware and routes go here.
// ...

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000.');
});
```

## Apollo Server Installation and Usage

If you would like to rate-limit on Apollo server, follow the instructions in this section. The `apolloRateLimiter` plugin is intended to work with the `gleiphqlContext` function.

Installation:
```
npm install gleiphql
```

Usage:
```
import { apolloRateLimiter, gleiphqlContext } from 'gleiphql';
import { startStandaloneServer } from '@apollo/server/standalone';


// Configuration for the complexity analysis/rate-limiting middleware.

const spacexConfig: RateLimitConfig = {
  complexityLimit: 3000,
  paginationLimit: 15,
  refillTime: 300000,   // 5 minutes
  refillAmount: 1000,
  redis: false,
  maxDepth: 15,
}


// Apply the apolloRateLimiter plug-in.
const apolloServer = new ApolloServer({
  schema: schema,
  plugins: [
    apolloRateLimiter(apolloConfig),
  ],
});

// Add the gleipqlContext to the stand alone server
const { url } = await startStandaloneServer(apolloServer, {
  context: gleiphqlContext
});
console.log(`🚀 Server ready at ${url}`);
```

## Contributing
If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on our GitHub repository.
