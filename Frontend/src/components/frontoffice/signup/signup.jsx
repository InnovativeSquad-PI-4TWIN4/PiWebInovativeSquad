import React, { useState,useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import './SignUp.scss';

const SignUp = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [skill, setSkill] = useState('');
  const [image, setImage] = useState(null);
  
  const [capturedImage, setCapturedImage] = useState(null);

  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

 // Vérification si une image est téléchargée ou capturée avant de soumettre
 if (!image && !capturedImage) {
  setError('Please upload or capture an image before signing up.');
  return;
}

    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('Skill', skill);

   
    if (image) {
      formData.append('image', image);
    } else if (capturedImage) {
      formData.append('image', capturedImage);
    }

    // Affichez les données pour vérifier
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Arrêter la caméra avant d'envoyer le formulaire
    stopCamera();


    try {
      const response = await axios.post('http://localhost:3000/users/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setCapturedImage(null); // Réinitialiser l'image capturée
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setError('Error accessing the camera.');
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setCapturedImage(file);
        setImage(file); // Mettre à jour l'image pour l'envoi
  
        // Simuler un FileList pour l'input file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById('fileInput').files = dataTransfer.files;
      }, 'image/jpeg');
  
      stopCamera(); // Arrêter la caméra après la capture
    }
  };
  



  const handleGoogleSignIn = () => {
    console.log('Google Sign In Clicked');
    // Ajouter ici la logique de connexion avec Google
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook Sign In Clicked');
    // Ajouter ici la logique de connexion avec Facebook
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <input type="text" placeholder="First Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Last Name" value={surname} onChange={(e) => setSurname(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="date" placeholder="Date of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          <input type="text" placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} required />
          {/* <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setImage(e.target.files[0])} /> */}
          <input
  id="fileInput"
  type="file"
  accept="image/png, image/jpeg, image/jpg"
  onChange={handleImageUpload}
/>

          {image && <img src={URL.createObjectURL(image)} alt="Selected" className="preview-image" />}
          {capturedImage && <img src={URL.createObjectURL(capturedImage)} alt="Captured" className="preview-image" />}

          <button type="button" onClick={openCamera}>📷 Ouvrir la Caméra</button>
          {videoRef.current && videoRef.current.srcObject && (
            <button type="button" onClick={stopCamera}>❌ Fermer la Caméra</button>
          )}
          <video ref={videoRef} autoPlay className="camera-view"></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <button type="button" onClick={capturePhoto}>📸 Prendre une photo</button>

          <button type="submit">Sign Up</button>
        </form>

        

        <p>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
        <button className="google-btn" onClick={handleGoogleSignIn}>
          <FcGoogle className="google-icon" /> Sign Up With Google
        </button>

        {/* <button className="facebook-btn" onClick={handleFacebookSignIn}>
          <FaFacebook className="facebook-icon" /> Sign In With Facebook
        </button> */}
      </div>
    </div>
  );
};

export default SignUp;
