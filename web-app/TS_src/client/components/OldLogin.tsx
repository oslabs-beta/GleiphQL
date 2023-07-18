import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';
import Button from '@mui/material/Button';
import { Navigate } from 'react-router-dom';
import axios from'axios';
import checkSession from '../helper-functions/checkSession';


interface LoginResponse {
  signedIn: boolean;
  userId?: number;
  userEmail?: string;
}

const Login: React.FC<{}> = () => {
  
  const { loginToggle, registerToggle, userEmail, setUserEmail, userPassword, setUserPassword, isLoggedIn, setIsLoggedIn, setCurrUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession(setIsLoggedIn, setCurrUser, setIsLoading);
  }, []);

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

    setUserEmail('');
    setUserPassword('');

    const userLogin = {
      email: userEmail,
      password: userPassword
    }

    try {
      const response = await axios.post<LoginResponse>('api/account/login', userLogin);

      if (response.data.signedIn) {
        setCurrUser(response.data.userId||0, response.data.userEmail||'');
        setIsLoggedIn(true);
      } 
    } catch(error) {
      alert('Unsuccesful Login Attempt');
      // const typedError = error as Error;
      // throw new Error(`Error in login component: ${typedError.message}`);
    }

  }

  if(isLoading) return <div>Loading...</div>;
  return (
    <>
      {isLoggedIn && <Navigate to="/dashboard" replace={true} />}
      <div className="LoginContainer">
        <div className='close-icon' onClick={handleClose}>
          <CloseRoundedIcon />
        </div>
        
        <h2>Login</h2>

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

          <Button sx={{margin: '10px'}} type='submit' variant="contained">
            Sign In
          </Button>
        </form>  
        
        {/* <br></br> */}
        
        <Button sx={{margin: '10px'}} onClick={toggleRegister} variant="contained">
          Not a member? Sign up here
        </Button>

      </div>
    </>
  )
};

export default Login;