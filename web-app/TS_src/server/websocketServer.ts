import db from './models/dbModel';
import { WebSocket, WebSocketServer } from 'ws';
import { Request } from 'express';
import { EndpointRequest } from '../types';

const wssDataController : WebSocketServer = new WebSocketServer({port: 8080});

console.log(`in wssData controller, should be listening on 8080, ${wssDataController}`);

wssDataController.on('connection', async function connection(ws, req) {
  console.log('a websocket connection established on port 8080');
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
      console.log('the database call within the websocket function has borked itself somehow')
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