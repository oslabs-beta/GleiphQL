import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import { Endpoint, AsyncMiddleWare } from '../../types';

interface EndpointController {
  addEndpoint: AsyncMiddleWare;
  retrieveEndpoints: AsyncMiddleWare;
  deleteEndpoint: AsyncMiddleWare;
}

const endpointController : EndpointController = {
  // add a new endpoint
  addEndpoint: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const userId: number = Number(req.params.userId);
    const { url, description } = req.body;
    if(url === undefined || description === undefined) return next({
      log: 'Error in endpointController.addEndpoint: not given all necessary inputs',
      status: 400,
      message: { error: 'Did not receive necessary inputs to add endpoint for the user' }
    });
    const sqlCommand: string = `
      INSERT INTO endpoints (owner_id, url, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values: Array<string|number> = [ userId, url, description ];
    try {
      const result: Endpoint[] = (await db.query(sqlCommand, values)).rows;
      res.locals.addedEndpoint = result[0];
    } catch(err: unknown) {
      return next({
        log: 'Error in endpointController.addEndpoint: ' + err,
        status: 400,
        message: { error: 'Could not add endpoint for the user in the Endpoint table' }
      });
    }
    return next();
  },
  // getting all endpoints for a given user
  retrieveEndpoints: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    let userId: number = Number(req.params.userId);
    if(!userId) {
      userId = req.body.userId;
    }
    const sqlCommand: string = `
      SELECT * FROM endpoints WHERE owner_id = $1;
    `;
    const values: number[] = [ userId ];
    try {
      const result: Endpoint[] = (await db.query(sqlCommand, values)).rows;
      res.locals.endpoints = result;
    } catch(err: unknown) {
      return next({
        log: 'Error in endpointController.retrieveEndpoints: ' + err,
        status: 400,
        message: { error: 'Could not retrieve endpoints for the user' }
      });
    }
    return next();
  },
  // delete endpoint for a given endpoint id
  deleteEndpoint: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
      DELETE FROM endpoints WHERE endpoint_id = $1;
    `;
    const values: number[] = [ endpointId ];
    try {
      await db.query(sqlCommand, values);
    } catch (err: any) {
      return next({
        log: 'Error in endpointController.deleteEndpoint: ' + err,
        status: 400,
        message: { error: 'Could not delete endpoint from the Endpoint table for the given endpoint id' }
      });
    }
    return next();
  }
};

export default endpointController;