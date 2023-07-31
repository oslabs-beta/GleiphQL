import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { FiX } from 'react-icons/fi';
import '../stylesheets/index.css';
import axios from 'axios';
import notify from '../helper-functions/notify';

const Register: React.FC<{}> = () => {
  const { loginToggle, registerToggle, userEmail, setUserEmail, setUserPassword, userPassword, confirmPassword, setConfirmPassword, passMatch, setPassMatch, setModalOpen } = useStore();
  const [isRegistered, setIsRegistered] = useState(false);


  useEffect(() => {
    if(isRegistered) {
      registerToggle(false);
      loginToggle(false);
    }
  }, [isRegistered]);

  const handleClose = () => {
    registerToggle(false)
    loginToggle(false)
    setModalOpen(false)
  }
  const toggleLogin = () => {
    registerToggle(false)
    loginToggle(true)
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setUserEmail('');
    setUserPassword('');
    setConfirmPassword('');

    const registerUser = {
      email: userEmail,
      password: userPassword,
    }

    //conditional to check passwords match
    if (userPassword !== confirmPassword) {
      notify('Passwords do not match.', 'error');
      return;
    }


    try {
      const response = await axios.post('/api/account/register', registerUser);

      if (response.data.userCreated) {
        setIsRegistered(true);
        notify('Account successfully created!', 'success');
        handleClose();
      } else {
        notify('Could not create account. Try again.', 'error');
        
      }
    } catch(error) {
      notify('Could not create account. Try again.', 'error');
    }

  }


  return (
    <div className='relative border-4 border-neutral-800 bg-stone-100 w-[450px] h-[520px] max-w-[450px] mx-auto p-8 px-8 rounded-lg'>
        <div className='absolute top-0 right-0 m-4' onClick={handleClose}>
          <FiX />
        </div>

        <form className='w-full flex flex-col justify-center' onSubmit={handleSubmit}>
          
          <h2 className='text-sky-900 font-bold text-center'>Almost there!</h2>
          <p className='text-center'>Create an account to enjoy Gleiph QL</p>
          
          <div className='flex flex-col test-gray-200 py-2'>
            <label className='inputLabel'>Email</label>
            <input
              data-cy='register-username'
              className='peer rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
              placeholder='Enter Your Email'
              type='text'
              value={userEmail.toString()}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          <div className='flex flex-col test-gray-200 py-2'>
            <label className='inputLabel'>Password</label>
            <input
              data-cy='register-password'
              className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
              placeholder='Enter Your Password'
              type='password'
              value={userPassword.toString()}
              onChange={(e) => setUserPassword(e.target.value)}
            />
          </div>

          <div className='flex flex-col test-gray-200 py-2 group'>
            <label className='inputLabel'>Confirm Password</label>
            <input
              data-cy='register-confirm-password'
              className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
              placeholder='Confirm Password'
              type='password'
              value={confirmPassword.toString()}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            data-cy='register-submit'
            className='w-10/12 my-3 mx-5 py-2 bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white font-semibold rounded-lg border border-transparent border-black cursor-pointer'
          >COMPLETE REGISTER</button>

          <p className='flex justify-center mb-4 p-2'>
            Already have an account?{' '}
            <button className='text-blue-500 ml-2' onClick={toggleLogin}>
            Login here!
            </button>    
          </p>
        </form>
      </div>

  )
}

export default Register;