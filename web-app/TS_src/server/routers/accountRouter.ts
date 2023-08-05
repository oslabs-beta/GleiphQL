import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
import passport from 'passport';
import sessionController from '../controllers/sessionController';

const accountRouter: Router = Router();

accountRouter.post('/login', passport.authenticate('local'), (req: Request, res: Response) : void => {
  res.status(200).send(req.user);
});

accountRouter.post('/register', userController.checkUserExists, userController.register, (req: Request, res: Response) : void => {
  res.status(200).json({
    userExists: res.locals.userExists,
    userCreated: res.locals.userCreated,
  });
})

accountRouter.post('/logout', sessionController.endSession, (req: Request, res: Response) : void => {
  res.status(200).send({
    signedIn: res.locals.signedIn
  })
});


accountRouter.delete('/deleteUser', userController.deleteUser, (req: Request, res: Response) => {
  res.status(200).send(res.locals.delete);
})


export default accountRouter;