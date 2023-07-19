import React from 'react';
import Modal from './Modal';
import useStore from '../store';

const NewNavbar: React.FC<{}> = () => {

  const { loginToggle, modalOpen, setModalOpen } = useStore();

  return (
    <div>
      <div className='grid justify-items-end rounded-lg'>
        <button className='text-white bg-blue-950 hover:bg-blue-800 focus:outline-none font-medium text-sm rounded-lg px-5 py-2.5 text-center m-5' onClick={() => {
          setModalOpen(true)
        }}>Modal Login</button>
        <Modal open={modalOpen} onClose={()=> setModalOpen(false)}/>
      </div>
    </div>
  )
}

export default NewNavbar;