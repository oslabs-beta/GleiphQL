import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import { verifyUser } from './userController';

import { Endpoint, EndpointRequest, verifiedUserObj, AsyncMiddleWare } from '../../types';

interface DataController {
  addData: AsyncMiddleWare;
  receiveData: AsyncMiddleWare;
  deleteData: AsyncMiddleWare;
}

// finding endpoint id given the url and user id
const findEndpointId = async (url: string, userID: number) : Promise<number | null> => {
  const sqlCommand: string = `
    SELECT *
    FROM endpoints
    JOIN users ON endpoints.owner_id = users.user_id
    WHERE endpoints.url = $1
    AND users.user_id = $2;
  `;
  const values: Array<string|number> = [ url, userID ];
  try {
    const result: Endpoint[] = (await db.query(sqlCommand, values)).rows;
    return result[0].endpoint_id;
  } catch (err: unknown) {
    if(err instanceof Error) console.log(err.message);
    return null;
  }
}

const dataController : DataController = {
  // add a new row to the Requests table for an endpoint
  addData: async (req: Request, res: Response, next: NextFunction) : Promise<void> =>  {
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
      message: { error: 'Did not receive all the necessary inputs to add data for the endpoint' }
    });

    // checking if user credentials are valid
    const userInfo: verifiedUserObj = await verifyUser(email, password);
    if (!userInfo.signedIn) {
      return next({
        log: 'Error in dataController.addData: Could not validate user credentials',
        status: 400,
        message: { error: 'Could not validate user credentials' }
      });
    }

    // finding the endpoint id 
    let endpointId;
    if(userInfo.userId) endpointId = await findEndpointId(url, userInfo.userId);
    if(!endpointId) return next({
      log: 'Error in dataController.addData: could not find the endpoint in the database',
      status: 400,
      message: { error: 'Unable to find the provided endpoint in the database' }
    });

    // adding graphql query data as new row to Requests table
    const sqlCommand: string = `
      INSERT INTO requests
      (endpoint_id, ip_address, timestamp, object_types, query_string, complexity_score, query_depth)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values: Array<any> = [ endpointId, ip, timestamp, {objectTypes: objectTypes}, queryString, complexityScore.complexityScore, depth ];
    try {
      const result: EndpointRequest[] = (await db.query(sqlCommand, values)).rows;
      res.locals.addedRequest = result[0];
    } catch (err: unknown) {
      return next({
        log: 'Error in dataController.addData: ' + err,
        status: 400,
        message: { error: 'Could not add data for the endpoint to the database'}
      });
    }
    return next();
  },

  // getting graphql query data for an endpoint
  receiveData: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
      SELECT * FROM requests WHERE endpoint_id = $1 ORDER BY to_timestamp(timestamp, 'Dy Mon DD YYYY HH24:MI:SS') DESC;
    `;
    const values: number[] = [ endpointId ];
    try {
      const result: EndpointRequest[] = (await db.query(sqlCommand, values)).rows;
      res.locals.requests = result;
    } catch (err: unknown) {
      return next({
        log: 'Error in dataController.receiveData: ' + err,
        status: 400,
        message: { error: 'Could not retrieve data for the endpoint from the database' }
      });
    }
    return next();
  },

  // deleting all graphql query data for a given endpoint from Request table
  deleteData: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const endpointId: number = Number(req.params.endpointId);
    const sqlCommand: string = `
      DELETE FROM requests WHERE endpoint_id = $1;
    `;
    const values: number[] = [ endpointId ];
    try {
      await db.query(sqlCommand, values);
    } catch (err: unknown) {
      return next({
        log: 'Error in dataController.deleteData: ' + err,
        status: 400,
        message: { error: 'Could not delete the data for given endpoint from the database' }
      });
    }
    return next();
  }
};

export default dataController;