import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
// import sessionController from '../controllers/sessionController';
const accountRouter: Router = Router();

accountRouter.post('/login', userController.checkUserExists, userController.login, (req: Request, res: Response) => {
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

accountRouter.post('/register', userController.checkUserExists, userController.register, (req: Request, res: Response) => {
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

// accountRouter.get('/session', sessionController.checkSession, (req: Request, res: Response) => {
//   const response = {
//     sessionAuth: res.locals.auth
//   };
//   if(res.locals.auth) res.status(200).json({
//     ...response,
//     userId: req.session.userId,
//     userEmail: req.session.userEmail
//   });
//   else res.status(200).json(response);
// });

export default accountRouter;