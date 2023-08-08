import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { createClient, RedisClientType } from 'redis';
import { TokenBucket } from '../types';

const redis = async function (config: any, complexityScore: number, req: Request, res: Response, next: NextFunction) : Promise<void> {
  const now: number = Date.now();
  const refillRate: number = config.refillAmount / config.refillTime;
  let requestIP: string = req.ip;
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
    }))
    currRequest = await client.get(requestIP);
  }

  // if the info for the current request is still not found in the cache, then we will throw an error
  if (currRequest === null) {
    await client.disconnect();
    return next(Error);
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
    return next(Error);
  }
  parsedRequest = JSON.parse(currRequest);
  if (complexityScore >= parsedRequest.tokens) {
    if (res.locals.gleiphqlData) {
      res.locals.gleiphqlData.complexityScore = complexityScore;
      try {
        await fetch('http://localhost:3000/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify(res.locals.gleiphqlData)
        });
      }
      catch (err: unknown) {
        console.log('Unable to save to database');
      }
    }
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
              statusText: 'Too Many Requests',
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
  console.log('Tokens before subtraction: ', parsedRequest.tokens);
  parsedRequest.tokens -= complexityScore;
  console.log('Tokens after subtraction: ', parsedRequest.tokens);
  if (res.locals.gleiphqlData) {
    res.locals.gleiphqlData.complexityScore = complexityScore;
    try {
      await fetch('http://localhost:3000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(res.locals.gleiphqlData)
      });
    }
    catch (err: unknown) {
      console.log('Unable to save to database');
    }
  }
  await client.set(requestIP, JSON.stringify(parsedRequest));
  
  // disconnect from the redis client
  await client.disconnect();
}

const nonRedis = function (config: any, complexityScore: number, tokenBucket: TokenBucket, req: Request) : TokenBucket {
  const now: number = Date.now();
  const refillRate: number = config.refillAmount / config.refillTime;
  let requestIP: string = req.ip;
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

const expressCache = {
  redis,
  nonRedis
};

export default expressCache;