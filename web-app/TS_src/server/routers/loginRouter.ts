import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
const loginRouter: Router = Router();

loginRouter.post('/', userController.checkUserExists, userController.login, (req: Request, res: Response) => {
  const response = {
    userExists: res.locals.userExists,
    signedIn: res.locals.signIn
  };
  if(res.locals.signIn) res.status(200).json({
    ...response,
    userId: res.locals.userId,
    userEmail: req.body.email   
  });
  else res.status(200).json(response);
});

export default loginRouter;

