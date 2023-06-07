import * as dotenv from "dotenv";
dotenv.config({ path: '../../.env' });

import express, {
  Express,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";

import cookieParser from 'cookie-parser';
import ExpressSession from 'express-session';

import loginRouter from './routers/loginRouter';
import registerRouter from './routers/registerRouter';


const PORT = 3500;

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const oneDay: number = 1000 * 60 * 60 * 24;
app.use(ExpressSession({
  secret: process.env.SESSION_SECRET || '',
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

app.use(cookieParser());

app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);


app.use((req: Request, res: Response) =>
  res.status(404).send("This is not the page you're looking for...")
);

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => 
  console.log(`Currently listening on port: ${PORT}`)
);

module.exports = app;