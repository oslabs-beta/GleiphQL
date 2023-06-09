const configChartData = (interval: string, dataType: string, endpointRequests: any) :any => {
  if (dataType === 'Requests') {

    let timeIntervalNum = 6;
    if (interval === 'Last 24 Hours') timeIntervalNum = 23;
    if (interval === 'Last 7 Days') timeIntervalNum = 6;
    if (interval === 'Last 30 Days') timeIntervalNum = 29;

    const today = new Date();
    const timeInterval: string[] = [];
    let datasets: any = []

    // Create array have the show the x-axis for the dashboard chart
    for (let i = timeIntervalNum; i >= 0; i--) {
      const date = new Date(today);
      if (interval === 'Last 7 Days' || interval === 'Last 30 Days') {
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
      if (interval === 'Last 24 Hours') {
        date.setHours(today.getHours() - i);
        date.setMinutes(Math.round(date.getMinutes() / 60) * 60);
        const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5);
        timeInterval.push(formattedTime);
      }
    }

    // configure chart.js dataset for the dashboard chart
    if (interval === 'Last 24 Hours') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((time) => {
            let intervalRequests = 0
            for (let i = 0; i < endpointRequests.length; i++) {
              const roundedTime = new Date(endpointRequests[i].timestamp);
              const roundedMinutes = Math.round(roundedTime.getMinutes() / 60) * 60;
              roundedTime.setMinutes(roundedMinutes, 0, 0);
              const formattedTime = roundedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5);
              if (formattedTime === time) {
                intervalRequests ++;
              }
            }
            return intervalRequests
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Total Blocked Requests',
          data: timeInterval.map((date) => {
            return 1
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ]
    }
    if (interval === 'Last 7 Days' || interval === 'Last 30 Days') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date) => {
            let intervalRequests = 0
            for (let i = 0; i < endpointRequests.length; i++) {
              const rawDate = endpointRequests[i].timestamp;
              const formattedDate = new Date(rawDate).toISOString().split('T')[0];
              if (formattedDate === date) {
                intervalRequests ++;
              }
            }
            return intervalRequests
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Total Blocked Requests',
          data: timeInterval.map((date) => {
            return 1
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ]
    }

    const chartData = {
      labels: timeInterval,
      datasets,
    };
    return chartData
  }
  if (dataType === 'Complexity') {
    let timeIntervalNum = 9;
    if (interval === 'Last 10 Requests') timeIntervalNum = 9;
    if (interval === 'Last 30 Requests') timeIntervalNum = 29;
    if (interval === 'Last 100 Requests') timeIntervalNum = 99;

    const today = new Date();
    const timeInterval: string[] = [];
    let datasets: any = []

    // Create array have the show the x-axis for the dashboard chart
    for (let i = 0; i < endpointRequests.length; i++) {
      const date = new Date(today);
      if (interval === 'Last 10 Requests' && timeInterval.length < 10) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
      if (interval === 'Last 30 Requests' && timeInterval.length < 30) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
      if (interval === 'Last 100 Requests' && timeInterval.length < 100) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
    }

    // configure chart.js dataset for the dashboard chart
    if (interval === 'Last 10 Requests') {
      datasets = [
        {
          label: 'Complexity Scores',
          data: timeInterval.map((time, i) => {
            return endpointRequests[i].complexity_score
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Complexity Limit',
          data: timeInterval.map((date) => {
            return 1000
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ]
    }
    if (interval === 'Last 30 Requests') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date, i) => {
            return endpointRequests[i].complexity_score
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Complexity Limit',
          data: timeInterval.map((date) => {
            return 1000
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ]
    }
    if (interval === 'Last 100 Requests') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date, i) => {
            return endpointRequests[i].complexity_score
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Complexity Limit',
          data: timeInterval.map((date) => {
            return 1000
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ]
    }

    const chartData = {
      labels: timeInterval,
      datasets,
    };
    return chartData
  }
  if (dataType === 'Depth') {
    let timeIntervalNum = 9;
    if (interval === 'Last 10 Requests') timeIntervalNum = 9;
    if (interval === 'Last 30 Requests') timeIntervalNum = 29;
    if (interval === 'Last 100 Requests') timeIntervalNum = 99;

    const today = new Date();
    const timeInterval: string[] = [];
    let datasets: any = []

    // Create array have the show the x-axis for the dashboard chart
    for (let i = 0; i < endpointRequests.length; i++) {
      const date = new Date(today);
      if (interval === 'Last 10 Requests' && timeInterval.length < 10) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
      if (interval === 'Last 30 Requests' && timeInterval.length < 30) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
      if (interval === 'Last 100 Requests' && timeInterval.length < 100) {
        const rawDate = endpointRequests[i].timestamp;
        const formattedDate = new Date(rawDate).toISOString().split('T')[0];
        timeInterval.push(formattedDate);
      }
    }

    // configure chart.js dataset for the dashboard chart
    if (interval === 'Last 10 Requests') {
      datasets = [
        {
          label: 'Complexity Scores',
          data: timeInterval.map((time, i) => {
            return endpointRequests[i].query_depth
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
    if (interval === 'Last 30 Requests') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date, i) => {
            return endpointRequests[i].query_depth
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
    if (interval === 'Last 100 Requests') {
      datasets = [
        {
          label: 'Total API Requests',
          data: timeInterval.map((date, i) => {
            return endpointRequests[i].query_depth
          }),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }

    const chartData = {
      labels: timeInterval,
      datasets,
    };
    return chartData
  }
}

export default configChartData