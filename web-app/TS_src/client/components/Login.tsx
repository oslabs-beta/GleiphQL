import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Navigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import checkSession from '../helper-functions/checkSession';
import notify from '../helper-functions/notify';



interface LoginResponse {
  userExists: boolean;
  signedIn: boolean;
  userId?: number;
  userEmail?: string;
}

const Login: React.FC<{}> = () => {
  const { loginToggle, registerToggle, userEmail, setUserEmail, userPassword, setUserPassword, isLoggedIn, setIsLoggedIn, setCurrUser, setModalOpen } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
  }, []);

  // create function to toggle both components
  const handleClose = () => {
    loginToggle(false);
    registerToggle(false);
    setModalOpen(false);
  }
  const toggleRegister = () => {
    loginToggle(false);
    registerToggle(true);
  }

  // create function to handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUserEmail('');
    setUserPassword('');

    const userLogin = {
      email: userEmail,
      password: userPassword
    }

    try {
      const response = await axios.post<LoginResponse>('/api/account/login', userLogin);

      if (response.data.signedIn) {
        setCurrUser(response.data.userId||0, response.data.userEmail||'');
        setIsLoggedIn(true);
        notify('Login successful!', 'success');
      } 
    } catch(error) {
      notify('Login unsuccessful. Try again.', 'error');
      setCurrUser(0, '');
      setIsLoggedIn(false);
    }
  }

  if(isLoading) return <div>Loading...</div>;

  return (
    <div className='relative border-4 border-neutral-800 bg-stone-100 w-[450px] h-[520px] max-w-[450px]  mx-auto p-8 px-8 rounded-lg'>
      {isLoggedIn && <Navigate to="/dashboard" replace={true} />}

      {/* add hover effect on this icon */}
      <div className='absolute top-0 right-0 m-4' onClick={handleClose}>
        <FiX />
      </div>
        
      <form className='w-full h-full flex flex-col justify-evenly' onSubmit={handleSubmit}>
        <h2 className='text-sky-900 font-bold text-center'>SIGN IN</h2>
        <div className='flex flex-col test-gray-200  py-2'>
          <label className='inputLabel'>Username</label>
          <input className='
            rounded-lg 
            bg-slate-200 
            mx-4 
            p-2 
            focus:bg-neutral-200 
            focus:outline-2 
            focus:outline-sky-600 
            hover:border-2
            hover:border-sky-600
            '
            placeholder='Confirm Password'
            type='text' 
            value={userEmail.toString()}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
        <div className='flex flex-col test-gray-200 justify-evenly py-2'>
          <label className='inputLabel'>Password</label>
          <input className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600 hover:border-solid hover:border-2 hover:border-sky-600'
            placeholder='Enter Your Password'
            type='password'
            value={userPassword.toString()}
            onChange={(e) => setUserPassword(e.target.value)} 
          />
        </div>
        <button className='w-10/12 my-3 mx-5 py-2 bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white font-semibold rounded-lg border border-transparent border-black cursor-pointer'>CONTINUE</button>
        <p className='flex justify-center mb-4 p-2'>
          Not a member?{' '}
          <button className='text-blue-500 ml-2' onClick={toggleRegister}>
            Sign up here!
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;