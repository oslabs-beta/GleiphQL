import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const Login: React.FC = () => {
  return (
    <div className="LoginContainer">
      <p>Inside of Login component</p>
      <form>
        
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="Email" variant="outlined" />
          
        </Box>

        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="Password" variant="outlined" />
          
        </Box>

        <button type='submit'>Sign In</button>
        <br></br>

        <Link to='/register'>Not a member? Sign up here</Link>

      </form>
    </div>
  )
};

export default Login;