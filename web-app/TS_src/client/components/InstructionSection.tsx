import React from 'react';
import notify from '../helper-functions/notify';
import { Element } from 'react-scroll';


const InstructionSection: React.FC<{}> = () => {
  const copyText = async (elementId : string) => {
    let text = document.getElementById(elementId)?.innerText;
    try {
      // @ts-ignore
      await navigator.clipboard.writeText(text);
      notify('Copied!')
    } catch (err: any) {
      console.log(err.message);
    }
  }
  return (
    <>
      <Element name='get-started'>
        <section id='get-started' className='min-h-screen p-8 text-center flex flex-col justify-evenly items-center md:flex-row'>
          <div className='md:w-1/2'>
            <h2 className='text-2xl font-extrabold p-2'>Get Started Easily</h2>
            <p>
              Ready to revolutionize your GraphQL endpoint?
              Take the first step towards a faster, smarter,
              and more secure API infrastructure.
            </p>
            <a
              id='moreInfo-btn'
              href='https://github.com/oslabs-beta/graphql-rate-limiter' 
              target='_blank' 
              data-expected-url='https://github.com/oslabs-beta/GleiphQL'>
              <button 
                className='rounded-md border text-white bg-blue-950 hover:bg-blue-900 font-semibold p-2 m-4 w-32'
                
              >More Info</button>
            </a>
          </div>

          {/* Wrapped dl elements in a div so that we can apply centering for text content */}
          <div>
            <dl className='grid place-items-center md:w-1/2'>
              <dt className='p-2'>npm: </dt>
              <dd className='w-60 border rounded-lg border-solid border-blue-950 flex flex-row justify-between'>
                <p className='p-4' id='npm'>
                  npm install gleiphql
                </p>
                <button 
                  id='npmCopy-btn'
                  className='border-none w-fit pr-2' 
                  onClick={() => copyText('npm')}>
                  <span className='material-symbols-outlined'>content_copy</span>
                </button>
              </dd>
              <dt className='p-2'>Or yarn: </dt>
              <dd className='w-60 border rounded-lg border-solid border-blue-950 flex flex-row justify-between'>
                <p className='p-4' id='yarn'>
                  yarn add gleiphql
                </p>
                <button
                  id='yarnCopy-btn'
                  className='border-none w-fit pr-2' 
                  onClick={() => copyText('yarn')}>
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </dd>
            </dl>
          </div>
        </section>
      </Element>
    </>
    
  
  );
}

export default InstructionSection; 