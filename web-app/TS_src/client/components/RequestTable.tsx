import { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../store';


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
  const [ tableData, setTableData ] = useState<Array<Data>>([]);
  const { currEndPoint } = useStore();
  
  useEffect(() => {
    axios.get(`/api/data/${currEndPoint.id}`)
    .then(response => {
      setTableData(response.data);
    })
    .catch((err: any) => console.log(err.message));   
  }, [currEndPoint]);

  return (
    <div className='my-12 rounded-lg border border-slate-100 border-1 overflow-hidden w-full m-2 mr-8'>
      <table className='m-0 table-auto'>
        <thead>
          <tr className='h-12'>
            <th className='font-normal w-1/5'>IP Address</th>
            <th className='font-normal w-1/5'>Complexity Score</th>
            <th className='font-normal hidden sm:table-cell'>Number of Object Types</th>
            <th className='font-normal hidden sm:table-cell'>Query Depth</th>
            <th className='font-normal w-1/5'>Time Stamp</th>
          </tr>
        </thead>
        <tbody>
          {tableData && tableData.map((row, index) => {
            const color = index % 2 > 0? 'bg-white' : 'bg-slate-50';
            return (
              <tr key={uuidv4()} className={`h-24 ${color}`}>
                <th className='font-light'>{row.ip_address}</th>
                <th className='font-light'>{row.complexity_score}</th>
                <th className='font-light hidden sm:table-cell'>{row.object_types.objectTypes.length}</th>
                <th className='font-light hidden sm:table-cell'>{row.query_depth}</th>
                <th className='font-light'>{row.timestamp}</th>
              </tr>
            );
          })}
        </tbody>
    </table>

  </div>
  );
};

export default RequestTable;