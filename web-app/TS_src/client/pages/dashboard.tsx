import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import SSEComponent from '../components/SSEComponent';

const Dashboard: React.FC<{}> = () => {
  
  return (
    <>
      <Navbar />
      <div>
        <h1>Dashboard!</h1>
        <SSEComponent />
      </div>
    </>
    
  );
}

export default Dashboard;