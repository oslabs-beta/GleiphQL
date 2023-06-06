// Create a Register component hereimport React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


const Register: React.FC = () => {
  return (
    <div className="RegisterContainer">
      <p>Inside of Register component</p>
        
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
        <TextField id="outlined-basic" label="Confirm Password" variant="outlined" />
      </Box>

      <button type='submit'>Register</button>

      <p>Forgot Password?</p>

    
    </div>
  )
};

export default Register;