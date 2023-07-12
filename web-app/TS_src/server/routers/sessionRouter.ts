import { Router, Request, Response } from 'express';
import sessionController from '../controllers/sessionController';

const sessionRouter: Router = Router();

sessionRouter.get('/', sessionController.authenticated, (req: Request, res: Response) => {
  //@ts-ignore
  res.status(200).send(req.session.passport.user);
})

export default sessionRouter;