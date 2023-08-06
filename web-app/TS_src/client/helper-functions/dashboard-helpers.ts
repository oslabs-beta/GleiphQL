import { EndpointRequest } from '../../types';

type ValType = 'complexity_score' | 'query_depth' | 'complexity_limit'; // for use with getValue helper function

interface DataSet {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: DataSet[];
}

// create formattedDate for x-axis of the chart (used for dataTypes Complexity and Depth)
const createXAxisPoint = (endpointRequest: EndpointRequest): string => {
  const rawDate: string = endpointRequest.timestamp;
  const formattedDate: string = new Date(rawDate).toISOString().split('T')[0];
  return formattedDate;
};

const configChartData = (interval: string, dataType: string, endpointRequests: EndpointRequest[]) => {
  const today: Date = new Date();
  const timeInterval: string[] = [];
  let datasets: DataSet[] = [];
  const chartData: ChartData = {
    labels: [],
    datasets: []
  };

   // helper function to obtain the value of a given valType in endpointRequest
   const getValue = (index: number, valType: ValType) : number => {
    return endpointRequests[index][valType];
  };

  // configure chart.js dataset if 'Requests' button is selected
  if (dataType === 'Requests') {
    let timeIntervalNum: number = 6; // last 7 days
    if (interval === 'Last 24 Hours') timeIntervalNum = 23;
    if (interval === 'Last 30 Days') timeIntervalNum = 29;
    // Create array which will be used for the x-axis for the dashboard chart
    for (let i: number = timeIntervalNum; i >= 0; i--) {
      const date: Date = new Date(today);
      if (interval === 'Last 24 Hours') {
        date.setHours(today.getHours() - i);
        date.setMinutes(Math.round(date.getMinutes() / 60) * 60);
        const formattedTime: string = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5);
        timeInterval.push(formattedTime);
      } else {
        date.setDate(today.getDate() - i);
        const formattedDate: string = date.toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
    }

    // Use the timeInterval array to map the data points for the chart 
    if (interval === 'Last 24 Hours') {
      const currentTime: Date = new Date();
      // Calculate the timestamp from 24 hours ago
      const twentyFourHoursAgo: number = currentTime.getTime() - 24 * 60 * 60 * 1000;
      // Filter the array to find objects with a timestamp within the last 24 hours
      const recentRequests: EndpointRequest[] = endpointRequests.filter((endpointData: EndpointRequest) : boolean => {
        const timestamp: number = new Date(endpointData.timestamp).getTime();
        return timestamp >= twentyFourHoursAgo && timestamp <= currentTime.getTime();
      });
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((time: string) : number => {
            let intervalRequests: number = 0;
            for (let i: number = 0; i < recentRequests.length; i++) {
              const roundedTime: Date = new Date(recentRequests[i].timestamp);
              const roundedMinutes: number = Math.round(roundedTime.getMinutes() / 60) * 60;
              roundedTime.setMinutes(roundedMinutes, 0, 0);
              const formattedTime: string = roundedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5);
              if (formattedTime === time) {
                intervalRequests ++;
              }
            }
            return intervalRequests;
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ];
    } else { // last 7 days or last 30 days
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date: string) : number => {
            let intervalRequests: number = 0;
            for (let i: number = 0; i < endpointRequests.length; i++) {
              const rawDate: string = endpointRequests[i].timestamp;
              const formattedDate: string = new Date(rawDate).toISOString().split('T')[0];
              if (formattedDate === date) {
                intervalRequests++;
              }
            }
            return intervalRequests;
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ];
    }

    chartData.labels = timeInterval;
    chartData.datasets = datasets;
    return chartData;
  }

  // configure chart.js dataset if 'Complexity' button is selected
  else if (dataType === 'Complexity') {
    // Create array which will be used for the x-axis for the dashboard chart
    for (let i: number = 0; i < endpointRequests.length; i++) {
      if ((interval === 'Last 10 Requests' && timeInterval.length < 10) || 
        (interval === 'Last 30 Requests' && timeInterval.length < 30) ||
        (interval === 'Last 100 Requests' && timeInterval.length < 100)
      ) timeInterval.push(createXAxisPoint(endpointRequests[i]));
    }

    // Use the timeInterval array to map the data points for the chart 

    const reverseTimeInterval: string[] = timeInterval.reverse();

    
    datasets = [
      {
        label: 'Complexity Scores',
        data: reverseTimeInterval.map((date: string, i: number) : number => {
          return getValue(i, 'complexity_score');
        }).reverse(),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Complexity Limit',
        data: reverseTimeInterval.map((date: string, i: number) : number => {
          return getValue(i, 'complexity_limit');
        }).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ];
  
    chartData.labels = timeInterval;
    chartData.datasets = datasets;
    return chartData;
  }

  // configure chart.js dataset if 'Depth' button is selected
  else  {
    // Create array which will be used for the x-axis for the dashboard chart
    for (let i: number = 0; i < endpointRequests.length; i++) {
      if ((interval === 'Last 10 Requests' && timeInterval.length < 10) ||
        (interval === 'Last 30 Requests' && timeInterval.length < 30) ||
        (interval === 'Last 100 Requests' && timeInterval.length < 100)
      ) timeInterval.push(createXAxisPoint(endpointRequests[i]));
    }

    // Use the timeInterval array to map the data points for the chart 

    const reverseTimeInterval: string[] = timeInterval.reverse();

    datasets = [
      {
        label: 'Complexity Scores',
        data: reverseTimeInterval.map((time: string, i: number) : number => {
          return getValue(i, 'query_depth');
        }).reverse(),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ];

    chartData.labels = timeInterval;
    chartData.datasets = datasets;
    return chartData;
  }
}

export default configChartData;