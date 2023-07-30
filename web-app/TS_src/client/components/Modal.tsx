import { FC, ReactElement, MouseEvent } from 'react'
import Login from './Login';
import Register from './Register';
import useStore from '../store';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

interface PartialStore {
  showLogin: boolean,
  showRegistration: boolean
}

const Modal: FC<ModalProps> = ({ open, onClose } : ModalProps) : ReactElement | null => {
  if (!open) return null;

  const { showLogin, showRegistration } : PartialStore = useStore();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center text-black z-10'>
      <div onClick={(e: MouseEvent<HTMLElement>) : void => {e.stopPropagation()}}>
        {showLogin && !showRegistration && <Login />}
        {!showLogin && showRegistration && <Register />}  
      </div>
    </div>
  )
}

export default Modal;