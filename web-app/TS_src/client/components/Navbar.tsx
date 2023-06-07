import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import useStore from '../store';

// interface NavbarProps {
//   handleLoginToggle: () => void;
// }

const Navbar: React.FC<{}> = () => {
  const { loginToggle } = useStore();
  

  return (
    <div className='navbar-container'>
      <Button variant="contained" onClick={()=>loginToggle(true)}>
        Login
      </Button>
    </div>
  )
};

export default Navbar;