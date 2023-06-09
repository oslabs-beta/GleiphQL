import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';
import Button from '@mui/material/Button';
import { Navigate } from 'react-router-dom';
import axios from'axios';

interface LoginResponse {
  userExists: boolean;
  signedIn: boolean;
}


const Login: React.FC<{}> = () => {
  
  const { loginToggle, registerToggle, userEmail, setUserEmail, userPassword, setUserPassword, isLoggedIn, setIsLoggedIn } = useStore();
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
        setIsLoggedIn(true);
      } else {
        alert('Please input the correct password')
      }

    } catch(error) {
      console.error(error);
      
      const typedError = error as Error;
      throw new Error(`Error in login component: ${typedError.message}`);
    }
  }

  return (
    <>
      {isLoggedIn && <Navigate to="/dashboard" replace={true} />}
      <div className="LoginContainer">
        <div className='close-icon' onClick={handleClose}>
          <CloseRoundedIcon />
        </div>
        
        <p>Inside of Login component</p>

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
              name="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)} 
            />
            <TextField 
              id="outlined-basic" 
              label="Password" 
              variant="outlined"
              type='password'
              name="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)} 
            />
          </Box>

          <Button type='submit' variant="contained">
            Sign In
          </Button>
        </form>  
        
        <br></br>
        
        <Button className='register-link' onClick={toggleRegister} variant="contained">
          Not a member? Sign up here
        </Button>

      </div>
    </>
  )
};

export default Login;