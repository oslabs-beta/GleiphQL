import { Request, Response, NextFunction } from 'express';
import { isAbstractType, GraphQLInterfaceType, isNonNullType, GraphQLType, GraphQLField, parse, GraphQLList, GraphQLObjectType, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo, StringValueNode, getNamedType, GraphQLNamedType, getEnterLeaveForKind, GraphQLCompositeType, getNullableType, Kind, isListType, DocumentNode } from 'graphql';
import graphql from 'graphql';
import { useSchema } from 'graphql-yoga';
import { createClient } from 'redis';

//to-dos
//modularize code, certain functions can be offloaded
//research further into pagination conventions => currently only account for IntValues for first/last/limit
//compare limits found in arguments against both defaultLimit and limits found within schema => defaultLimit case resolved, limits found in schema not resolved
//generate casing for mutations/subscriptions

const rateLimiter = function (config: any) {
  interface TokenBucket {
    [key: string]: {
      tokens: number;
      lastRefillTime: number;
    };
  }
  const tokenBucket: TokenBucket = {};
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.query) {

      const parsedAst = parse(req.body.query);
      let parentTypeStack: any[]= [];
      let complexityScore = 0;
      let typeComplexity = 0;
      let resolveComplexity = 0;
      let currMult = 0;
      const now = Date.now();
      const refillRate = config.refillAmount / config.refillTime
      let requestIP = req.ip

      // fixes format of ip addresses
      if (requestIP.includes('::ffff:')) {
        requestIP = requestIP.replace('::ffff:', '');
      }

      // if (!ipAddresses[requestIP]) {
      //   ipAddresses[requestIP] = {
      //     tokens: config.complexityLimit,
      //     lastRefillTime: now,
      //   }
      // }
      // const timeElapsed = now - ipAddresses[requestIP].lastRefillTime;
      // const tokensToAdd = timeElapsed * refillRate; // decimals
      // // const tokensToAdd = Math.floor(timeElapsed * refillRate); // no decimals
      // console.log('tokensToAdd:', tokensToAdd)
      // ipAddresses[requestIP].tokens = Math.min(
      //   ipAddresses[requestIP].tokens + tokensToAdd,
      //   config.complexityLimit
      // );
      // console.log('ipAddresses[reqIP].tokens:', ipAddresses[requestIP].tokens)
      // ipAddresses[requestIP].lastRefillTime = now;

      // if (config.redis === true) {
      //   const client = createClient();
      //   await client.connect();
      //   let currRequest = await client.get(requestIP)
  
      //   if (currRequest === null) {
      //     await client.set(requestIP, JSON.stringify({
      //       tokens: config.complexityLimit,
      //       lastRefillTime: now,
      //     }))
      //     currRequest = await client.get(requestIP)
      //   }
      //   // const value = await client.get(requestIP);
      //   if (currRequest === null) {
      //     return next(Error);
      //   }
      //   const parsedVal = JSON.parse(currRequest)
      //   const timeElapsed2 = now - parsedVal.lastRefillTime;
      //   const tokensToAdd2 = timeElapsed2 * refillRate; // decimals
      //   // const tokensToAdd = Math.floor(timeElapsed2 * refillRate); // no decimals
      //   console.log("tokensToAdd2: ", tokensToAdd2)
      //   parsedVal.tokens = Math.min(
      //     parsedVal.tokens + tokensToAdd2,
      //     config.complexityLimit
      //   );
      //   console.log('redis tokens:', parsedVal.tokens)
      //   parsedVal.lastRefillTime = now;
      //   await client.set(requestIP, JSON.stringify(parsedVal))
      //   console.log('REDIS tokens before subtraction: ', parsedVal.tokens)
      // }

      visit(parsedAst, visitWithTypeInfo(config.typeInfo, {
        enter(node) {

          //upon entering field, updates the parentTypeStack, which is the stack of all field ancestors of current field node
          if (node.kind === Kind.FIELD) {

            //resets list multiplier upon encountering an empty stack, indicating that a set of nested fields has been exited
            if(parentTypeStack.length === 0) currMult = 0;

            const parentType = config.typeInfo.getParentType();
            if (parentType) {
            const fieldDef = parentType && isAbstractType(parentType) ? config.typeInfo.getFieldDef() : parentType.getFields()[node.name.value];

            if(fieldDef) {
            const fieldDefArgs = fieldDef.args;
            const fieldType = getNullableType(fieldDef.type);
            // const fieldDirectives = fieldDef.astNode.directives;
            // if(fieldDirectives) {
            //   //@ts-ignore
            //   const cost = fieldDirectives.find(directive => directive.name.value === 'cost');
            // }
            const isList = isListType(fieldType) || (isNonNullType(fieldType) && isListType(fieldType.ofType));

            console.log('This is the currentNode:', node.name.value);
            //functionality upon encountering listType, in short looks for ancestor lists and limit arguments then adjusts currMult accordingly
            if(isList === true) {
              console.log(`${node.name.value} is a list`);
              const argNode = node.arguments?.find(arg => (arg.name.value === 'limit' || arg.name.value === 'first' || arg.name.value === 'last'));
              currMult = config.paginationLimit;
              if (argNode && argNode.value.kind === 'IntValue') {
                const argValue = parseInt(argNode.value.value, 10);
                console.log(`Found limit argument with value ${argValue}`);
                currMult = argValue;
              }
              console.log('Mult is now:', currMult);
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  //assuming the list is currently nested within another list, adjust resolve complexity by number of list calls
                  //indicated by the multiplier inherited by the previous list
                  resolveComplexity += parentTypeStack[i].currMult;
                  resolveComplexity--;
                  currMult = currMult * parentTypeStack[i].currMult
                  break;
                }
              }

              //base case addition of resolveComplexity, offset in above for-loop for list cases
              resolveComplexity++;
              typeComplexity += currMult;

              //handling for object types, checks for most recent ancestor list's multiplier then adjust accordingly
            } else if (fieldType instanceof GraphQLObjectType) {
              for (let i = parentTypeStack.length-1; i >= 0; i--) {
                if(parentTypeStack[i].isList === true) {
                  resolveComplexity += parentTypeStack[i].currMult;
                  resolveComplexity--;
                  currMult = parentTypeStack[i].currMult
                  break;
                }
              }

              //if the currMult === 0 indicates object not nested in list, simply increment complexity score
              if(currMult !== 0) typeComplexity += currMult; else typeComplexity++;
              resolveComplexity++;
            }
            parentTypeStack.push({fieldDef, isList, fieldDefArgs, currMult});
          }
        }
        }
        },
        leave(node) {
          if (node.kind === Kind.FIELD) {
            parentTypeStack.pop();
          }
        }
      }));


      complexityScore = resolveComplexity + typeComplexity;
      console.log('This is the type complexity', typeComplexity);
      console.log('This is the resolve complexity', resolveComplexity);
      console.log('This is the complexity score:', complexityScore);

      //returns error if complexity heuristic reads complexity score over limit
      //if(config.monitor === true) {
        res.locals.complexityScore = complexityScore;
        res.locals.complexityLimit = config.complexityLimit;
      //   return next();
      // }

      // if the user wants to use redis, a redis instance will be spun up and used as a cache
      if (config.redis === true) {
        const client = createClient();
        await client.connect();
        let currRequest = await client.get(requestIP)
  
        if (currRequest === null) {
          await client.set(requestIP, JSON.stringify({
            tokens: config.complexityLimit,
            lastRefillTime: now,
          }))
          currRequest = await client.get(requestIP)
        }
        // const value = await client.get(requestIP);
        if (currRequest === null) {
          await client.disconnect();
          return next(Error);
        }
        let parsedVal = JSON.parse(currRequest)
        const timeElapsed2 = now - parsedVal.lastRefillTime;
        const tokensToAdd2 = timeElapsed2 * refillRate; // decimals
        // const tokensToAdd = Math.floor(timeElapsed2 * refillRate); // no decimals
        console.log("tokensToAdd2: ", tokensToAdd2)
        parsedVal.tokens = Math.min(
          parsedVal.tokens + tokensToAdd2,
          config.complexityLimit
        );
        console.log('redis tokens:', parsedVal.tokens)
        parsedVal.lastRefillTime = now;
        await client.set(requestIP, JSON.stringify(parsedVal))
        console.log('REDIS tokens before subtraction: ', parsedVal.tokens)

        /////////////////////////////////////////////////////

        currRequest = await client.get(requestIP)
        if (currRequest === null) {
          await client.disconnect();
          return next(Error);
        }
        parsedVal = JSON.parse(currRequest)
        if (complexityScore >= parsedVal.tokens) {
          console.log('Complexity of this query is too high');
          await client.disconnect();
          return next(Error);
        }
        parsedVal.tokens -= complexityScore;
        console.log('REDIS tokens after subtraction: ', parsedVal.tokens)
        await client.set(requestIP, JSON.stringify(parsedVal))
        
        // disconnect from the redis client
        await client.disconnect();
      }

      // if the user does not want to use redis, the cache will be saved in the "tokenBucket" object
      else if (config.redis !== true) {
        if (!tokenBucket[requestIP]) {
          tokenBucket[requestIP] = {
            tokens: config.complexityLimit,
            lastRefillTime: now,
          }
        }
        const timeElapsed = now - tokenBucket[requestIP].lastRefillTime;
        console.log('time elapsed', timeElapsed)
        const tokensToAdd = timeElapsed * refillRate; // decimals
        // const tokensToAdd = Math.floor(timeElapsed * refillRate); // no decimals
        console.log('tokensToAdd:', tokensToAdd)
        tokenBucket[requestIP].tokens = Math.min(
          tokenBucket[requestIP].tokens + tokensToAdd,
          config.complexityLimit
        );
        console.log('tokenBucket[requestIP].tokens:', tokenBucket[requestIP].tokens)
        tokenBucket[requestIP].lastRefillTime = now;
        ///////////////////////////////////////////////////////////////////
        if (complexityScore >= tokenBucket[requestIP].tokens) {
          console.log('Complexity of this query is too high');
          return next(Error);
        }
        console.log('tokens before subtraction: ', tokenBucket[requestIP].tokens)
        tokenBucket[requestIP].tokens -= complexityScore;
        console.log('tokens after subtraction: ', tokenBucket[requestIP].tokens)
        console.log('tokens : ', tokenBucket)
        // if(complexityScore >= config.complexityLimit) {
        //   console.log('Complexity of this query is too high');
        //   return next(Error);
        // }
      }
      
    };
  return next();
  }
}
export default rateLimiter;
