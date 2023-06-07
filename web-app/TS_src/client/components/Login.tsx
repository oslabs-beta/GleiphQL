import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';
import Button from '@mui/material/Button';


const Login: React.FC<{}> = () => {
  
  const { loginToggle, registerToggle } = useStore();
  // create function to toggle both components
  const handleClose = () => {
    loginToggle(false);
    registerToggle(false);
  }
  const toggleRegister = () => {
    loginToggle(false);
    registerToggle(true);
  }


  return (
    <>
      <div className="LoginContainer">
        <div className='close-icon' onClick={handleClose}>
          <CloseRoundedIcon />
        </div>
        
        <p>Inside of Login component</p>
          
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="Email" variant="outlined" />
          <TextField id="outlined-basic" label="Password" variant="outlined" />
        </Box>

        <Button type='submit' variant="contained">
          Sign In
        </Button>

        <br></br>
        
        <Button className='register-link' onClick={toggleRegister} variant="contained">
          Not a member? Sign up here
        </Button>

      </div>
    </>
  )
};

export default Login;