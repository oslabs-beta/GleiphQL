import React from 'react';
import MeetTheTeam from '../components/MeetTheTeam';
import Footer from '../components/Footer';
import useStore from '../store';
import IntroSection from '../components/IntroSection';
import InstructionSection from '../components/InstructionSection';


const SplashPage: React.FC<{}> = () => {  
  return (  
    <main className='divide-y divide-solid divide-indigo-950 divide-y-2'>
      <IntroSection />
      <InstructionSection />
      <MeetTheTeam />
    </main>
  );
}

export default SplashPage;
