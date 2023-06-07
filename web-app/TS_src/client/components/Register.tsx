// Create a Register component hereimport React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useStore from '../store';


const Register: React.FC = () => {

  const { loginToggle, registerToggle, showLogin, showRegistration } = useStore();
  
  const handleClose = () => {
    registerToggle(false)
    loginToggle(false)
  }
  const toggleLogin = () => {
    registerToggle(false)
    loginToggle(true)
  }

  return (
    <div className="RegisterContainer">

        <div className='close-icon' onClick={handleClose}>
          <CloseRoundedIcon />
        </div>

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
        
        <Button variant="contained">Register</Button>
        
        <Button className='login-link' onClick={toggleLogin}  variant="contained">
          Already a member? Login!
        </Button>
      </Box>
  
    </div>
  )
};

export default Register;