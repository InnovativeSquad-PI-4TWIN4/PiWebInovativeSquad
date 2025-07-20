import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Contact from './Contact';
import About from './About';
import Home from './Home';  // This is your imported Home component

// Remove these duplicate declarations:
// const Home = () => <div className="page-content">Contenu de la page d'accueil</div>;
const Solutions = () => <div className="page-content">Contenu des solutions</div>;
const Services = () => <div className="page-content">Contenu des services</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;