import React, { useState } from 'react';
import Login from '../components/Login';

interface SplashPageProps {
  showLogin: boolean;
  handleLoginToggle: () => void;
}

const SplashPage: React.FC<SplashPageProps> = ({ showLogin, handleLoginToggle }) => {


  return (
    <div className='splashpage-container'>
      <h1>GleiphQL</h1>
      <h2>
        <em>An innovative and dynamic Rate Limiting and Cost Analysis Tool</em>
      </h2>

      {showLogin && (
        <div className="login-popup">
          <Login handleLoginToggle={handleLoginToggle} />
        </div>
      )}

    </div>
  );
}

export default SplashPage;