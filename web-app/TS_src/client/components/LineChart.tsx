import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import configChartData from '../helper-functions/dashboard-helpers';
import useStore from '../store';
import "chart.js/auto";

const LineChart: React.FC<{}> = () => {
  const { 
    endpointRequests, 
    setEndpointRequests, 
    chartTimeInterval, 
    setChartTime, 
    chartDataType, 
    setChartDataType,
    currEndPoint
  } = useStore();

  useEffect(() => {
    console.log('Current endpoint: ', currEndPoint)
    fetch(`/api/data/${currEndPoint.id}`)
    .then((res)=>res.json())
    .then((data)=>{
      console.log("endpoint requests: ", data)
      setEndpointRequests(data)
    })
  }, [currEndPoint]);

  const dataTypeChange = (dataType: string) => {
    setChartDataType(dataType)
    if (dataType === 'Complexity' || dataType === 'Depth') {
      setChartTime('Last 30 Requests')
    }
    if (dataType === 'Requests') {
      setChartTime('Last 7 Days')
    }
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: `${chartDataType} - ${chartTimeInterval}`,
      },
    },
  };
  
  const chartData = configChartData(chartTimeInterval, chartDataType, endpointRequests)

  return (
    <>
      {chartDataType === 'Requests'? (
        <div className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden m-4'>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 24 Hours')}>Last 24 Hours</button>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 7 Days')}>Last 7 Days</button>
          <button className='p-2 border border-blue-950 hover:bg-blue-900' onClick={()=>setChartTime('Last 30 Days')}>Last 30 Days</button>
        </div>
      ) : (
        <div className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden'>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 10 Requests')}>Last 10 Requests</button>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 30 Requests')}>Last 30 Requests</button>
          <button className='p-2 border border-blue-950 hover:bg-blue-900' onClick={()=>setChartTime('Last 100 Requests')}>Last 100 Requests</button>
        </div>
      )}
      <Line options={options} data={chartData} />
      <div className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden max-w-80 m-4'>
        <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Requests')}>Requests</button>
        <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Complexity')}>Complexity</button>
        <button className='p-2 border border-blue-950 hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Depth')}>Depth</button>
      </div>
    </>
  )
}

export default LineChart