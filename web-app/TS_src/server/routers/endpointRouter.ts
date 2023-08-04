import { Router, Request, Response } from 'express';
import endpointController from '../controllers/endpointController';
import dataController from '../controllers/dataController';
import sessionController from '../controllers/sessionController';

const endpointRouter: Router = Router();

// adding a new endpoint for a given user
endpointRouter.post('/:userId', sessionController.authenticated, endpointController.addEndpoint, endpointController.retrieveEndpoints, (req: Request, res: Response) => {
  res.status(200).json(res.locals.endpoints);
});

// getting all endpoints for a given user
endpointRouter.get('/:userId', sessionController.authenticated, endpointController.retrieveEndpoints, (req: Request, res: Response) => {
  res.status(200).json(res.locals.endpoints);
});

// deletint an endpoint specified by id and returning the remaining endpoints
endpointRouter.delete('/:endpointId', sessionController.authenticated, dataController.deleteData, endpointController.deleteEndpoint, endpointController.retrieveEndpoints, (req: Request, res: Response) => {
  res.status(200).json(res.locals.endpoints);
})

export default endpointRouter;