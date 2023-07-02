import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import MeetTheTeam from '../components/MeetTheTeam';
import Footer from '../components/Footer';
import useStore from '../store';

const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <div className='splashpage-container'>
      <h1 className='text-center flex flex-col items-center justify-center h-full'>
        GleiphQL
        <em className='text-3xl'>An innovative and dynamic Rate Limiting and Cost Analysis Tool</em>
      </h1>
      
      {showLogin && (!showRegistration) && (
        <div className="login-popup">
          <Login />
        </div>
      )}

      {showRegistration && (!showLogin) && (
        <div className='register-popup'>
          <Register />
        </div>
      )}
      <br />
      <MeetTheTeam />
      <br />
      <Footer />

    </div>
  );
}

export default SplashPage;