import { Request, Response, NextFunction } from 'express';
import { parse, visit, FieldNode, ObjectTypeDefinitionNode, Kind, DocumentNode } from 'graphql';
import fetch from 'node-fetch';

const endpointMonitor = function (config: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.query) {
      const query = parse(req.body.query);
      const endpointData = {
        depth: 0,
        ip: '',
        url: '',
        timestamp: '',
        objectTypes: {},
        queryString: '',
        complexityScore: '',
        email: '',
        password: '',
      }
      const calculateQueryDepth = (selections: any): number => {
        let maxDepth = 0;
        for (const selection of selections) {
          if (selection.selectionSet) {
            const currentDepth = calculateQueryDepth(selection.selectionSet.selections);
            maxDepth = Math.max(maxDepth, currentDepth + 1);
          }
        }
        return maxDepth;
      };
      const extractObjectTypes = (query: DocumentNode): string[] => {
        const objectTypes: string[] = [];
      
        visit(query, {
          Field: {
            enter(node: FieldNode) {
              if (node.selectionSet) {
                const parentType = node.name.value;
                objectTypes.push(parentType);
              }
            },
          }
        });
      
        return objectTypes;
      }; 
      
      if (query.definitions.length > 0 && query.definitions[0].kind === Kind.OPERATION_DEFINITION) {
        const operation = query.definitions[0];
        
        // Ensure the operation has a selectionSet
        if (operation.selectionSet) {
          const depth = calculateQueryDepth(query.definitions[0].selectionSet.selections);
          endpointData.depth = depth
        }
      }
      endpointData.ip = req.ip
      if (endpointData.ip.includes('::ffff:')) {
        endpointData.ip = endpointData.ip.replace('::ffff:', '');
      }
      // when working with proxy servers or load balancers, the IP address may be forwarded 
      // in a different request header such as X-Forwarded-For or X-Real-IP. In such cases, 
      // you would need to check those headers to obtain the original client IP address.
      const host = req.get('host');
      const url = `${req.protocol}://${host}${req.originalUrl}`;
      endpointData.url = url
      endpointData.complexityScore = res.locals.complexityScore
      endpointData.timestamp = Date()
      endpointData.objectTypes = extractObjectTypes(query)
      endpointData.email = config.gliephqlUsername
      endpointData.password = config.gleiphPassword
      if (query.loc) {
        endpointData.queryString = query.loc.source.body
      }
      console.log('Monitor data: ', endpointData);
      try {
        const response = await fetch('http://localhost:3000/api/data', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          }, 
          body: JSON.stringify(endpointData)
        });
        const data = await response.json();
      }
      catch {
        console.log("Unable to save to database")
      }
  
      if(res.locals.complexityScore >= res.locals.complexityLimit) {
        console.log(`Complexity score of ${res.locals.complexityScore} exceeded ${res.locals.complexityLimit}`);
        return next(Error);
      }
    }
    next()
  }
}

export default endpointMonitor