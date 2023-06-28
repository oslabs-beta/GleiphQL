import { Router, Request, Response } from 'express';
import dataController from '../controllers/dataController';
import userController from '../controllers/userController';

const dataRouter: Router = Router();

dataRouter.post('/', userController.checkUserExists, userController.login, dataController.addData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.addedRequest);
});

dataRouter.get('/:endpointId', dataController.receiveData, (req: Request, res: Response) => {
  res.status(200).json(res.locals.requests);
});

export default dataRouter;