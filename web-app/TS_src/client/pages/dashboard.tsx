import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import LineChart from '../components/LineChart';

const Dashboard: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <>
      <Navbar />
      <div>
        <h1>Dashboard!</h1>
      </div>
      <LineChart />
    </>
    
  );
}

export default Dashboard;