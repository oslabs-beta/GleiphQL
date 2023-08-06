import { FC, ReactElement }  from 'react';
import useStore from '../store';
import { EndpointRequest, PartialStore } from '../../types';


const ChartHeader: FC = () : ReactElement => {
  const { endpointRequests } : PartialStore = useStore();

  // calculates the average complexity of the queries made to the endpoint and the number of blocked requests
  const calculateHeaderStats = () : number[] => {
    if (endpointRequests.length === 0) return [0, 0];
    let sumOfScores: number = 1;
    let blockedRequests: number = 0;
    for (const endpointRequest of endpointRequests) {
      sumOfScores += endpointRequest.complexity_score;
      if(endpointRequest.blocked) blockedRequests++;
    }
    const averageScore: number = sumOfScores / endpointRequests.length;
    return [Math.round(averageScore * 100) / 100, blockedRequests];
  }



  return (
    <header className='border rounded-lg border-slate-100 border-1 overflow-hidden w-1/2 m-4 grid grid-cols-1 place-content-center font-light'>
      <table>
        <thead>
          <tr>
            <th>Total API Requests</th>
            <th>Blocked Requests</th>
            <th>Average Complexity Score</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <th>{endpointRequests.length}</th>
              <th>{calculateHeaderStats()[1]}</th>
              <th>{calculateHeaderStats()[0]}</th>
            </tr>
        </tbody>
      </table>
    </header>
  );
}

export default ChartHeader;