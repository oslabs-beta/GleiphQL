import { Request, Response, NextFunction } from 'express';
import { parse, visit, FieldNode, Kind, DocumentNode, DefinitionNode } from 'graphql';
import fetch from 'node-fetch';
import { MonitorConfig, EndpointData } from '../types';

// function to calulate query depth
const calculateQueryDepth = (selections: any): number => {
  let maxDepth: number = 0;
  for (const selection of selections) {
    if (selection.selectionSet) {
      const currentDepth: number = calculateQueryDepth(selection.selectionSet.selections);
      maxDepth = Math.max(maxDepth, currentDepth + 1);
    }
  }
  return maxDepth;
};

// function to find all object types
const extractObjectTypes = (query: DocumentNode): string[] => {
  const objectTypes: string[] = [];

  visit(query, {
    Field: {
      enter(node: FieldNode) {
        if (node.selectionSet) {
          const parentType: string = node.name.value;
          objectTypes.push(parentType);
        }
      },
    }
  });

  return objectTypes;
};

// default endpointData
const endpointData: EndpointData = {
  depth: 0,
  ip: '',
  url: '',
  timestamp: '',
  objectTypes: {},
  queryString: '',
  complexityScore: 0,
  blocked: false,
  complexityLimit: 0,
  email: '',
  password: '',
};

const expressEndpointMonitor = function (config: MonitorConfig) : (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    if (req.body.query) {
      const query: DocumentNode = parse(req.body.query);
      
      endpointData.ip = req.ip;
      if (endpointData.ip.includes('::ffff:')) {
        endpointData.ip = endpointData.ip.replace('::ffff:', '');
      }
      // when working with proxy servers or load balancers, the IP address may be forwarded
      // in a different request header such as X-Forwarded-For or X-Real-IP. In such cases,
      // you would need to check those headers to obtain the original client IP address.
      const host: string | undefined = req.get('host');
      const url: string = `${req.protocol}://${host}${req.originalUrl}`;
      endpointData.url = url;
      endpointData.complexityScore = res.locals.complexityScore;
      endpointData.timestamp = Date();
      endpointData.objectTypes = extractObjectTypes(query);
      endpointData.email = config.gliephqlUsername;
      endpointData.password = config.gleiphqlPassword;
      endpointData.depth = res.locals.depth
      if (query.loc) {
        endpointData.queryString = query.loc.source.body;
      }
      res.locals.gleiphqlData = endpointData;
    }
    next();
  }
}

const apolloEndpointMonitor = (config: MonitorConfig) => {
  return {
    async requestDidStart(requestContext: any) {
      return {
        async willSendResponse(requestContext: any) {
          if (requestContext.operationName !== 'IntrospectionQuery') {
            const query: DocumentNode = requestContext.document;

            endpointData.ip = requestContext.contextValue.clientIP;
            if (endpointData.ip.includes('::ffff:')) {
              endpointData.ip = endpointData.ip.replace('::ffff:', '');
            }
            if (requestContext.contextValue.blocked) endpointData.blocked = requestContext.contextValue.blocked;
            endpointData.complexityLimit = requestContext.contextValue.complexityLimit;
            endpointData.url = requestContext.request.http.headers.get('referer');
            endpointData.complexityScore = requestContext.contextValue.complexityScore;
            endpointData.depth = requestContext.contextValue.depth
            endpointData.timestamp = Date();
            endpointData.objectTypes = extractObjectTypes(query);
            endpointData.email = config.gliephqlUsername;
            endpointData.password = config.gleiphqlPassword;
            if (query.loc) {
              endpointData.queryString = query.loc.source.body;
            }
            try {
              await fetch('http://localhost:3000/api/data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(endpointData)
              });
            }
            catch (err: unknown) {
              console.log('Unable to save to database');
            }
          }
        }
      };
    }
  }
};

export  { expressEndpointMonitor, apolloEndpointMonitor };