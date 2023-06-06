import React, { useState, useEffect } from 'react';
import useStore from '../store';

// interface NavbarProps {
//   handleLoginToggle: () => void;
// }

const Navbar: React.FC<{}> = () => {
  const { loginToggle } = useStore();
  

  return (
    <div className='navbar-container'>
      <div className='login-btn' onClick={loginToggle}>
        Login / Sign Up
      </div>
    </div>
  )
};

export default Navbar;