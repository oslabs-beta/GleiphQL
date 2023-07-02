import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';


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
