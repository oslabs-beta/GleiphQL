import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import configurePassport from './passport';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import db from './models/dbModel';

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
import sessionRouter from './routers/sessionRouter';

const wssDataController = new WebSocketServer({port: 8080});

console.log(`in wssData controller, should be listening on 8080, ${wssDataController}`)

wssDataController.on('connection', function connection(ws, req) {
  console.log('websocket connection established on port 8080');
  const endpointId: number = Number(req.url?.substring(1));
  const sqlCommand: string = `
  SELECT TOP 30 * FROM requests WHERE endpoint_id = $1 ORDER BY to_timestamp(timestamp, 'Dy Mon DD YYYY HH24:MI:SS') DESC;
  `;
  const values: number[] = [ endpointId ];

  const interval = setInterval(async () => {
    console.log('interval called within websocket')
    console.log('websocket interval id:', endpointId)
    try {
      const result: any = await db.query(sqlCommand, values);
      ws.send(JSON.stringify(result.rows));
    } catch (err: any) {
      console.log('the database call within the websocket function has borked itself somehow')
    }
  }, 3000)

  ws.on('close', () => {
    console.log('clearing current interval:', interval)
    clearInterval(interval);
  })

  ws.on('error', (err: any) => {
    console.error('Websocket error in dataController:', err);
  })
})

const PORT = 3500;

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false ,
  saveUninitialized: true ,
  cookie: { maxAge: 60 * 60 * 1000 }
}))

app.use(cookieParser(process.env.SESSION_SECRET));

configurePassport(passport);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((userObj: any, done: any) => {
  done(null, userObj)
});
passport.deserializeUser((userObj: any, done: any) => {
  //@ts-ignore
  done (null, userObj)
})

app.use('/api/account', accountRouter);
app.use('/api/data', dataRouter);
app.use('/api/endpoint', endpointRouter);
app.use('/api/session', sessionRouter);


app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred.' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.use((req: Request, res: Response) =>
  res.status(404).send('This is not the page you\'re looking for...')
);

app.listen(PORT, () =>
  console.log(`Currently listening on port: ${PORT}`)
);