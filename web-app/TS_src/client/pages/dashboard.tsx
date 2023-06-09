import React, { useState } from 'react';
import useStore from '../store';
import Navbar from '../components/Navbar';
import RequestTable from '../components/RequestTable';
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
      <RequestTable endpointId={1} />
    </>

  );
}

export default Dashboard;