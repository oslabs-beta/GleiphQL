import React, { useState , useEffect } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
import Sidebar from '../components/Sidebar'
import LineChart from '../components/LineChart';
import ChartHeader from '../components/ChartHeader';
import { Navigate } from 'react-router-dom';
import checkSession from '../helper-functions/checkSession';

const Dashboard: React.FC<{}> = () => {
  const { currEndPoint, isLoggedIn, setIsLoggedIn, setCurrUser} = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
  }, []);

  if(isLoading) return <div>Loading...</div>;
  return (
    <>
      {!isLoggedIn && <Navigate to="/" replace={true} />}
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