import { FC, ReactElement, FormEvent, useState } from 'react';
import useStore from '../store';
import { FiX } from 'react-icons/fi';
import '../stylesheets/index.css';
import axios from 'axios';
import notify from '../helper-functions/notify';
import { UserResponse, PartialStore } from '../../types';

const Register: FC = () : ReactElement => {
  const { 
    loginToggle, 
    registerToggle, 
    setModalOpen 
  } : PartialStore = useStore();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // close forms
  const handleClose = () : void => {
    registerToggle(false)
    loginToggle(false)
    setModalOpen(false)
  }
  
  // toggle to login form
  const toggleLogin = () : void => {
    registerToggle(false)
    loginToggle(true)
  }

  // submit user registration form
  const handleSubmit = async(e: FormEvent) : Promise<void> => {
    e.preventDefault();
    setUserEmail('');
    setUserPassword('');
    setConfirmPassword('');

    const registerUser : {
      email: string,
      password: string
    } = {
      email: userEmail,
      password: userPassword,
    }

    // check that user inputted the same password twice
    if (userPassword !== confirmPassword) {
      notify('Passwords do not match.', 'error');
      return;
    }

    // create new user if not already in database
    try {
      const response: UserResponse = (await axios.post('/api/account/register', registerUser)).data;

      if (response.userCreated) {
        setIsRegistered(true);
        notify('Account successfully created!', 'success');
        handleClose();
      } else {
        notify('Could not create account. Try again.', 'error');
        
      }
    } catch(error: unknown) {
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
        <p className='flex flex-col test-gray-200 py-2'>
          <label className='inputLabel'>Email</label>
          <input className='peer rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
            placeholder='Enter Your Email'
            type='text'
            value={userEmail.toString()}
            onChange={(e: FormEvent<HTMLInputElement>) : void => setUserEmail(e.currentTarget.value)}
          />
        </p>
        <p className='flex flex-col test-gray-200 py-2'>
          <label className='inputLabel'>Password</label>
          <input className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
            placeholder='Enter Your Password'
            type='password'
            value={userPassword.toString()}
            onChange={(e: FormEvent<HTMLInputElement>) : void => setUserPassword(e.currentTarget.value)}
          />
        </p>
        <p className='flex flex-col test-gray-200 py-2 group'>
          <label className='inputLabel'>Confirm Password</label>
          <input className='rounded-lg bg-slate-200 mx-4 p-2 focus:bg-neutral-200 focus:outline-2 focus:outline-sky-600'
            placeholder='Confirm Password'
            type='password'
            value={confirmPassword.toString()}
            onChange={(e: FormEvent<HTMLInputElement>) : void => setConfirmPassword(e.currentTarget.value)}
          />
        </p>
        <button className='w-10/12 my-3 mx-5 py-2 bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white font-semibold rounded-lg border border-transparent border-black cursor-pointer'>COMPLETE REGISTER</button>
        <p className='flex justify-center mb-4 p-2'>
          Already have an account?
          <button className='text-blue-500 ml-2' onClick={toggleLogin}>
            Login here!
          </button>    
        </p>
      </form>
    </div>

  )
}

export default Register;