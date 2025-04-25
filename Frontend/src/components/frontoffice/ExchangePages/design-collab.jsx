import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DesignCollab = () => {
  const [ideas, setIdeas] = useState([]);
  const [ideaText, setIdeaText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleAddIdea = () => {
    if (ideaText.trim() !== '') {
      setIdeas([...ideas, ideaText]);
      setIdeaText('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = "#1DA1F2";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const goBack = () => {
    navigate('/profiles');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1DA1F2' }}>🎨 SkillBridge Design Collab</h1>

        {/* Partage d'idées */}
        <div style={{ marginTop: '30px', background: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333' }}>🧠 Share Your Ideas</h2>
          <textarea
            placeholder="Write your design idea or concept..."
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginTop: '10px'
            }}
          />
          <button
            onClick={handleAddIdea}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#1DA1F2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ➕ Add Idea
          </button>

          {ideas.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>💬 Ideas List:</h3>
              <ul style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                {ideas.map((idea, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Upload et Annotations */}
        <div style={{ marginTop: '30px', background: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333' }}>📷 Upload Your Design Mockup</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginTop: '10px' }}
          />

          {uploadedImage && (
            <div style={{ position: 'relative', marginTop: '20px' }}>
              <img
                src={uploadedImage}
                alt="Uploaded Design"
                style={{ maxWidth: '100%', borderRadius: '10px' }}
              />
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  cursor: 'crosshair'
                }}
              ></canvas>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={clearCanvas} style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  🧹 Clear Annotations
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <button
            onClick={goBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔙 Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignCollab;
