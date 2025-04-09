import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/frontoffice/navbar/navbar';
import SignIn from './components/frontoffice/signin/signin';
import SignUp from './components/frontoffice/signup/signup';
import ForgotPassword from './components/frontoffice/forgotpassword/forgotpassword';
import ResetPassword from './components/frontoffice/resetpassword/resetpassword';
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
import Chatbot from './components/frontoffice/chatbot/chatBot'; 
import ManageAdmins from './components/backoffice/ManageAdmins/ManageAdmin';
import AddCourses from './components/backoffice/Courses/AddCourses';
import CoursesAdmin from './components/backoffice/Courses/coursesAdmin';
import AuthSuccess from './components/frontoffice/signin/AuthSuccess';
import UpdateAdminPassword from './components/backoffice/ManageAdmins/updateAdminPassword';
import AddAdmin from './components/backoffice/ManageAdmins/AddAdmin';
import Avis from './components/frontoffice/noticeWebsite/noticeWebsite';
import Packs from './components/frontoffice/Packs/Packs';
import Marketplace from './components/frontoffice/Marketplace/Marketplace';
import PremiumCourses from './components/frontoffice/Marketplace/PremiumCourses';
import FreeCourses from './components/frontoffice/Marketplace/FreeCourses';
import Messenger from './components/frontoffice/messenger/messenger';
import Success from './components/frontoffice/RechargeModal/Success';
import { ThemeProvider } from "./context/ThemeContext";
import Full from './components/PersonalSpace/Full';
import Personall from './components/PersonalSpace/Personal';
import Publication from './components/frontoffice/publication/Publication';
import Profiles from './components/frontoffice/Manageprofile/AllProfiles'
import ProfileDetail from './components/frontoffice/Manageprofile/ProfileDetails'
import ExchangeRoom from './components/frontoffice/Packs/ExchangeRoom';
const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            fetch("http://localhost:3000/auth/current_user", {
                credentials: "include",
            })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                }
            })
            .catch((err) => console.error("Erreur de récupération de l'utilisateur :", err));
        }
    }, []);

    useEffect(() => {
        const checkNewPremiumCourses = async () => {
            try {
                const lastSeen = localStorage.getItem("lastSeenPremium") || new Date(0).toISOString();
                const res = await axios.get("http://localhost:3000/courses/getallcourses");
                const newPremium = res.data.find(course =>
                    course.isPremium && new Date(course.createdAt) > new Date(lastSeen)
                );

                if (newPremium) {
                    const audio = new Audio("/notif.mp3");
                    audio.play();

                    toast.info(
                        <div
                          onClick={() => {
                            localStorage.setItem("highlightedCourseId", newPremium._id); // ✅ Ajout ici
                            window.location.href = "/marketplace/premium";
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          🆕 Nouveau cours premium : <strong>{newPremium.title}</strong><br />
                          👉 Cliquez ici pour le voir
                        </div>,
                        { autoClose: 7000 }
                      );
                      
                }

                localStorage.setItem("lastSeenPremium", new Date().toISOString());
            } catch (err) {
                console.error("Erreur lors de la vérification des cours premium :", err);
            }
        };

        if (user) checkNewPremiumCourses();
    }, [user]);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData._id);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <ThemeProvider>
            <Router>
                {user?.role === 'admin' ? (
                    <AdminNavbar user={user} onLogout={handleLogout} />
                ) : (
                    <Navbar user={user} onLogout={handleLogout} />
                )}
                <Routes>
                    <Route path="/update-admin-password" element={<UpdateAdminPassword />} />
                    {user?.role === 'admin' ? (
                        <>
                            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                            <Route path="/admin/dashboard" element={<DashbordAdmin />} />
                            <Route path="/admin/manage-users" element={<ManageUsers />} />
                            <Route path="/admin/manage-admins" element={<ManageAdmins />} />
                            <Route path="/admin/add-admin" element={<AddAdmin />} />
                            <Route path="/coursesadmin" element={<CoursesAdmin />} />
                            <Route path="/add-course" element={<AddCourses />} />
                            <Route path="/room/:packId" element={<ExchangeRoom />} />

                            <Route path="/admin/settings" element={<h1>Settings Page</h1>} />
                            <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
                            
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<Home />} />
                            <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
                            <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
                            <Route path="/overview" element={<Overview />} />
                            <Route path="/Full" element={<Full />} />
                            <Route path="/Personal" element={<Personall />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/marketplace/premium" element={<PremiumCourses />} />
                            <Route path="/marketplace/free" element={<FreeCourses />} />
                            <Route path="/success" element={<Success />} />
                            <Route path="/AvisWebsite" element={<Avis />} />
                            <Route path="/profiles" element={<Profiles currentUserId={user?._id} />} />
                            <Route path="/profile/:id" element={<ProfileDetail />} />
                            <Route path="/Ourpacks" element={<Packs />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <SignIn onLogin={handleLogin} />} />
                            <Route path="/update-profile" element={user ? <UpdateProfile user={user} /> : <SignIn onLogin={handleLogin} />} />
                            <Route path="/manage-profile" element={<ManageProfile />} />
                            <Route path="/publication" element={<Publication />} />
                            <Route path="/messenger" element={<Messenger />} />
                            <Route path="/auth/success" element={<AuthSuccess />} />
                        </>
                    )}
                    <Route path="*" element={<Home />} />
                </Routes>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                <Footer />
            </Router>
        </ThemeProvider>
    );
};

export default App;