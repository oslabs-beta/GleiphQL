import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

interface TokenBucket {
  [key: string]: {
    tokens: number;
    lastRefillTime: number;
  };
}

const redis = async function (config: any, complexityScore: number, req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const refillRate = config.refillAmount / config.refillTime
  let requestIP = req.ip
  // fixes format of ip addresses
  if (requestIP.includes('::ffff:')) {
    requestIP = requestIP.replace('::ffff:', '');
  }

  const client = createClient();
  await client.connect();
  let currRequest = await client.get(requestIP)

  // if the info for the current request is not found in the cache, then an entry will be created for it
  if (currRequest === null) {
    await client.set(requestIP, JSON.stringify({
      tokens: config.complexityLimit,
      lastRefillTime: now,
    }))
    currRequest = await client.get(requestIP)
  }

  // if the info for the current request is still not found in the cache, then we will throw an error
  if (currRequest === null) {
    await client.disconnect();
    return next(Error);
  }

  let parsedRequest = JSON.parse(currRequest)
  const timeElapsed = now - parsedRequest.lastRefillTime;
  const tokensToAdd = timeElapsed * refillRate; // decimals
  // const tokensToAdd = Math.floor(timeElapsed2 * refillRate); // no decimals

  parsedRequest.tokens = Math.min(
    parsedRequest.tokens + tokensToAdd,
    config.complexityLimit
  );

  parsedRequest.lastRefillTime = now;
  await client.set(requestIP, JSON.stringify(parsedRequest))

  currRequest = await client.get(requestIP)
  if (currRequest === null) {
    await client.disconnect();
    return next(Error);
  }
  parsedRequest = JSON.parse(currRequest)
  if (complexityScore >= parsedRequest.tokens) {
    const error = {
      errors: [
        {
          message: `Token limit exceeded`,
          extensions: {
            cost: {
              requestedQueryCost: complexityScore,
              currentTokensAvailable:  Number(parsedRequest.tokens.toFixed(2)),
              maximumTokensAvailable: config.complexityLimit,
            },
            responseDetails: {
              status: 429,
              statusText: "Too Many Requests",
            }
          }
        }
      ]
    }
    console.log('Complexity of this query is too high');
    await client.disconnect();
    res.status(429).json(error);
    return next(Error);
  }
  console.log('Tokens before subtraction: ', parsedRequest.tokens)
  parsedRequest.tokens -= complexityScore;
  console.log('Tokens after subtraction: ', parsedRequest.tokens)
  await client.set(requestIP, JSON.stringify(parsedRequest))

  // disconnect from the redis client
  await client.disconnect();
}

const nonRedis = function (config: any, complexityScore: number, tokenBucket: TokenBucket, req: Request) {
  const now = Date.now();
  const refillRate = config.refillAmount / config.refillTime
  let requestIP = req.ip
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
  const timeElapsed = now - tokenBucket[requestIP].lastRefillTime;
  const tokensToAdd = timeElapsed * refillRate; // decimals
  // const tokensToAdd = Math.floor(timeElapsed * refillRate); // no decimals

  tokenBucket[requestIP].tokens = Math.min(
    tokenBucket[requestIP].tokens + tokensToAdd,
    config.complexityLimit
  );
  tokenBucket[requestIP].lastRefillTime = now;

  return tokenBucket
}

const cache = {
  redis,
  nonRedis
}

export default cache