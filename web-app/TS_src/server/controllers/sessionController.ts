import { Request, Response, NextFunction } from 'express';


const sessionController = {
  authenticated: (req: Request, res: Response, next: NextFunction) => {
    if(req.isAuthenticated()) return next();
    else res.status(440).send({
      expired: true     
    })
  },
  endSession: (req: Request, res: Response, next: NextFunction) => {
    req.logOut(err => {
      if (err) { return next(err); }
      res.locals.signedIn = false;
    });
    return next();
  }
};

export default sessionController;