import { FC, ReactElement, FormEvent, useEffect, useState } from 'react';
import useStore from '../store';
import { Navigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import checkSession from '../helper-functions/checkSession';
import notify from '../helper-functions/notify';
import {
  SetStatusFx,
  SetNumAndStrFx,
  UserResponse
} from '../types';

interface PartialStore {
  loginToggle: SetStatusFx;
  registerToggle: SetStatusFx;
  isLoggedIn: boolean;
  setIsLoggedIn: SetStatusFx;
  setCurrUser: SetNumAndStrFx;
  setModalOpen: SetStatusFx;
}

const Login: FC = () : ReactElement => {
  const { 
    loginToggle, 
    registerToggle, 
    isLoggedIn, 
    setIsLoggedIn, 
    setCurrUser, 
    setModalOpen 
  } : PartialStore = useStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');

  // check if there is an active session
  useEffect(() : void => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
  }, []);

  // to toggle register and login components
  const handleClose = () : void => {
    loginToggle(false);
    registerToggle(false);
    setModalOpen(false);
  }

  const toggleRegister = () : void => {
    loginToggle(false);
    registerToggle(true);
  }

  // to handle submission for user credentials
  const handleSubmit = async (e: FormEvent) : Promise<void> => {
    e.preventDefault();
    
    // reset input in form
    setUserEmail('');
    setUserPassword('');

    const userLogin : {
      email: string,
      password: string
    } = {
      email: userEmail,
      password: userPassword
    }

    // verify user credentials for login
    try {
      const response: UserResponse = (await axios.post('/api/account/login', userLogin)).data;

      if (response.signedIn) {
        setCurrUser(response.userId||0, response.userEmail||'');
        setIsLoggedIn(true);
        notify('Login successful!', 'success');
      } 
    } catch(error: unknown) {
      notify('Login unsuccessful. Try again.', 'error');
      setCurrUser(0, '');
      setIsLoggedIn(false);
    }
  }

  if(isLoading) return <div>Loading...</div>;

  return (
    <div className='relative border-4 border-neutral-800 bg-stone-100 w-[450px] h-[520px] max-w-[450px]  mx-auto p-8 px-8 rounded-lg'>
      {isLoggedIn && <Navigate to="/dashboard" replace={true} />}

      <div className='absolute top-0 right-0 m-4' onClick={handleClose}>
        <FiX />
      </div>
        
      <form className='w-full h-full flex flex-col justify-evenly' onSubmit={handleSubmit}>
        <h2 className='text-sky-900 font-bold text-center'>SIGN IN</h2>
        <p className='flex flex-col test-gray-200  py-2'>
          <label className='inputLabel'>Username</label>
          <input className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
            placeholder='Enter Your Username'
            type='text' 
            value={userEmail.toString()}
            onChange={(e: FormEvent<HTMLInputElement>) : void => setUserEmail(e.currentTarget.value)}
          />
        </p>
        <p className='flex flex-col test-gray-200 justify-evenly py-2'>
          <label className='inputLabel'>Password</label>
          <input className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
            placeholder='Enter Your Password'
            type='password'
            value={userPassword.toString()}
            onChange={(e: FormEvent<HTMLInputElement>) : void => setUserPassword(e.currentTarget.value)} 
          />
        </p>
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