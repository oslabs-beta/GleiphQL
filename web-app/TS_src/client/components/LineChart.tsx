import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
    maintainAspectRatio: false,
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
    <section className='flex flex-col place-items-center'>
      {chartDataType === 'Requests'? (
        <p className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden m-4'>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 24 Hours')}>Last 24 Hours</button>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 7 Days')}>Last 7 Days</button>
          <button className='p-2 border border-blue-950 hover:bg-blue-900' onClick={()=>setChartTime('Last 30 Days')}>Last 30 Days</button>
        </p>
      ) : (
        <p className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden'>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 10 Requests')}>Last 10 Requests</button>
          <button className='p-2 border border-blue-950 border-r-black hover:bg-blue-900' onClick={()=>setChartTime('Last 30 Requests')}>Last 30 Requests</button>
          <button className='p-2 border border-blue-950 hover:bg-blue-900' onClick={()=>setChartTime('Last 100 Requests')}>Last 100 Requests</button>
        </p>
      )}
      <p id='chartContainer'>
        <Line options={options} data={chartData} />
      </p>
      <p className='flex flex-row bg-blue-950 text-white rounded-md overflow-hidden w-80 m-4'>
        <button className='p-2 px-1 border border-blue-950 border-r-black hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Requests')}>Requests</button>
        <button className='p-2 px-1 border border-blue-950 border-r-black hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Complexity')}>Complexity</button>
        <button className='p-2 px-1 border border-blue-950 hover:bg-blue-900 w-1/3' onClick={()=>dataTypeChange('Depth')}>Depth</button>
      </p>
    </section>
  )
}

export default LineChart