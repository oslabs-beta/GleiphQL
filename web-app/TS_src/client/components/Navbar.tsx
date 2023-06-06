import React, { useState, useEffect } from 'react';

interface NavbarProps {
  handleLoginToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleLoginToggle }) => {
  return (
    <div className='navbar-container'>
      <div className='login-btn' onClick={handleLoginToggle}>
        Login / Sign Up
      </div>
    </div>
  )
};

export default Navbar;