import React from 'react';


const InstructionSection: React.FC<{}> = () => {
  const copyText = async (elementId : string) => {
    let text = document.getElementById(elementId)?.innerText;
    try {
      // @ts-ignore
      await navigator.clipboard.writeText(text);
    } catch (err: any) {
      console.log(err.message);
    }
  }
  return (
  <section className='flex flex-row p-8'>
    <div className='w-6/12'>
      <h2 className='text-2xl font-extrabold p-2'>Get Started Easily</h2>
      <p>
        Ready to revolutionize your GraphQL endpoint?
        Take the first step towards a faster, smarter,
        and more secure API infrastructure.
      </p>
      <a href='https://github.com/oslabs-beta/graphql-rate-limiter' target='_blank' ><button className='bg-blue-950 text-white m-8'>More Info</button></a>
    </div>
    <div className='p-8 w-6/12 grid place-items-center'>
      <p className='p-2 w-3/6'>npm: </p>
      <p className='w-3/6 border rounded-lg border-solid border-blue-950 flex flex-row justify-between'>
        <p className='p-2 pl-8' id='npm'>
          npm install gleiphql
        </p>
        <button className='border-none w-fit' onClick={() => copyText('npm')}>
          <span className="material-symbols-outlined">content_copy</span>
        </button>
      </p>
      <p className='p-2 w-3/6'>Or yarn: </p>
      <p className='w-3/6 border rounded-lg border-solid border-blue-950 flex flex-row justify-between'>
        <p className='p-2 pl-8' id='yarn'>
          yarn add gleiphql
        </p>
        <button className='border-none w-fit' onClick={() => copyText('yarn')}>
          <span className="material-symbols-outlined">content_copy</span>
        </button>
      </p>
    </div>
  </section>
  );
}

export default InstructionSection; 