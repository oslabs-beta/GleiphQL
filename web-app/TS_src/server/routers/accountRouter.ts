import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const jwtRequired = passport.authenticate('jwt', { session: false });

const accountRouter: Router = Router();

accountRouter.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile',
}), (req, res) => {
  res.redirect('/');
}
)

// accountRouter.post('/login', userController.checkUserExists, userController.login, (req: Request, res: Response) => {
//   const response = {
//     userExists: res.locals.userExists,
//     signedIn: res.locals.signIn
//   };
//   if(res.locals.signIn) res.status(200).json({
//     ...response,
//     userId: res.locals.userId,
//     userEmail: req.body.email   
//   });
//   else res.status(200).json(response);
// });

// accountRouter.post('/register', userController.checkUserExists, userController.register, (req: Request, res: Response) => {
//   const response = {
//     userExists: res.locals.userExists,
//     userCreated: res.locals.userCreated,
//   }
//   if(res.locals.userCreated) res.status(200).json({
//     ...response,
//     userId: res.locals.userId,
//     userEmail: req.body.email
//   });
//   else res.status(200).json(response);
// });

export default accountRouter;