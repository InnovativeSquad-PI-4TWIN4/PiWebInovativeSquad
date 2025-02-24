import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import './SignUp.scss';

const SignUp = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [Skill, setSkill] = useState('');
  const [image, setImage] = useState(null); // État pour l'image
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Créer une instance de FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('Skill', Skill);

    // Si une image est sélectionnée, on l'ajoute au FormData
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:3000/users/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Supposons que l'API retourne un token après l'inscription
      if (response.data.status) {
        localStorage.setItem('token', response.data.token);
        navigate('/signin');
      } else {
        setError('Signup failed, please try again.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during sign-up.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
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
          <input
            type="date"
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Skill"
            value={Skill}
            onChange={(e) => setSkill(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => setImage(e.target.files[0])} // Mettre à jour l'état image
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
