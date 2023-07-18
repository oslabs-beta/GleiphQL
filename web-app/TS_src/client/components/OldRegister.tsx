// Create a Register component hereimport React from 'react';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';
import axios from 'axios';


const OldRegister: React.FC = () => {

  const { loginToggle, registerToggle, userEmail, setUserEmail, setUserPassword, userPassword, confirmPassword, setConfirmPassword, passMatch, setPassMatch } = useStore();
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
      alert('Passwords don\'t match. Please try again.')
      return;
    }

    try {
      const response = await axios.post('/api/account/register', registerUser);

      if (response.data.userCreated) {
        setIsRegistered(true);
        alert('Account successfully created. Redirecting to login.')
      } else {
        alert('Could not create account. Try again');
        
      }
    } catch(error) {
      alert('Could not create account. Try again');
      setUserEmail('');
      setUserPassword('');
      setConfirmPassword('');

      // const typedError = error as Error;
      // throw new Error(`Error in register component: ${typedError.message}`);
    }

  }

  return (
    <div className="RegisterContainer">
      <div className='close-icon' onClick={handleClose}>
        <CloseRoundedIcon />
      </div>
      <h2>Register</h2>
      
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
        >
          <TextField 
            id="outlined-basic" 
            label="Email" 
            variant="outlined" 
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <TextField 
            id="outlined-basic" 
            label="Password" 
            variant="outlined"
            type='password'
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)} 
          />
          <TextField 
            id="outlined-basic" 
            label="Confirm Password" 
            variant="outlined"
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </Box>

        <Button sx={{margin: '10px'}} type='submit' variant="contained">Register</Button>
        
      </form>
      
      {/* <br></br> */}

      <Button sx={{margin: '10px'}} className='login-link' onClick={toggleLogin}  variant="contained">
        Already a member? Login!
      </Button>
  
    </div>
  )
};

export default OldRegister;