import React from 'react'
import Login from './Login';
import Register from './Register';
import useStore from '../store';

interface ModalProps {
  open: Boolean,
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  // import login & register toggle functions
  const { showLogin, loginToggle, showRegistration, registerToggle, } = useStore();

  // const toggleLogin = () => {
  //   loginToggle(true);
  //   registerToggle(false);
  // };

  // const toggleRegister = () => {
  //   loginToggle(false);
  //   registerToggle(true);
  // };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center text-black z-10'>
      <div onClick={(e) => {e.stopPropagation()}}>
        {showLogin && !showRegistration && <Login />}
        {!showLogin && showRegistration && <Register />}  
      </div>
    </div>
  )
}

export default Modal;