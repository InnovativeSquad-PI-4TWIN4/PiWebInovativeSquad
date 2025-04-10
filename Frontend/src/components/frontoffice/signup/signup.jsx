import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import './SignUp.scss';

const recommendedSkills = ["JavaScript", "Java", "Python", "Git", "React", "Node.js", "Spring Boot", "SQL"];

const SignUp = () => {
  const [formState, setFormState] = useState({
    name: '', surname: '', email: '', password: '', dateOfBirth: '',
    skills: [], otherSkill: '', useOther: false,
  });
  const [image, setImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (field) => (e) => {
    setFormState({ ...formState, [field]: e.target.value });
  };

  const toggleSkill = (skill) => {
    const updatedSkills = formState.skills.includes(skill)
      ? formState.skills.filter(s => s !== skill)
      : [...formState.skills, skill];
    setFormState({ ...formState, skills: updatedSkills });
  };

  const handleRecaptchaChange = (token) => setRecaptchaToken(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !capturedImage) return setError("Please upload or capture an image.");
    if (!recaptchaToken) return setError("Please complete the reCAPTCHA.");

    let finalSkills = [...formState.skills];
    if (formState.useOther && formState.otherSkill.trim() !== '') {
      if (!finalSkills.includes(formState.otherSkill.trim())) {
        finalSkills.push(formState.otherSkill.trim());
      }
    }

    if (finalSkills.length === 0)
      return setError("Please select or enter at least one skill.");

    const formData = new FormData();
    formData.append("Skill", finalSkills.join(", "));
    formData.append("name", formState.name);
    formData.append("surname", formState.surname);
    formData.append("email", formState.email);
    formData.append("password", formState.password);
    formData.append("dateOfBirth", formState.dateOfBirth);
    formData.append("recaptchaToken", recaptchaToken);

    if (image) formData.append("image", image);
    else if (capturedImage) formData.append("image", capturedImage);

    try {
      const res = await axios.post('http://localhost:3000/users/signup', formData);
      localStorage.setItem("token", res.data.token);
      navigate('/signin');
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setCapturedImage(null);
    }
  };

  const openCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
        setCapturedImage(file);
        setImage(file);
      });
      stopCamera();
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="First Name" value={formState.name} onChange={handleChange("name")} required />
          <input type="text" placeholder="Last Name" value={formState.surname} onChange={handleChange("surname")} required />
          <input type="email" placeholder="Email" value={formState.email} onChange={handleChange("email")} required />
          <input type="password" placeholder="Password" value={formState.password} onChange={handleChange("password")} required />
          <input type="date" value={formState.dateOfBirth} onChange={handleChange("dateOfBirth")} required />

          <div className="skills-section">
            <p>Choose your skills:</p>
            <div className="skills-grid">
              {recommendedSkills.map((skill) => (
                <label key={skill} className={`skill-option ${formState.skills.includes(skill) ? "selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={formState.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
              <label className="skill-option">
                <input
                  type="checkbox"
                  checked={formState.useOther}
                  onChange={() => setFormState({ ...formState, useOther: !formState.useOther })}
                />
                Autres
              </label>
            </div>
            {formState.useOther && (
  <input
    type="text"
    placeholder="Enter your skill and press Enter"
    value={formState.otherSkill}
    onChange={(e) =>
      setFormState((prev) => ({
        ...prev,
        otherSkill: e.target.value,
      }))
    }
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmedSkill = formState.otherSkill.trim();
        if (trimmedSkill && !formState.skills.includes(trimmedSkill)) {
          setFormState((prev) => ({
            ...prev,
            skills: [...prev.skills, trimmedSkill],
            otherSkill: "",
          }));
        }
      }
    }}
    className="other-skill-input"
  />
)}


          </div>

          <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} />
          {(image || capturedImage) && <img src={URL.createObjectURL(image || capturedImage)} alt="preview" className="preview-image" />}
          <button type="button" onClick={openCamera}>📷 Ouvrir la Caméra</button>
          <video ref={videoRef} autoPlay className="camera-view"></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <button type="button" onClick={capturePhoto}>📸 Prendre une photo</button>

          <ReCAPTCHA sitekey="6LeiZ-QqAAAAAFjqeHfNgCeTBBzRVfwta1SgRx4v" onChange={handleRecaptchaChange} />

          <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <Link to="/signin">Sign In</Link></p>
      </div>
    </div>
  );
};

export default SignUp;
