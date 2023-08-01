import { FC, ReactElement, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useStore from '../store';
import axios from 'axios';
import Modal from './Modal';
import { Link } from 'react-scroll';
import { PartialStore } from '../../types';

interface Content {
  name: string;
  offset: number;
}

const navigation: Content[] = [
  { name: 'features', offset: -50 },
  { name: 'get-started', offset: 30 },
  { name: 'meet-team', offset: 30 },
]

const Navbar: FC = () : ReactElement => {
  const { 
    loginToggle, 
    currUser, 
    isLoggedIn, 
    setIsLoggedIn, 
    setCurrUser, 
    setCurrEndpoint, 
    modalOpen, 
    setModalOpen, 
    connection 
  } : PartialStore = useStore();

  // keep track of active nav section
  const [activeSection, setActiveSection] = useState<string>('intro');

  // log out upon click
  const logOut = async() : Promise<void> => {
    // resetting user info
    setCurrUser(0, '');
    setCurrEndpoint(0, '');
    setIsLoggedIn(false);
    // end connection with Websocket Server
    if(connection) connection();

    await axios.post('/api/account/logout');
  }

  return (
    <Disclosure as='nav' className='w-screen bg-blue-950 text-white z-[1036] sticky top-0 z-[1035]'>
      {({ open }) => (
        <>
          <div className='mx-auto px-2 sm:px-6 lg:px-8'>
            <div className='relative flex h-16 items-center justify-between'>
              { !isLoggedIn && <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                  <Disclosure.Button className='relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                    <span className='absolute -inset-0.5' />
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
                    )  : (
                      <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
                    )}
                  </Disclosure.Button>
                </div>
              }
              <div id='nav-btns' className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
                <h1 className='text-2xl text-white flex flex-shrink-0 items-center'>
                  <Link
                    to='intro' 
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    activeClass='nav-active' 
                    onClick={() : void => setActiveSection('intro')}
                  >
                    GleiphQL
                  </Link>
                </h1>
                <div className='hidden sm:ml-6 sm:block'>
                  {/* Conditionally render the list items only if the user is not logged in */}
                  <ul className='flex space-x-3'>
                    {!isLoggedIn && navigation.map((content: Content) : ReactElement => (
                      <li key={content.name}>
                        <Link 
                          to={content.name}
                          spy={true} 
                          smooth={true} 
                          offset={content.offset} 
                          duration={500}
                          activeClass='nav-active' 
                          onClick={() : void => setActiveSection(content.name)}
                        >
                          {content.name.split('-').join(' ').toUpperCase()}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='absolute right-0 origin-top-right'>
                  <span className='hidden md:inline md:pr-5'>
                    {currUser.userEmail === '' ? '' : `WELCOME, ${currUser.userEmail.split('@')[0].toUpperCase()}`}
                  </span>
                  { isLoggedIn? 
                    <button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-1 w-20' onClick={logOut}>LOGOUT</button> : 
                    <button className='rounded-md border bg-white text-blue-950 hover:bg-slate-200 font-semibold p-1 w-20' onClick={() : void => {
                      setModalOpen(true)
                      loginToggle(true)
                    }}>LOGIN</button>
                  }
                  <Modal  open={modalOpen} onClose={() : void => setModalOpen(false)} />
                </div>
              </div>
            </div>
          </div>
          <Disclosure.Panel className='sm:hidden'>
            <ul className='space-y-1 px-2 pb-3 pt-2'>
              {navigation.map((content: Content) : ReactElement => (
                <li key={content.name}>
                  <Link 
                    to={content.name}
                    spy={true} 
                    smooth={true} 
                    offset={content.offset} 
                    duration={500}
                    activeClass='nav-active' 
                    onClick={() : void => setActiveSection(content.name)}
                  >
                    {content.name.split('-').join(' ').toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>      
)};


export default Navbar;