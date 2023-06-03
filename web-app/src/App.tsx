import './App.css'
//import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  

  return (
    <>
      <div className='AppContainer'>
        <div className='header-container'>
          <h1>Do we need a header?</h1>
        </div>

        <h1>Hello World</h1>

        <Routes>
          <Route path='*' element={ <Login />} />
          <Route path='/login' element={ <Login /> } />
          <Route path="/register" element={ <Register /> } />
        </Routes>

        
      </div>
    </>
    
  )
}

export default App;
