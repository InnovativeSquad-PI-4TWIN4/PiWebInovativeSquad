import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.scss';
import { FcGoogle } from 'react-icons/fc';

const SignIn = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/users/signin', { email, password });

            if (response.data.token && response.data.user) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin(response.data.user);
                if (response.data.user.role === 'admin') 
                navigate('/dashbordAdmin');
                else navigate ('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during sign-in.');
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = 'http://localhost:3000/auth/google/callback';
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2>Sign In</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSignIn}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Sign In</button>
                </form>
                <p>
    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
</p>
<p>
    Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
</p>
<button className="google-btn" onClick={handleGoogleSignIn}>
    <FcGoogle className="google-icon" /> Sign In With Google
</button>

            </div>
        </div>
    );
};

export default SignIn;
