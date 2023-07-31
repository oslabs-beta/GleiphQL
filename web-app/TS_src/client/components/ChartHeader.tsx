import { FC, ReactElement }  from 'react';
import useStore from '../store';
import { EndpointRequest } from '../../types';

interface PartialStore {
  endpointRequests: EndpointRequest[];
}


const ChartHeader: FC = () : ReactElement => {
  const { endpointRequests } : PartialStore = useStore();

  // calculates the average complexity of the queries made to the endpoint
  const averageComplexity = () : number => {
    if (endpointRequests.length === 0) return 0;
    let sumOfScores: number = 1;
    for (let i: number = 0; i < endpointRequests.length; i++) {
      sumOfScores += endpointRequests[i].complexity_score;
    }
    const averageScore: number = sumOfScores / endpointRequests.length;
    return Math.round(averageScore * 100) / 100;
  }

  return (
    <header className='border rounded-lg border-slate-100 border-1 overflow-hidden w-1/2 m-4 grid grid-cols-1 place-content-center font-light'>
      <table>
        <thead>
          <tr>
            <th>Total API Requests</th>
            <th>Average Complexity Score</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <th>{endpointRequests.length}</th>
              <th>{averageComplexity()}</th>
            </tr>
        </tbody>
      </table>
    </header>
  );
}

export default ChartHeader;