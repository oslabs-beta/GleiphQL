import React from 'react';
import MeetTheTeam from '../components/MeetTheTeam';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import useStore from '../store';
import IntroSection from '../components/IntroSection';
import InstructionSection from '../components/InstructionSection';


const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <div>   
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
      <article className='divide-y divide-solid divide-indigo-950 divide-y-2'>
        <IntroSection />
        <InstructionSection />
      </article>      <br />
      <MeetTheTeam />
      <br />
      <Footer />

    </div>
  );
}

export default SplashPage;