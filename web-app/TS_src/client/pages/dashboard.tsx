import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';

const Dashboard: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <>
      <Navbar />
      <div>
        <h1>Dashboard!</h1>
      </div>
      <RequestTable endpointId={1} />
    </>
    
  );
}

export default Dashboard;