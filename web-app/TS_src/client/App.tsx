import './stylesheets/App.css'
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/dashboard';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { lightBlue, deepOrange } from "@mui/material/colors";

function App() {

  return (
    <>
      <Navbar />
      <div className='AppContainer'>
      <SplashPage />
        {/* <Routes>
          <Route path='/' element={ <SplashPage /> } />
        </Routes> */}
      </div>
    </>

  )
}

export default App;
