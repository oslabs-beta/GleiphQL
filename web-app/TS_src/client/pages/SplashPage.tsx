import React from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import MeetTheTeam from '../components/MeetTheTeam';
import Footer from '../components/Footer';
import NewLogin from '../components/NewLogin';
import useStore from '../store';
import IntroSection from '../components/IntroSection';
import InstructionSection from '../components/InstructionSection';


const SplashPage: React.FC<{}> = () => {
  const { showLogin, showRegistration } = useStore();
  
  
  return (
    <div className='flex flex-col justify-center align-middle'>
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
      <article className='divide-y divide-solid divide-indigo-950 divide-y-2'>
        <IntroSection />
        <InstructionSection />
      </article>      <br />
      <MeetTheTeam />
      <br />
      <Footer />

      <div>
        <h1>Test area</h1>
        <NewLogin />
      </div>

    </div>
  );
}

export default SplashPage;