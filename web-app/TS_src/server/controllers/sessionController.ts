import { Request, Response, NextFunction } from 'express';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

interface SessionController {
  authenticated: Middleware;
  endSession: Middleware;
}

const sessionController : SessionController = {
  // check for active session
  authenticated: (req: Request, res: Response, next: NextFunction) : void => {
    if(req.isAuthenticated()) return next();
    else res.status(440).send({
      expired: true     
    })
  },
  // end session
  endSession: (req: Request, res: Response, next: NextFunction) : void => {
    req.logOut(err => {
      if (err) return next({
        log: 'Error in sessionController.endSession: ' + err,
        status: 400,
        message: { error: 'Could not properly log out' }
      });
      res.locals.signedIn = false;
    });
    return next();
  }
};

export default sessionController;