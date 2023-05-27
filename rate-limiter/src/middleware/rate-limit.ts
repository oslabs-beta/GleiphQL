import { Request, Response, NextFunction } from 'express';
import { parse, visit, FieldNode, ObjectTypeDefinitionNode, Kind, DocumentNode, GraphQLSchema } from 'graphql';

const rateLimiter = function (schema: GraphQLSchema, config: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.query) {
      const ast = parse(req.body.query);
      let complexity = 0;
      let multiplier = 1;

      visit(ast, {
        Field: {
          enter(node: any) {
            if (node.selectionSet) {
              if (node.arguments !== undefined && node.arguments.length) {
                for (let i = 0; i < node.arguments.length; i++) {
                  if (
                    node.arguments[i].name.value === 'limit' || 
                    node.arguments[i].name.value === 'first' || 
                    node.arguments[i].name.value === 'last'
                    ) {
                    multiplier = multiplier * node.arguments[i].value.value
                  }
                }
              }
              complexity = complexity + 1 * multiplier;
            }
          }
        }     
      });

      console.log('COMPLEXITY SCORE: ', complexity);
    }
    return next()
  }
}

export default rateLimiter