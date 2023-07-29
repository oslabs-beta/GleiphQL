import React, { useState } from 'react';
import useStore from '../store';
import axios from 'axios';
import Modal from './Modal';
import { Link, Element } from 'react-scroll';

// interface NavbarProps {
//   handleLoginToggle: () => void;
// }

const Navbar: React.FC<{}> = () => {
  const { loginToggle, currUser, setAnchorEl, anchorEl, isLoggedIn, setIsLoggedIn, setCurrUser, setCurrEndPoint, modalOpen, setModalOpen, showLogin } = useStore();

  // hook to keep tract of active nav section
  const [activeSection, setActiveSection] = useState<string>('intro');

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
    <header className='flex items-center sticky top-0 p-2 h-14 bg-blue-950 text-white w-screen z-50'>
      
        <h1 className='text-2xl text-white ml-5'>
          <Link 
            to='intro' 
            spy={true} 
            smooth={true} 
            offset={-100} 
            duration={500} 
            activeClass='nav-active' 
            onClick={() => setActiveSection('intro')}
          >
            GleiphQL
          </Link>
        </h1>

      <section id='nav-btns' className='flex flex-row flex-grow justify-end'>
        <ul className='flex space-x-4 mr-1'>
          {/* Conditionally render the list items only if the user is not logged in */}
          {!isLoggedIn && (
            <>
              <li>
                <Link 
                  to='features' 
                  spy={true} 
                  smooth={true} 
                  offset={-50} 
                  duration={500}
                  activeClass='nav-active' 
                  onClick={() => setActiveSection('features')}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to='get-started' 
                  spy={true} 
                  smooth={true} 
                  offset={30} 
                  duration={500}
                  activeClass='nav-active' 
                  onClick={() => setActiveSection('get-started')}
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link 
                  to='meet-team' 
                  spy={true} 
                  smooth={true} 
                  offset={30} 
                  duration={500}
                  activeClass='nav-active' 
                  onClick={() => setActiveSection('meet-team')}
                >
                  Our Team
                </Link>
              </li>
            </>
          )}
          
        </ul>
      </section>

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