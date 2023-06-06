import './App.css'
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  
  return (
    <>
      <Navbar />
      <div className='AppContainer'>
        <Routes>
          <Route path='*' element={ 
            <SplashPage />
          } />
          <Route path='/' element={ 
            <SplashPage />
          } />
          <Route path='/login' element={ 
            <Login /> 
          } />
          <Route path="/register" element={ <Register /> } />
        </Routes>

      </div>
    </>
    
  )
}

export default App;
