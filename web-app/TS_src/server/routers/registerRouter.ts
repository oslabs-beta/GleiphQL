import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
const registerRouter: Router = Router();

registerRouter.post('/', userController.checkUserExists, userController.register, (req: Request, res: Response) => {
  const response = {
    userExists: res.locals.userExists,
    userCreated: res.locals.userCreated,
  }
  if(res.locals.userCreated) res.status(200).json({
    ...response,
    userId: res.locals.userId,
    userEmail: req.body.email
  });
  else res.status(200).json(response);
});

export default registerRouter;

