import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { FaDownload } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import './RoadmapGenerator.scss';

const RoadmapGenerator = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions] = useState([
    'JavaScript Programming', 
    'Data Science', 
    'Web Development', 
    'Artificial Intelligence', 
    'UX Design',
    'Digital Marketing'
  ]);
  const roadmapRef = useRef(null);

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
    setError(null);
  };

  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion);
    setError(null);
  };

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response data - in a real app, replace with actual API call
      const mockRoadmap = `
# Learning Roadmap: ${topic}

## Introduction
A comprehensive guide to mastering ${topic}. This roadmap will take you from beginner to advanced level.

## Prerequisites
- Basic computer skills
- Willingness to learn
- ${topic === 'JavaScript Programming' ? 'HTML/CSS basics' : 'Fundamental concepts in the field'}

## Beginner Stage (Weeks 1-4)
### Key Concepts
- Core fundamentals
- Basic terminology
- Simple applications

### Resources
- Online course: "Introduction to ${topic}"
- Book: "${topic} for Beginners"
- Tutorial: "Getting started with ${topic}"

### Projects
- Build a simple ${topic.toLowerCase().includes('design') ? 'mockup' : 'application'}
- Complete 5 small exercises

## Intermediate Stage (Weeks 5-8)
### Key Concepts
- Advanced techniques
- Common patterns
- Optimization

### Resources
- Course: "Intermediate ${topic}"
- Book: "Mastering ${topic}"
- Tutorial series

### Projects
- Build a portfolio piece
- Contribute to open source

## Advanced Stage (Weeks 9-12)
### Key Concepts
- Expert techniques
- Performance optimization
- Architecture

### Resources
- Advanced courses
- Research papers
- Industry blogs

### Projects
- Complex real-world application
- Technical writing

## Career Opportunities
- ${topic} Developer
- ${topic} Specialist
- ${topic} Consultant

## Expert Tips
1. Practice consistently
2. Build projects
3. Join communities
4. Teach others
5. Stay updated
      `;
      
      setRoadmap(mockRoadmap);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPDF = () => {
    if (!roadmap) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(110, 86, 207); // Using $primary-color value
      doc.text(`Learning Roadmap: ${topic}`, 105, 20, { align: 'center' });

      // Metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(76, 201, 240); // Using $secondary-color value
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Process roadmap content
      let yPosition = 40;
      const lineHeight = 7;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const maxWidth = pageWidth - margin * 2;

      const processText = (text, style = {}) => {
        const { fontSize = 11, fontStyle = 'normal', color = [30, 41, 59] } = style;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      };

      roadmap.split('\n').forEach(line => {
        if (line.startsWith('# ')) {
          processText(line.substring(2), { 
            fontSize: 18, 
            fontStyle: 'bold',
            color: [110, 86, 207]
          });
          yPosition += 5;
        } else if (line.startsWith('## ')) {
          processText(line.substring(3), { 
            fontSize: 16, 
            fontStyle: 'bold',
            color: [76, 201, 240]
          });
          yPosition += 5;
        } else if (line.startsWith('### ')) {
          processText(line.substring(4), { 
            fontSize: 14, 
            fontStyle: 'bold',
            color: [30, 41, 59]
          });
          yPosition += 3;
        } else if (line.startsWith('- ')) {
          processText('• ' + line.substring(2), { color: [30, 41, 59] });
        } else if (line.trim() === '') {
          yPosition += 5;
        } else {
          processText(line);
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
      }

      doc.save(`${topic.replace(/\s+/g, '_')}_Roadmap.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="title-container">
          <GiBrain className="brain-icon" />
          <h1 className="dashboard-title">
            Learning <span className="highlight">Roadmap Generator</span>
          </h1>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="glass-panel">
          <div className="section-header">
            <h2>Create Your Learning Path</h2>
          </div>
          
          <div className="input-section">
            <div className="input-container">
              <input
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Enter a topic (e.g., Machine Learning, Python, Digital Marketing)"
                className="topic-input"
              />
              <button 
                className="generate-btn"
                onClick={generateRoadmap}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : 'Generate Roadmap'}
              </button>
            </div>
            
            <div className="suggestions">
              <p>Popular topics:</p>
              <div className="suggestion-tags">
                {suggestions.map((suggestion, index) => (
                  <span 
                    key={index} 
                    className="suggestion-tag"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="loading-animation">
              <div className="spinner"></div>
              <p>Creating your personalized roadmap...</p>
            </div>
          )}

          {roadmap && (
            <div className="roadmap-result" ref={roadmapRef}>
              <div className="result-header">
                <div className="header-content">
                  <h2>Your Learning Roadmap: {topic}</h2>
                </div>
                <button 
                  className="download-btn" 
                  onClick={downloadAsPDF}
                  title="Download as PDF"
                >
                  <FaDownload className="btn-icon" />
                  Download as PDF
                </button>
              </div>
              <div className="roadmap-content">
                {roadmap.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h2 key={index}>{line.substring(2)}</h2>;
                  } else if (line.startsWith('## ')) {
                    return <h3 key={index}>{line.substring(3)}</h3>;
                  } else if (line.startsWith('### ')) {
                    return <h4 key={index}>{line.substring(4)}</h4>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index}>{line.substring(2)}</li>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index}>{line}</p>;
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;