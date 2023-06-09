import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
import Sidebar from '../components/Sidebar'
import LineChart from '../components/LineChart';
import ChartHeader from '../components/ChartHeader';
// import SSEComponent from '../components/SSEComponent';

const Dashboard: React.FC<{}> = () => {
  const { currEndPoint } = useStore();
  return (
    <>
      <Navbar />
      <Sidebar />
      <div>
        <h1>Dashboard!</h1>
        {/* <SSEComponent /> */}
      </div>
      { currEndPoint.id? 
      <div>
        <ChartHeader />
        <LineChart />
        <RequestTable />
      </div> : null
       }
    </>

  );
}

export default Dashboard;