import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdEdit, MdDelete } from "react-icons/md"; // Import icons from react-icons
import "./LearningCircles.scss"; // optional style

const LearningCircles = () => {
  const [circles, setCircles] = useState([]); // Stores all circles
  const [user, setUser] = useState(null); // Stores the logged-in user
  const [loading, setLoading] = useState(true); // For loading state
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch user and circles when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.user && data.user._id) {
          setUser(data.user); // Set user data
        } else {
          alert("Error: Invalid user.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchCircles = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/circles/getALLcircles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCircles(res.data);
        setLoading(false); // Set loading to false once circles are fetched
      } catch (err) {
        console.error("Error fetching circles:", err);
        setLoading(false);
      }
    };

    fetchUser(); // Fetch user
    fetchCircles(); // Fetch circles
  }, [token]);

  const handleJoin = async (circleId) => {
    try {
      // Send the join request to the server
      await axios.post(`http://localhost:3000/api/circles/${circleId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Successfully joined!");

      // Update the circles state to reflect the new participant and show the video call link
      setCircles((prev) =>
        prev.map((circle) =>
          circle._id === circleId
            ? { ...circle, participants: [...circle.participants, "you"] }
            : circle
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  const handleDelete = async (circleId) => {
    const reason = prompt("Please provide a reason for deleting this circle:");

    if (!reason) {
      alert("You must provide a reason to delete the circle.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        return;
      }

      const response = await axios.delete(`http://localhost:3000/api/circles/deleteCircle/${circleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { deleteReason: reason }, // Send the reason with the request
      });

      alert("Circle deleted successfully!");
      setCircles((prev) => prev.filter((circle) => circle._id !== circleId)); // Remove the deleted circle from the UI
    } catch (err) {
      console.error("Error deleting circle:", err);
      alert(err.response?.data?.message || "Error: Could not delete circle.");
    }
  };

  if (loading) return <div>Loading Learning Circles...</div>; // Loading state

  return (
    <div className="learning-circles-container">
      <h2>🌐 Join a Learning Circle</h2>
      <button onClick={() => navigate("/create-circle")} className="create-circle-button">
Create New Circle
</button>

      <div className="circle-list">
        {circles.length === 0 ? (
          <p>No circles available.</p>
        ) : (
          circles.map((circle) => (
            <div className="circle-card" key={circle._id}>
              <h3>{circle.topic}</h3>
              <p>{circle.description}</p>
              <p><strong>Skill:</strong> {circle.skillTag}</p>
              <p><strong>Level:</strong> {circle.level}</p>
              <p><strong>Moderator:</strong> {circle.moderator?.name || "TBD"}</p>
              <p><strong>Date:</strong> {new Date(circle.scheduledDate).toLocaleString()}</p>
              <p><strong>Spots:</strong> {circle.participants.length} / {circle.maxParticipants}</p>

              {/* Show Join Video Call link if the user has joined the circle */}
              {user && circle.participants.some((participant) => participant._id === user._id) && circle.videoCallLink && (
                <div className="video-call-link">
                  <a href={circle.videoCallLink} target="_blank" rel="noopener noreferrer">
                    🚀 Join Video Call
                  </a>
                </div>
              )}

              {/* FULL badge */}
              {circle.participants.length >= circle.maxParticipants && (
                <div className="badge-full">FULL</div>
              )}

              {/* Join Circle button */}
              <button
                disabled={circle.participants.length >= circle.maxParticipants}
                onClick={() => handleJoin(circle._id)}
              >
                Join Circle
              </button>

              {/* Show Edit and Delete icons only for the moderator */}
              {user && circle.moderator?._id === user._id && (
                <div className="circle-actions">
                  <button className="circle-action-btn" onClick={() => navigate(`/edit-circle/${circle._id}`)}>
                    <MdEdit />
                  </button>
                  <button className="circle-action-btn" onClick={() => handleDelete(circle._id)}>
                    <MdDelete />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningCircles;
