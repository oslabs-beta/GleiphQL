import React from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
import Sidebar from '../components/Sidebar'
import LineChart from '../components/LineChart';
import ChartHeader from '../components/ChartHeader';

const Dashboard: React.FC<{}> = () => {
  const { currEndPoint } = useStore();
  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <Sidebar />
        { currEndPoint.id? 
        <main className='main-section'>
          <ChartHeader />
          <LineChart />
          <RequestTable />
        </main> : null
        }
      </div>
    </>
  );
}

export default Dashboard;