import React, { useState } from 'react';


const IntroSection: React.FC<{}> = () => {

 return (
  <div className='sect'>
    <div className='part'>
      <h2>Protect and monitor your GraphQL Endpoints</h2>
      <p>
        GleiphQL is an Express middleware library which enhances performance
        and security by calculating query complexity, optimizing resource
        allocation, and preventing bottlenecks.
      </p>
    </div>
    <div className='part'>
      <img src='../assets/webapp.png' alt='screenshot of dashboard' width='500px'/>
    </div>
  </div>
  );
}

export default IntroSection; 