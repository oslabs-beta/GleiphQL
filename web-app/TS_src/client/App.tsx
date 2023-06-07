import './App.css'
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/dashboard';

function App() {
  
  return (
    <>
      <Navbar />
      <div className='AppContainer'>
        <Routes>
          <Route path='/' element={ <SplashPage /> } />
        </Routes>
      </div>
    </>
    
  )
}

export default App;
