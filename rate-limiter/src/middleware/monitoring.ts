import { Request, Response, NextFunction } from 'express';
import { parse, visit, FieldNode, ObjectTypeDefinitionNode, Kind, DocumentNode } from 'graphql';


const endpointMonitor = function (req: Request, res: Response, next: NextFunction) {
  if (req.body.query) {
    const query = parse(req.body.query);

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
        const selections = operation.selectionSet.selections;
        const depth = calculateQueryDepth(query.definitions[0].selectionSet.selections);
        const breadth = selections.length;
        console.log('Query depth: ', depth);
        console.log('Query breadth: ', breadth);
      }
    }
    console.log('IP Address: ', req.ip)
    const host = req.get('host');
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    console.log('Endpoint URL: ', url)
    // when working with proxy servers or load balancers, the IP address may be forwarded 
    // in a different request header such as X-Forwarded-For or X-Real-IP. In such cases, 
    // you would need to check those headers to obtain the original client IP address.
    console.log('Query Complexity: TBD')
    console.log('Requested Timestamp: ', Date())
    console.log('Object Types: ', extractObjectTypes(query))
    if (query.loc) {
      console.log('Query String', query.loc.source.body)
    }
  }
  next()
}

export default endpointMonitor