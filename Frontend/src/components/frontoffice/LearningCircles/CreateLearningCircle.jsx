import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateLearningCircle.scss"; // optional style

const CreateLearningCircle = () => {
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    skillTag: "",
    level: "Beginner",
    scheduledDate: "",
    maxParticipants: 6,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const circleData = {
      topic: formData.topic,
      description: formData.description,
      skillTag: formData.skillTag,
      level: formData.level,
      scheduledDate: formData.scheduledDate,
      maxParticipants: formData.maxParticipants,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        return;
      }

      const response = await axios.post("http://localhost:3000/api/circles", circleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Circle created:", response.data);
      alert("Learning Circle created successfully!");
      navigate("/learning-circles"); // Redirect after successful circle creation
    } catch (error) {
      console.error("Error creating circle:", error);
      alert("Error: Could not create circle.");
    }
  };

  return (
    <div className="create-circle-container">
      <h2>Create a New Learning Circle</h2>
      <form onSubmit={handleSubmit} className="circle-form">
        <input
          type="text"
          name="topic"
          placeholder="Circle Topic"
          value={formData.topic}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Describe the learning goal..."
          value={formData.description}
          onChange={handleChange}
          rows={4}
        />
        <input
          type="text"
          name="skillTag"
          placeholder="Enter Skill "
          value={formData.skillTag}
          onChange={handleChange}
          required
        />
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <input
          type="datetime-local"
          name="scheduledDate"
          value={formData.scheduledDate}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="maxParticipants"
          min="2"
          max="15"
          value={formData.maxParticipants}
          onChange={handleChange}
        />
        <button type="submit" className="submit-button">Create Circle</button>
      </form>
    </div>
  );
};

export default CreateLearningCircle;
