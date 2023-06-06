import React, { useState } from 'react';
import Login from '../components/Login';
import useStore from '../store';

const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegister } = useStore();
  
  
  return (
    <div className='splashpage-container'>
      <h1>GleiphQL</h1>
      <h2>
        <em>An innovative and dynamic Rate Limiting and Cost Analysis Tool</em>
      </h2>
      
      {showLogin && (
        <div className="login-popup">
          <Login />
        </div>
      )}

      {showRegister && (
          <div className='register-component'>

          </div>
        )}

    </div>
  );
}

export default SplashPage;