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
    const endpointRequests = fetch(`/api/data/${currEndPoint.id}`)
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
        <ButtonGroup variant="contained" sx={{margin: "10px"}}>
          <Button onClick={()=>setChartTime('Last 24 Hours')}>Last 24 Hours</Button>
          <Button onClick={()=>setChartTime('Last 7 Days')}>Last 7 Days</Button>
          <Button onClick={()=>setChartTime('Last 30 Days')}>Last 30 Days</Button>
        </ButtonGroup>
      ) : (
        <ButtonGroup variant="contained" sx={{margin: "10px"}}>
          <Button onClick={()=>setChartTime('Last 10 Requests')}>Last 10 Requests</Button>
          <Button onClick={()=>setChartTime('Last 30 Requests')}>Last 30 Requests</Button>
          <Button onClick={()=>setChartTime('Last 100 Requests')}>Last 100 Requests</Button>
        </ButtonGroup>
      )}
      <Line options={options} data={chartData} />
      <ButtonGroup variant="contained" sx={{margin: "10px"}}>
        <Button onClick={()=>dataTypeChange('Requests')}>Requests</Button>
        <Button onClick={()=>dataTypeChange('Complexity')}>Complexity</Button>
        <Button onClick={()=>dataTypeChange('Depth')}>Depth</Button>
      </ButtonGroup>
    </>
  )
}

export default LineChart