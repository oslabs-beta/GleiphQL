import { Router, Request, Response } from 'express';
import endpointController from '../controllers/endpointController';
import dataController from '../controllers/dataController';

const endpointRouter: Router = Router();

endpointRouter.post('/:userId', endpointController.addEndpoint, (req: Request, res: Response) => {
  res.status(200).json(res.locals.addedEndpoint);
});

endpointRouter.get('/:userId', endpointController.retrieveEndpoints, (req: Request, res: Response) => {
  res.status(200).json(res.locals.endpoints);
});

endpointRouter.delete('/:endpointId', endpointController.deleteEndpoint, dataController.deleteData, (req: Request, res: Response) => {
  res.status(200).json();
})

export default endpointRouter;