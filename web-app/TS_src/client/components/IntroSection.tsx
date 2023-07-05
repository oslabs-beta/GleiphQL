import React from 'react';


const IntroSection: React.FC<{}> = () => {

 return (
  <section className='flex flex-row p-8 justify-between'>
    <div className='w-6/12'>
      <h2 className='text-2xl font-extrabold p-2'>Protect and monitor your GraphQL Endpoints</h2>
      <p>
        GleiphQL is an Express middleware library which enhances performance
        and security by calculating query complexity, optimizing resource
        allocation, and preventing bottlenecks.
      </p>
    </div>
    <div>
      <img src='../assets/webapp.png' alt='screenshot of dashboard' width='500px'/>
    </div>
  </section>
  );
}

export default IntroSection; 