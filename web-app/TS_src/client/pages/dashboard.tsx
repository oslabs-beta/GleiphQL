import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar'

const Dashboard: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();


  return (
    <>
      <Navbar />
      <Sidebar />
      <div>
        <h1>Dashboard!</h1>
      </div>
    </>

  );
}

export default Dashboard;