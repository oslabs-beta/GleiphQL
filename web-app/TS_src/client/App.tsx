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
          {/* Ask Yeong Jiecheng readability on react router setups */}
          {/* <Route path='/dashboard' element={ <Dashboard /> } /> */}
        </Routes>
      </div>
    </>

  )
}

export default App;
