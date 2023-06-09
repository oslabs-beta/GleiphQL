import * as dotenv from "dotenv";
dotenv.config({ path: '../../.env' });
import cors from 'cors';
import db from './models/dbModel';

import express, {
  Express,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import { createServer } from 'http';
import { SSEEvent } from "./sseInterfaces";

// import cookieParser from 'cookie-parser';
// import ExpressSession from 'express-session';

import accountRouter from  './routers/accountRouter';
import dataRouter from './routers/dataRouter';
import endpointRouter from './routers/endpointRouter';

const PORT = 3500;

const app: Express = express();
const server = createServer(app);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// declare module "express-session" {
//   interface Session {
//     isAuth: boolean,
//     userId: number,
//     userEmail: string
//   }
// }

// const oneDay: number = 1000 * 60 * 60 * 24;
// app.use(ExpressSession({
//   secret: process.env.SESSION_SECRET || '',
//   saveUninitialized: false,
//   cookie: { maxAge: oneDay },
//   resave: false
// }));

// app.use(cookieParser());

app.use('/api/account', accountRouter);
app.use('/api/data', dataRouter);
app.use('/api/endpoint', endpointRouter);

// Start of Server sent events logic
// app.get('/api/sse', (req: Request, res: Response) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  
//   res.flushHeaders();

//   setInterval(() => {
//     const eventData = { message: 'This is a server-sent event! Testing...'};
//     const formattedData = `data: ${JSON.stringify(eventData)}\n\n`;
//     res.write(formattedData);
//   }, 1000)
// })

app.get('/api/sse/:endpointId', (req, res) => {
  console.log('accept/content type is event-stream');
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // 'Access-Control-Allow-Origin': '*',
  });
  setInterval(async () => {
    try {
      const endpointId: number = Number(req.params.endpointId);
      console.log('req.params.endpointId:', req.params.endpointId)
      const sqlCommand: string = `
      SELECT * FROM requests WHERE endpoint_id = $1 ORDER BY to_timestamp(timestamp, 'Dy Mon DD YYYY HH24:MI:SS') DESC;
      `;
      const values: number[] = [ endpointId ];
      const result: any = await db.query(sqlCommand, values);
      res.write(`data: ${JSON.stringify(result.rows)}\n\n`);
    } catch(error) {
      console.error(error);
      throw new Error(`Error in SSE get request in server.ts: `);
    }
    
  }, 1500);
});

// Error page
app.use((req: Request, res: Response) =>
  res.status(404).send("This is not the page you're looking for...")
);


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

app.listen(PORT, () =>
  console.log(`Currently listening on port: ${PORT}`)
);
