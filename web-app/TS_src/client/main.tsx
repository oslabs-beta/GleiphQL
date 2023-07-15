import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './stylesheets/App.css'

import {
  createBrowserRouter,
  RouterProvider,
  BrowserRouter
} from "react-router-dom";
import ErrorPage from './pages/error-page';
import Dashboard from './pages/dashboard';

// this placeholder for only router we need in whole application
{/* Ask Yeong Jiecheng readability on react router setups */}
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
