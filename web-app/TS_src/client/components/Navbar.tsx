import React from 'react';
import useStore from '../store';
import axios from 'axios';

// interface NavbarProps {
//   handleLoginToggle: () => void;
// }

const Navbar: React.FC<{}> = () => {
  const { loginToggle, currUser, setAnchorEl, anchorEl, isLoggedIn, setIsLoggedIn, setCurrUser, setCurrEndPoint } = useStore();

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
    <nav className='flex p-2 h-14 justify-between bg-blue-950 text-white w-full'>
      <a href='/'><h1 className='text-2xl text-white'>
        GleiphQL
      </h1></a>
      <ul>
        <li className='hidden md:inline md:p-12'>
          {currUser.email === "" ? "" : `WELCOME, ${currUser.email.split("@")[0].toUpperCase()}`}
        </li>
        { isLoggedIn? 
          <li className='inline'><button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-2 w-20' onClick={logOut}>LOGOUT</button></li> : 
          <li className='inline'><button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-2 w-20' onClick={()=>loginToggle(true)}>LOGIN</button></li>
        }
      </ul>
    </nav>
  )
};

export default Navbar;