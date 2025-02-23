import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/frontoffice/navbar/navbar';
import SignIn from './components/frontoffice/signin/signin';
import SignUp from './components/frontoffice/signup/signup';
import Courses from './components/frontoffice/courses/courses';
import Contact from './components/frontoffice/contact/contact';
import Footer from './components/frontoffice/footer/footer';
import DashbordAdmin from './components/backoffice/dashbordAdmin';
import Home from './components/frontoffice/home/home';
import Profile from './components/frontoffice/profile/profile';

import './index.css';

const App = () => {
    const [user, setUser] = useState(null);

    // Vérification du token JWT et récupération des données utilisateur
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (token && storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Gestion de la connexion
    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Gestion de la déconnexion
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashbordAdmin" element={user?.role === 'admin' ? <DashbordAdmin /> : <Home />} />
                <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <SignIn onLogin={handleLogin} />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
