import React, { useState } from 'react';

const InstructionSection: React.FC<{}> = () => {
  const copyText = async (elementId : string) => {
    const text = document.getElementById(elementId)?.innerHTML;
    try {
      // @ts-ignore
      await navigator.clipboard.writeText(text);
    } catch (err: any) {
      console.log(err.message);
    }
  }
  return (
  <div>
    <div>
      <h2>Get Started Easily</h2>
      <p>
        Ready to revolutionize your GraphQL endpoint?
        Take the first step towards a faster, smarter,
        and more secure API infrastructure.
      </p>
      <a href='https://github.com/oslabs-beta/graphql-rate-limiter' target='_blank'><p>More Info</p></a>
    </div>
    <div>
      <p>npm: </p>
      <button id='npm' onClick={() => copyText('npm')}>npm install gleiphql</button>
      <p>Or yarn: </p>
      <button id='yarn' onClick={() => copyText('yarn')}>yarn add gleiphql</button>
    </div>
  </div>
  );
}

export default InstructionSection; 