import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import cors from 'cors';
import session from 'cookie-session';
import helmet from 'helmet';
import hpp from 'hpp';
import csurf from 'csurf';
import limiter from 'express-rate-limit';
import passport from './passport';

import express, {
  Express,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";

import accountRouter from  './routers/accountRouter';
import dataRouter from './routers/dataRouter';
import endpointRouter from './routers/endpointRouter';

const PORT = 3500;

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(hpp());

app.use(
  session({
    name: 'session',
    secret: process.env.SESSION_SECRET,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
);

app.use(passport.initialize());

app.use('/api/account', accountRouter);
app.use('/api/data', dataRouter);
app.use('/api/endpoint', endpointRouter);

app.use(csurf());
app.use(limiter);

app.use((req: Request, res: Response) =>
  res.status(404).send("This is not the page you're looking for...")
);

// app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
//   const defaultErr = {
//     log: 'Express error handler caught unknown middleware error',
//     status: 500,
//     message: { err: 'An error occurred.' },
//   };
//   const errorObj = Object.assign({}, defaultErr, err);
//   console.log(errorObj.log);
//   return res.status(errorObj.status).json(errorObj.message);
// });

app.listen(PORT, () =>
  console.log(`Currently listening on port: ${PORT}`)
);