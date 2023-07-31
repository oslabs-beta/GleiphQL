import { Router, Request, Response } from 'express';
import dataController from '../controllers/dataController';
import sessionController from '../controllers/sessionController';

const dataRouter: Router = Router();

// adding new row of query data for a given endpoint
dataRouter.post('/', dataController.addData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.addedRequest);
});

// getting all query data for a given endpoint
dataRouter.get('/:endpointId', sessionController.authenticated, dataController.receiveData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.requests);
});

export default dataRouter;