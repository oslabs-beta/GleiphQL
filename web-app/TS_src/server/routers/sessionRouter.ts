import { Router, Request, Response } from 'express';
import sessionController from '../controllers/sessionController';

const sessionRouter: Router = Router();

// checking if active session exists
sessionRouter.get('/', sessionController.authenticated, (req: Request, res: Response) => {
  //@ts-ignore
  res.status(200).send(req.session.passport.user);
})

export default sessionRouter;