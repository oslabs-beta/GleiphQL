import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import useStore from '../store';
import IntroSection from '../components/IntroSection';
import InstructionSection from '../components/InstructionSection';


const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <div className='splashpage-container'>   
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
      <IntroSection />
      <InstructionSection />
    </div>
  );
}

export default SplashPage;