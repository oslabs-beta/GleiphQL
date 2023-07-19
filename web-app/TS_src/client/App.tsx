import SplashPage from './pages/SplashPage';
// import Navbar from './components/Navbar';
import NewNavbar from './components/NewNavbar';


function App() {

  return (
    <div className='flex flex-col justify-center align-middle'>
      {/* <Navbar /> */}
      <NewNavbar />
      <div className='AppContainer'>

      <SplashPage />
        {/* <Routes>
          <Route path='/' element={ <SplashPage /> } />
        </Routes> */}
      </div>
    </div>

  )
}

export default App;
