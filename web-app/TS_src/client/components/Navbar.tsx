import React from 'react';
import useStore from '../store';
import axios from 'axios';
import Modal from './Modal';

// interface NavbarProps {
//   handleLoginToggle: () => void;
// }

const Navbar: React.FC<{}> = () => {
  const { loginToggle, currUser, setAnchorEl, anchorEl, isLoggedIn, setIsLoggedIn, setCurrUser, setCurrEndPoint, modalOpen, setModalOpen, showLogin } = useStore();

  const logOut = async() => {
    setCurrUser(0, '');
    setCurrEndPoint(0, '');
    setIsLoggedIn(false);
    await axios.post('/api/account/logout');
  }

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className='flex items-center sticky top-0 p-2 h-14 justify-between bg-blue-950 text-white w-screen'>
      <a href='/' className='ml-5'>
        <h1 className='text-2xl text-white'>
          GleiphQL
        </h1>
      </a>
      <nav className='mr-5'>
        <span className='hidden md:inline md:p-5'>
            {currUser.email === "" ? "" : `WELCOME, ${currUser.email.split("@")[0].toUpperCase()}`}
        </span>
        { isLoggedIn? 
          <button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-2 w-20' onClick={logOut}>LOGOUT</button> : 
          <button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-2 w-20' onClick={()=> {
            setModalOpen(true)
            loginToggle(true)
          }}>LOGIN</button>
        }
        <Modal  open={modalOpen} onClose={() => setModalOpen(false)} />
      </nav>
    </header>
  )
};


export default Navbar;