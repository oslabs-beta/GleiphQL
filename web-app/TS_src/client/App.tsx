import SplashPage from './pages/SplashPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';


function App() {

  return (
    <div className='flex flex-col min-h-screen splashpage'>
      <Navbar />
      <SplashPage />
      <Footer />
    </div>
  )
}

export default App;
