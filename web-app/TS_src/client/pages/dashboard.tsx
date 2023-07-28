import React, { useState , useEffect } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
import LineChart from '../components/LineChart';
import ChartHeader from '../components/ChartHeader';
import { Navigate } from 'react-router-dom';
import checkSession from '../helper-functions/checkSession';
import Sidebar from '../components/Sidebar';

const Dashboard: React.FC<{}> = () => {
  const { currEndPoint, isLoggedIn, setIsLoggedIn, setCurrUser, loginToggle, setModalOpen, setConnection } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
    loginToggle(false);
    setModalOpen(false);
  }, []);

  if(isLoading) return <div>Loading...</div>;
  return (
    <div className='flex flex-col'>
      {!isLoggedIn && <Navigate to='/' replace={true} />}
      <Navbar />
      <div>
        <Sidebar />
      </div>
      { currEndPoint?
      <main className='flex flex-col place-items-center w-screen sm:pl-12'>
        <ChartHeader />
        <LineChart />
        <RequestTable />
      </main> : null
      }
    </div>
  );
}

export default Dashboard;
