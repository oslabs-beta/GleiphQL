import React, { useState } from 'react';


const InstructionSection: React.FC<{}> = () => {
  const copyText = async (elementId : string) => {
    let text = document.getElementById(elementId)?.innerText.replace('content_copy', '')
    try {
      // @ts-ignore
      await navigator.clipboard.writeText(text);
    } catch (err: any) {
      console.log(err.message);
    }
  }
  return (
  <div className='sect'>
    <div className='part'>
      <h2>Get Started Easily</h2>
      <p>
        Ready to revolutionize your GraphQL endpoint?
        Take the first step towards a faster, smarter,
        and more secure API infrastructure.
      </p>
      <a href='https://github.com/oslabs-beta/graphql-rate-limiter' target='_blank' ><button id='moreInfo'>More Info</button></a>
    </div>
    <div className='part'>
      <p>npm: </p>
      <button id='npm' className='copyButton' onClick={() => copyText('npm')}>npm install gleiphql<span className="material-symbols-outlined">content_copy</span></button>
      <p>Or yarn: </p>
      <button id='yarn' className='copyButton' onClick={() => copyText('yarn')}>yarn add gleiphql<span className="material-symbols-outlined">content_copy</span></button>
    </div>
  </div>
  );
}

export default InstructionSection; 