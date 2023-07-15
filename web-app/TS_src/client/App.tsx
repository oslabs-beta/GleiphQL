import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';


function App() {

  return (
    <div className='flex flex-col justify-center align-middle'>
      <Navbar />
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
