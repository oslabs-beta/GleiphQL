import { FC, ReactElement } from 'react';
import { Element } from 'react-scroll';


const IntroSection: FC = () : ReactElement => {

  return (
    <>
      <Element name='intro'>
        <section id='intro' className='introsection min-h-screen pb-20 px-8 flex flex-col lg:flex-row justify-around items-center'>
          <div className='flex-col p-4 text-center lg:w-1/2'>
            <h2 className='text-5xl font-extrabold py-2 text-left'>Protect and monitor your GraphQL Endpoints</h2>
            <p className='text-xl text-left mb-8'>
              GleiphQL is an Express middleware library which enhances performance
              and security by calculating query complexity, optimizing resource
              allocation, and preventing bottlenecks.
            </p>
            <a
              className='rounded-md border text-white bg-blue-950 hover:bg-blue-900 font-semibold p-4 w-32'
              href='#features'
            >
              Start Exploring
            </a>
          </div>
          <div className='w-full lg:w-1/2 mt-8'>
            <img className='object-center m-auto' src='../public/images/webapp.png' alt='screenshot of dashboard' width='800px'/>
          </div>
        </section>
      </Element>
    </>
  );
}

export default IntroSection; 