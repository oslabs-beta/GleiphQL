// import { Request, Response, NextFunction } from 'express';

// const sessionController = {
//   authenticateeSession: (req: Request, res: Response, next: NextFunction) => {
//     req.session.isAuth = res.locals.signIn;
//     return next();
//   },
//   checkSession: (req: Request, res: Response, next: NextFunction) => {
//     res.locals.auth = req.session.isAuth;
//     return next();
//   },
// };

// export default sessionController;