import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import { verifyUser } from './userController';

const findEndpointId = async (url: string, userID: string) => {
  const sqlCommand: string = `
  SELECT *
  FROM endpoints
  JOIN users ON endpoints.owner_id = users.user_id
  WHERE endpoints.url = $1
    AND users.user_id = $2
  `;
  const values: string[] = [ url, userID ];
  try {
    const result = await db.query(sqlCommand, values);
    return result.rows[0].endpoint_id;
  } catch (err: any) {
    return null;
  }
}

const dataController = {
  addData: async (req: Request, res: Response, next: NextFunction) => {
    const { depth, ip, url, timestamp, objectTypes, queryString, complexityScore, email, password } = req.body;
    if(depth === undefined || 
      ip === '' || 
      url === '' || 
      timestamp === '' || 
      objectTypes === undefined || 
      queryString === undefined || 
      complexityScore === undefined ||
      email === undefined ||
      password === undefined
    ) return next({
      log: 'Error in dataController.addData: not given all necessary inputs',
      status: 400,
      message: { error: 'Did not receive necessary inputs to add data for the endpoint' }
    });
    const userInfo = await verifyUser(email, password);
    if (!userInfo.signedIn) {
      return next({
        log: 'Error in dataController.addData: Could not validate user credentials',
        status: 400,
        message: { error: 'Could not validate user credentials' }
      });
    }
    const endpointId: string = await findEndpointId(url, userInfo.userId);
    if(!endpointId) return next({
      log: 'Error in dataController.addData: could not find the endpoint in the database',
      status: 400,
      message: { error: 'Unable to find the provided endpoint in the database' }
    });
    const sqlCommand: string = `
    INSERT INTO requests
    (endpoint_id, ip_address, timestamp, object_types, query_string, complexity_score, query_depth)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `;
    const values = [ endpointId, ip, timestamp, {objectTypes: objectTypes}, queryString, complexityScore.complexityScore, depth ];
    try {
      const result = await db.query(sqlCommand, values);
      res.locals.addedRequest = result.rows[0];
    } catch (err: any) {
      return next({
        log: 'Error in dataController.addData: could not add data for the endpoint to the database',
        status: 400,
        message: { error: err.message}
      });
    }
    return next();
  },
  receiveData: async (req: Request, res: Response, next: NextFunction) => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
    SELECT * FROM requests WHERE endpoint_id = $1 ORDER BY to_timestamp(timestamp, 'Dy Mon DD YYYY HH24:MI:SS') DESC;
    `;
    const values: number[] = [ endpointId ];
    try {
      const result = await db.query(sqlCommand, values);
      res.locals.requests = result.rows;
    } catch (err: any) {
      return next({
        log: 'Error in dataController.receiveData: could not retrieve data for the endpoint from the database',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  },
  deleteData: async (req: Request, res: Response, next: NextFunction) => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
    DELETE FROM requests WHERE endpoint_id = $1;
    `;
    const values: number[] = [ endpointId ];
    try {
      await db.query(sqlCommand, values);
    } catch (err: any) {
      return next({
        log: 'Error in dataController.deleteData: could not delete the data for given endpoint from the database',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  }
};

export default dataController;