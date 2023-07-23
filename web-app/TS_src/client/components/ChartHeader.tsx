import React from 'react';
import useStore from '../store';

const ChartHeader: React.FC<{}> = () => {
  const { 
    endpointRequests, 
    setEndpointRequests, 
    chartTimeInterval, 
    setChartTime, 
    chartDataType, 
    setChartDataType 
  } = useStore();

  const averageComplexity = () => {
    if (endpointRequests.length === 0) return 0
    let sumOfScores = 1
    for (let i = 0; i < endpointRequests.length; i++) {
      sumOfScores += endpointRequests[i].complexity_score
    }
    const averageScore = sumOfScores / endpointRequests.length
    return Math.round(averageScore * 100) / 100
  }

 return (
    <header className='rounded-lg border border-slate-100 border-1 overflow-hidden w-3/4 m-4 grid grid-cols-1 place-content-center font-light'>
      <table>
        <thead>
          <tr>
            <th className='font-light'>Total API Requests</th>
            <th className='font-light'>Total Blocked Requests</th>
            <th className='font-light'>Average Complexity Score</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <th>{endpointRequests.length}</th>
              <th>{0}</th>
              <th>{averageComplexity()}</th>
            </tr>
        </tbody>
      </table>
    </header>
  );
}

export default ChartHeader 