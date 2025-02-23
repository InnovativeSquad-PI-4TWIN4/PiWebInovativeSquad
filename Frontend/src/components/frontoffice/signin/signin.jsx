import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.scss';
import '../styles/SignIn.scss';
import { FcGoogle } from 'react-icons/fc';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/users/signin', {
        email,
        password
      });
  
      // Supposons que l'API retourne un token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user.role === "admin") {
          navigate("/dashbordAdmin");  
        } else {
          navigate("/");  
        }
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during sign-in.');
    }
  };
  const handleGoogleSignIn = async () => {
    window.location.href = "http://localhost:3000/auth/google/callback";
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
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
        <button className="google-btn" onClick={handleGoogleSignIn} >
          <FcGoogle className="google-icon" /> Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;
