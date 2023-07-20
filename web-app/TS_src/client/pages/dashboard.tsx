import React, { useState , useEffect } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
import Sidebar from '../components/Sidebar'
import LineChart from '../components/LineChart';
import ChartHeader from '../components/ChartHeader';
import { Navigate } from 'react-router-dom';
import checkSession from '../helper-functions/checkSession';
import Sidebar2 from '../components/Sidebar2';

const Dashboard: React.FC<{}> = () => {
  const { currEndPoint, isLoggedIn, setIsLoggedIn, setCurrUser} = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
  }, []);

  if(isLoading) return <div>Loading...</div>;
  return (
    <>
      <Sidebar2 />
      <div id="content" className='m1-4'>
        {!isLoggedIn && <Navigate to="/" replace={true} />}
        <Navbar />
        <div className='flex flex-col place-items-center sm:place-items-start xl:flex-row'>
          {/* <Sidebar /> */}
          { currEndPoint.id? 
          <main className='flex flex-col place-items-center w-3/4 mr-2.5'>
            <ChartHeader />
            <LineChart />
            <RequestTable />
          </main> : null
          }
        </div>
      </div>
    </>
  );
}

export default Dashboard;