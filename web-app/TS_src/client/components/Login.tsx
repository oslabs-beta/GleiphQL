import React from 'react';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';


const Login: React.FC<{}> = () => {
  const { loginToggle } = useStore();

  return (
    <>
      <div className="LoginContainer">
        <div className='close-icon' onClick={loginToggle}>
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

        <button type='submit'>Sign In</button>
        <br></br>

        <Link href="#" onClick={loginToggle}>Not a member? Sign up here</Link>

      </div>
    </>
  )
};

export default Login;