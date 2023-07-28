import { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../store';
import streamWS from '../helper-functions/websocket';


interface Data {
  request_id: number;
  endpoint_id: number;
  ip_address: string;
  object_types: any;
  query_string: string;
  complexity_score: number;
  timestamp: string;
  query_depth: number;
}

function RequestTable () {
  const { endpointRequests, currEndPoint, setEndpointRequests } = useStore();

  useEffect(() => {
    streamWS(currEndPoint, setEndpointRequests);
  }, [currEndPoint]);

  return (
    <section className='my-12 rounded-lg border border-slate-100 border-1 overflow-hidden w-3/4 m-2'>
      <table className='m-0 table-auto'>
        <thead>
          <tr className='h-12'>
            <th className='w-1/5'>IP Address</th>
            <th className='w-1/5'>Complexity Score</th>
            <th className='hidden sm:table-cell'>Number of Object Types</th>
            <th className='hidden sm:table-cell'>Query Depth</th>
            <th className='w-1/5'>Time Stamp</th>
          </tr>
        </thead>
        <tbody>
          {endpointRequests && endpointRequests.map((row: Data, index: number) => {
            const color = index % 2 > 0? 'bg-white' : 'bg-slate-50';
            return (
              <tr key={uuidv4()} className={`h-24 ${color}`}>
                <th>{row.ip_address}</th>
                <th>{row.complexity_score}</th>
                <th className='hidden sm:table-cell'>{row.object_types.objectTypes.length}</th>
                <th className='hidden sm:table-cell'>{row.query_depth}</th>
                <th>{row.timestamp}</th>
              </tr>
            );
          })}
        </tbody>
    </table>

  </section>
  );
};

export default RequestTable;