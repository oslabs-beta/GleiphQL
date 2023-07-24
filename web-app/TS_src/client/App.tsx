import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';


function App() {

  return (
    <div className='flex flex-col justify-center align-middle splashpage'>
      <Navbar />
      <SplashPage />
        {/* <Routes>
          <Route path='/' element={ <SplashPage /> } />
        </Routes> */}
      <Footer />
    </div>
  )
}

export default App;
