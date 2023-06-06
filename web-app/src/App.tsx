import './App.css'
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  // create a hook to toggle login component
  const [showLogin, setShowLogin] = useState<boolean>(false);

  // declare a function to help toggle showLogin
  const handleLoginToggle = (): void => {
    setShowLogin(!showLogin);
  };
  
  return (
    <>
      <Navbar handleLoginToggle={handleLoginToggle}/>
      <div className='AppContainer'>
        <Routes>
          <Route path='*' element={ 
            <SplashPage showLogin={showLogin} handleLoginToggle={handleLoginToggle} />
          } />
          <Route path='/' element={ 
            <SplashPage showLogin={showLogin} handleLoginToggle={handleLoginToggle} />
          } />
          <Route path='/login' element={ 
            <Login handleLoginToggle={handleLoginToggle} /> 
          } />
          <Route path="/register" element={ <Register /> } />
        </Routes>

      </div>
    </>
    
  )
}

export default App;
