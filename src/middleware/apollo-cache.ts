import { GraphQLError } from 'graphql';
import { RedisClientType, createClient } from 'redis';
import { TokenBucket } from '../types';

const redis = async function (config: any, complexityScore: number, requestContext: any) : Promise<void> {
  const now: number = Date.now();
  const refillRate: number = config.refillAmount / config.refillTime;
  let requestIP: string = config.requestContext.contextValue.clientIP;
  // fixes format of ip addresses
  if (requestIP.includes('::ffff:')) {
    requestIP = requestIP.replace('::ffff:', '');
  }

  const client: RedisClientType = createClient();
  await client.connect();
  let currRequest: string | null = await client.get(requestIP);

  // if the info for the current request is not found in the cache, then an entry will be created for it
  if (currRequest === null) {
    await client.set(requestIP, JSON.stringify({
      tokens: config.complexityLimit,
      lastRefillTime: now,
    }));
    currRequest = await client.get(requestIP);
  }

  // if the info for the current request is still not found in the cache, then we will throw an error
  if (currRequest === null) {
    await client.disconnect();
    throw new GraphQLError('Redis Error in apollo-cache.ts');
  }

  let parsedRequest: {
    tokens: number,
    lastRefillTime: number
  } = JSON.parse(currRequest);
  const timeElapsed: number = now - parsedRequest.lastRefillTime;
  const tokensToAdd: number = timeElapsed * refillRate; // decimals
  // const tokensToAdd = Math.floor(timeElapsed2 * refillRate); // no decimals

  parsedRequest.tokens = Math.min(
    parsedRequest.tokens + tokensToAdd,
    config.complexityLimit
  );

  parsedRequest.lastRefillTime = now;
  await client.set(requestIP, JSON.stringify(parsedRequest));

  currRequest = await client.get(requestIP);
  if (currRequest === null) {
    await client.disconnect();
    throw new GraphQLError('Redis Error in apollo-cache.ts');
  }

  parsedRequest = JSON.parse(currRequest);
  if (complexityScore >= parsedRequest.tokens) {
    requestContext.contextValue.blocked = true;
    console.log('Complexity of this query is too high');
    await client.disconnect();
    throw new GraphQLError('Complexity of this query is too high', {
      extensions: {
        cost: {
          requestedQueryCost: complexityScore,
          currentTokensAvailable:  Number(parsedRequest.tokens.toFixed(2)),
          maximumTokensAvailable: config.complexityLimit,
        }
      },
    });
  }
  console.log('Tokens before subtraction: ', parsedRequest.tokens);
  parsedRequest.tokens -= complexityScore;
  console.log('Tokens after subtraction: ', parsedRequest.tokens);
  await client.set(requestIP, JSON.stringify(parsedRequest));

  // disconnect from the redis client
  await client.disconnect();
}

const nonRedis = function (config: any, complexityScore: number, tokenBucket: TokenBucket) : TokenBucket {
  const now: number = Date.now();
  const refillRate: number = config.refillAmount / config.refillTime;
  let requestIP: string = config.requestContext.contextValue.clientIP;
  // fixes format of ip addresses
  if (requestIP.includes('::ffff:')) {
    requestIP = requestIP.replace('::ffff:', '');
  }

  // if the info for the current request is not found in the cache, then an entry will be created for it
  if (!tokenBucket[requestIP]) {
    tokenBucket[requestIP] = {
      tokens: config.complexityLimit,
      lastRefillTime: now,
    }
  }
  const timeElapsed: number = now - tokenBucket[requestIP].lastRefillTime;
  const tokensToAdd: number = timeElapsed * refillRate; // decimals
  // const tokensToAdd = Math.floor(timeElapsed * refillRate); // no decimals

  tokenBucket[requestIP].tokens = Math.min(
    tokenBucket[requestIP].tokens + tokensToAdd,
    config.complexityLimit
  );
  tokenBucket[requestIP].lastRefillTime = now;

  return tokenBucket;
}

const apolloCache = {
  redis,
  nonRedis
};

export default apolloCache;