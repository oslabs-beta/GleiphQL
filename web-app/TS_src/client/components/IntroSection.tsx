import React from 'react';
import { Element } from 'react-scroll';


const IntroSection: React.FC<{}> = () => {

  return (
    <>
      <Element name='intro'>
        <section id='intro' className='introsection min-h-screen pb-20 px-8 flex flex-col md:flex-row justify-around items-center'>
          <div className='flex-col p-4 text-center md:w-1/2'>
            <h2 className='text-5xl font-extrabold py-2 text-left'>Protect and monitor your GraphQL Endpoints</h2>
            <p className='text-xl text-left'>
              GleiphQL is an Express middleware library which enhances performance
              and security by calculating query complexity, optimizing resource
              allocation, and preventing bottlenecks.
            </p>
            <button 
              className='rounded-md border text-white bg-blue-950 hover:bg-blue-900 font-semibold p-2 m-4 w-32'
              onClick={()=>document.getElementsByClassName('featuresSection-bg')[0].scrollIntoView()}
            >
              Start Exploring
            </button>
          </div>
          <div className='w-full md:w-1/2'>
            <img className='object-center m-auto' src='../assets/webapp.png' alt='screenshot of dashboard' width='800px'/>
          </div>
        </section>
      </Element>
    </>
  );
}

export default IntroSection; 