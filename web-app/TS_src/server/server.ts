import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import configurePassport from './passport';
import cookieParser from 'cookie-parser';
import db, { pool } from './models/dbModel';
import { ErrorObject, EndpointRequest } from '../types';
import { WebSocket, WebSocketServer } from 'ws';


import express, {
  Express,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from 'express';

// routers
import accountRouter from  './routers/accountRouter';
import dataRouter from './routers/dataRouter';
import endpointRouter from './routers/endpointRouter';
import sessionRouter from './routers/sessionRouter';


const PORT = 3500;

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: pool,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false ,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

app.use(cookieParser(process.env.SESSION_SECRET));

configurePassport(passport);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((userObj, done) => {
  done(null, userObj);
});
passport.deserializeUser((userObj, done) => {
  //@ts-ignore
  done(null, userObj);
})

app.use('/api/account', accountRouter);
app.use('/api/data', dataRouter);
app.use('/api/endpoint', endpointRouter);
app.use('/api/session', sessionRouter);


app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) : void  => {
  const defaultErr: ErrorObject = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred.' },
  };
  const errorObj: ErrorObject = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
});

app.use((req: Request, res: Response) : void => {
  res.status(404).send('This is not the page you\'re looking for...')
});

app.listen(PORT, () : void =>
  console.log(`Currently listening on port: ${PORT}`)
);

// websocket server
const wssDataController : WebSocketServer = new WebSocketServer({port: 8080});

console.log(`in wssData controller, should be listening on 8080, ${wssDataController}`);

wssDataController.on('connection', async function connection(ws: WebSocket, req: Request) {
  console.log('A websocket connection established on port 8080');
  const endpointId: number = Number(req.url?.substring(1));

  // query to the database for graphql query data on the endpoint that established connection with ws server
  const query = async () : Promise<void> => {
    console.log('connection id:', endpointId);
    const sqlCommand: string = `
      SELECT * FROM requests WHERE endpoint_id = $1 ORDER BY to_timestamp(timestamp, 'Dy Mon DD YYYY HH24:MI:SS') DESC;
    `;
    const values: number[] = [ endpointId ];
    try {
      const result: EndpointRequest[] = (await db.query(sqlCommand, values)).rows;
      ws.send(JSON.stringify(result));
    } catch (err: unknown) {
      console.log('The database call within the websocket function has borked itself somehow')
    }
  }

  query(); // initial query upon establishing connection 
  const interval = setInterval(query, 3000); // for continous update from database

  ws.on('close', () : void => {
    console.log('clearing current interval:', interval)
    clearInterval(interval);
  })

  ws.on('error', (err: unknown) : void => {
    if(err instanceof Error) console.log('Websocket error in dataController:', err.message);
  })
})