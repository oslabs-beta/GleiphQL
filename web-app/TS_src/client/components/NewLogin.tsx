import React from 'react';
import useStore from '../store';
import { Navigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';
import axios from 'axios';

interface LoginResponse {
  userExists: boolean;
  signedIn: boolean;
  userId?: number;
  userEmail?: string;
}

const NewLogin: React.FC<{}> = () => {
  const { loginToggle, registerToggle, userEmail, setUserEmail, userPassword, setUserPassword, isLoggedIn, setIsLoggedIn, setCurrUser } = useStore();
  // create function to toggle both components
  const handleClose = () => {
    loginToggle(false);
    registerToggle(false);
  }
  const toggleRegister = () => {
    loginToggle(false);
    registerToggle(true);
  }

  // create function to handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userLogin = {
      email: userEmail,
      password: userPassword
    }

    try {
      const response = await axios.post<LoginResponse>('/api/account/login', userLogin);

      if (response.data.userExists && response.data.signedIn) {
        setCurrUser(response.data.userId||0, response.data.userEmail||'');
        setIsLoggedIn(true);
      } else {
        alert('Unsuccesful Login Attempt');
        setUserEmail('');
        setUserPassword('');
      }

    } catch(error) {
      console.error(error);
      
      const typedError = error as Error;
      throw new Error(`Error in login component: ${typedError.message}`);
    }
  }

  return (
    <>
      <h3>Hello new Login</h3>
      <AiOutlineClose />
      
      <div className='bg-gray-800 flex flex-col justify-center'>
        <form className='max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8'>

          <h2 className='test-4xl dark:text-white font-bold text-center'>SIGN IN</h2>

          <div className='flex flex-col test-gray-400 py-2'>
            <label>Username</label>
            <input className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-clue-500 focus:bg-gray-800 focus:outline-none' type='text' />
          </div>

          <div className='flex flex-col test-gray-400 py-2'>
            <label>Password</label>
            <input className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-clue-500 focus:bg-gray-800 focus:outline-none' type='password' />
          </div>

          <button className='w-full my-5 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal/40 test-white font-semibold rounded-lg'>SIGN IN</button>
        </form>
      </div>
    </>
  );
};

export default NewLogin;