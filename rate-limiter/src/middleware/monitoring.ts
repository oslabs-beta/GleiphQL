import { Request, Response, NextFunction } from 'express';
import { parse, visit, FieldNode, ObjectTypeDefinitionNode, Kind, DocumentNode } from 'graphql';

const endpointMonitor = function (req: Request, res: Response, next: NextFunction) {
  if (req.body.query) {
    const query = parse(req.body.query);
    const endpointData = {
      depth: 0,
      ip: '',
      url: '',
      timestamp: '',
      objectTypes: {},
      queryString: '',
      complexityScore: ''
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
        console.log('Query Depth: ', depth)
        endpointData.depth = depth
      }
    }
    console.log('IP Address: ', req.ip)
    endpointData.ip = req.ip
    // when working with proxy servers or load balancers, the IP address may be forwarded
    // in a different request header such as X-Forwarded-For or X-Real-IP. In such cases,
    // you would need to check those headers to obtain the original client IP address.
    const host = req.get('host');
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    console.log('Endpoint URL: ', url)
    endpointData.url = url
    console.log(`Query Complexity: ${res.locals.complexityScore}`)
    console.log('Requested Timestamp: ', Date())
    endpointData.timestamp = Date()
    console.log('Object Types: ', extractObjectTypes(query))
    endpointData.objectTypes = extractObjectTypes(query)
    if (query.loc) {
      console.log('Query String', query.loc.source.body)
      endpointData.queryString = query.loc.source.body
    }
    // const response = await fetch('https://httpbin.org/post', {method: 'POST', body: 'a=1'});
    // const data = await response.json();
    if(res.locals.complexityScore >= res.locals.complexityLimit) {
      console.log(`Complexity score of ${res.locals.complexityScore} exceeded ${res.locals.complexityLimit}`);
      return next(Error);
    }
  }
  next()
}

export default endpointMonitor