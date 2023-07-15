import { Router, Request, Response } from 'express';
import endpointController from '../controllers/endpointController';
import dataController from '../controllers/dataController';
import sessionController from '../controllers/sessionController';

const endpointRouter: Router = Router();

endpointRouter.post('/:userId', sessionController.authenticated, endpointController.addEndpoint, (req: Request, res: Response) => {
  res.status(200).json(res.locals.addedEndpoint);
});

endpointRouter.get('/:userId', sessionController.authenticated, endpointController.retrieveEndpoints, (req: Request, res: Response) => {
  res.status(200).json(res.locals.endpoints);
});

endpointRouter.delete('/:endpointId', sessionController.authenticated, endpointController.deleteEndpoint, dataController.deleteData, (req: Request, res: Response) => {
  res.status(200).json();
})

export default endpointRouter;