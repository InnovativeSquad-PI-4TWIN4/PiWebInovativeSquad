import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/frontoffice/navbar/navbar';
import SignIn from './components/frontoffice/signin/signin';
import SignUp from './components/frontoffice/signup/signup';
import ForgotPassword from './components/frontoffice/forgotpassword/forgotpassword';
import ResetPassword from './components/frontoffice/resetpassword/resetpassword';
import Courses from './components/frontoffice/courses/courses';
import Contact from './components/frontoffice/contact/contact';
import Footer from './components/frontoffice/footer/footer';
import DashbordAdmin from './components/backoffice/dashbordAdmin/dashbordAdmin';
import Home from './components/frontoffice/home/home';
import Profile from './components/frontoffice/profile/profile';
import UpdateProfile from './components/frontoffice/updateprofile/updateprofile';
import ManageProfile from './components/frontoffice/Manageprofile/ManageProfile';
import ManageUsers from './components/backoffice/ManageUsers/ManageUsers';
import AdminNavbar from './components/backoffice/Adminnavbar/adminnavbar';
import './index.css';
import Overview from './components/frontoffice/OverView/overview';
import Chatbot from './components/frontoffice/chatbot/chatBot'; // Corrected import
import ManageAdmins from './components/backoffice/ManageAdmins/ManageAdmin';
import Coursesadmin from './components/backoffice/Courses/coursesAdmin';
import AddCourses from './components/backoffice/Courses/AddCourses';
import AuthSuccess from './components/frontoffice/signin/AuthSuccess';

const App = () => {
    const [user, setUser] = useState(null);

    // 🔹 Vérifie si un utilisateur est déjà authentifié (OAuth inclus)
    useEffect(() => {
        fetch("http://localhost:3000/auth/current_user", {
            credentials: "include",
        })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.id) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data)); // Stocker l'utilisateur en local
            }
        })
        .catch((err) => console.error("Erreur de récupération de l'utilisateur :", err));
    }, []);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            {user?.role === 'admin' ? (
                <AdminNavbar user={user} onLogout={handleLogout} />
            ) : (
                <Navbar user={user} onLogout={handleLogout} />
            )}
            <Routes>
                {/* REDIRECTION AUTOMATIQUE SI ADMIN */}
                {user?.role === 'admin' ? (
                    <>
                        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="/admin/dashboard" element={<DashbordAdmin />} />
                        <Route path="/admin/manage-users" element={<ManageUsers />} />
                        <Route path="/admin/manage-admins" element={<ManageAdmins />} />
                        <Route path="/coursesadmin" element={<Coursesadmin />} />
                        <Route path="/add-course" element={<AddCourses />} />
                        <Route path="/admin/settings" element={<h1>Settings Page</h1>} />
                    </>
                ) : (
                    <>
                        {/* FRONT-OFFICE ROUTES */}
                        <Route path="/" element={<Home />} />
                        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
                        <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
                        <Route path="/overview" element={<Overview />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <SignIn onLogin={handleLogin} />} />
                        <Route path="/update-profile" element={user ? <UpdateProfile user={user} /> : <SignIn onLogin={handleLogin} />} />
                        <Route path="/manage-profile" element={<ManageProfile />} />
                          {/* ROUTE FACEBOOK LOGIN */}
                          <Route path="/auth/success" element={<AuthSuccess />} />

                        
                    </>
                )}

                {/* REDIRECTION PAR DÉFAUT */}
                <Route path="*" element={<Home />} />
            </Routes>
            <Footer />
            {/* <Chatbot /> */}
        </Router>
    );
};

export default App;
