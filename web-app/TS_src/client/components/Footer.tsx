import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';


const Footer: React.FC<{}> = () => {
  // add logic:

  return (
    <footer>
      {/* This underling style is not showing up. Need to defined a custom class and apply the styling in the css file or inline style: text-decoration: underline;
      text-decoration-offset: 0.8em; */}
      <h2 className='underline-offset-8'>Want to Contribute? </h2>

      <p>Join us and help developers secure and monitor their GraphQL endpoints.</p>

      <p>Star us on Github!</p>

      <p className='flex flex-row justify-center desktop:p-10 desktop:m-10 pb-5 mb-5'>
        <a href='https://github.com/oslabs-beta/graphql-rate-limiter' target='_blank' rel='noopener noreferrer' className='mr-4'>
          <FaGithub size={64} />
        </a>
        <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ' target='_blank' rel='noopener referrer'>
          <FaLinkedin size={64} />
        </a>
      </p>

      <p className='flex justify-center text-s align-baseline pb-2 px-5 border-t-2 border-slate-300'>
        <small>Copyright © 2023 GleiphQL + OSLabs. Distributed under the MIT License - All right reserved</small>
      </p>
    </footer>
  );
};

export default Footer;