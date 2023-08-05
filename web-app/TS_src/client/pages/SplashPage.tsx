import { ReactElement, FC } from 'react';
import MeetTheTeam from '../components/MeetTheTeam';
import IntroSection from '../components/IntroSection';
import InstructionSection from '../components/InstructionSection';
import FeaturesSection from '../components/FeaturesSection';


const SplashPage: FC = () : ReactElement => {  
  return (  
    <main>
      <IntroSection />
      <FeaturesSection />
      <InstructionSection />
      <MeetTheTeam />
    </main>
  );
}

export default SplashPage;
