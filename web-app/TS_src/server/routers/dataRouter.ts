import { Router, Request, Response } from 'express';
import dataController from '../controllers/dataController';
const dataRouter: Router = Router();

dataRouter.post('/', dataController.addData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.addedRequest);
});

dataRouter.get('/:endpointId', dataController.receiveData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.requests);
});


export default dataRouter;