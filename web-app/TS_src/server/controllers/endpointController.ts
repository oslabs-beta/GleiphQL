import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';

const endpointController = {
  addEndpoint: async (req: Request, res: Response, next: NextFunction) => {
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
      const result = await db.query(sqlCommand, values);
      res.locals.addedEndpoint = result.rows[0];
    } catch(err: any) {
      return next({
        log: 'Error in endpointController.addEndpoint: could not add endpoint for the user in database',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  },
  retrieveEndpoints: async (req: Request, res: Response, next: NextFunction) => {
    console.log('In retrieve endpoints');
    const userId: number = Number(req.params.userId);
    const sqlCommand: string = `
    SELECT * FROM endpoints WHERE owner_id = $1;
    `;
    const values: number[] = [ userId ];
    try {
      const result = await db.query(sqlCommand, values);
      res.locals.endpoints = result.rows;
    } catch(err: any) {
      return next({
        log: 'Error in endpointController.retrieveEndpoints: could not retrieve endpoints for the user from the database',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  },
  deleteEndpoint: async (req: Request, res: Response, next: NextFunction) => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
    DELETE FROM endpoints WHERE endpoint_id = $1`;
    const values: number[] = [ endpointId ];
    try {
      await db.query(sqlCommand, values);
    } catch (err: any) {
      return next({
        log: 'Error in endpointController.deleteEndpoint: could not delete endpoints from the database',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  }
};

export default endpointController;