import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './stylesheets/index.css'
import {
  createBrowserRouter,
  RouterProvider,
  BrowserRouter
} from "react-router-dom";
import ErrorPage from './pages/error-page.js';
import Dashboard from './pages/dashboard.js';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { lightBlue, deepOrange } from "@mui/material/colors";

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

const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  palette: {
    mode: "light",
    primary: {
      main: "#003366",
    },
    background: {
      default: "#edf3fa",
    },
    secondary: {
      main: "#edf2ff"
    },
    error: {
      main: deepOrange[500],
    },
  },
})


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
