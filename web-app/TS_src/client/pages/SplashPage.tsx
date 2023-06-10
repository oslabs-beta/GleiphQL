import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import useStore from '../store';

const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <div className='splashpage-container'>
      <h1>GleiphQL</h1>
      <h2>
        <em>An innovative and dynamic Rate Limiting and Cost Analysis Tool</em>
      </h2>
      
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

    </div>
  );
}

export default SplashPage;