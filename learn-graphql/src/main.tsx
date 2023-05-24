import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <h1>Header from main.tsx file: </h1>
    <App />
  </React.StrictMode>,
)
