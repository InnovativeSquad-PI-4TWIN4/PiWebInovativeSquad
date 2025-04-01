import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

  // Added documentation for the handler
  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  // Added documentation for the suggestion click handler
  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion);
    setError(null); // Clear any existing errors when selecting a suggestion
  };

  // Added console log for debugging
  console.log('Current topic:', topic);

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const apiUrl = `${import.meta.env.VITE_API_URL}?key=${apiKey}`;
      
      // Added request timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `Create a comprehensive learning roadmap for: ${topic}. 
                  
                  Include the following sections:
                  1. Introduction: Brief overview of the topic and why it's valuable to learn
                  2. Prerequisites: What should someone already know before starting
                  3. Learning Path: Break down the learning journey into clear stages (Beginner, Intermediate, Advanced)
                  4. For each stage:
                     - Key concepts to master
                     - Recommended resources (books, courses, tutorials)
                     - Projects to build for practice
                  5. Career Opportunities: Potential career paths this knowledge enables
                  6. Expert Tips: Advice for successful learning
                  
                  Format the response with clear headings (use markdown # for main headings and ## for subheadings), bullet points for lists, and make it comprehensive but practical.` 
                }
              ]
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error generating roadmap');
      }

      const roadmapContent = data.candidates[0].content.parts[0].text;
      setRoadmap(roadmapContent);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError(error.name === 'AbortError' 
        ? 'Request timed out. Please try again.' 
        : `Error generating roadmap: ${error.message}`);
      setIsLoading(false);
    }
  };

  const downloadAsPDF = () => {
    if (!roadmap) return;

    const doc = new jsPDF();
    const title = `Learning Roadmap: ${topic}`;
    
    // Add title with improved styling
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 136); // Teal color
    doc.text(title, 105, 20, { align: 'center' });
    
    doc.setTextColor(50, 50, 50); // Dark grey
    doc.setFontSize(11);
    
    // Format and add content with better error handling
    try {
      const roadmapLines = roadmap.split('\n');
      let y = 30;
      const pageHeight = doc.internal.pageSize.height;
      
      roadmapLines.forEach(line => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        if (line.startsWith('# ')) {
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          y += 10;
          doc.text(line.substring(2), 14, y);
          y += 6;
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
        } else if (line.startsWith('## ')) {
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          y += 7;
          doc.text(line.substring(3), 14, y);
          y += 5;
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
        } else if (line.startsWith('- ')) {
          doc.text('•' + line.substring(1), 16, y);
          y += 5;
        } else if (line.trim() === '') {
          y += 3;
        } else {
          const splitText = doc.splitTextToSize(line, 180);
          splitText.forEach(textLine => {
            doc.text(textLine, 14, y);
            y += 5;
          });
        }
      });
      
      // Add footer with improved styling
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated by Skill Exchange | Page ${i} of ${pageCount}`, 
                pageWidth - 25, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'center' });
      }
      
      doc.save(`${topic.replace(/\s+/g, '_')}_roadmap.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="roadmap-generator">
      <div className="hero-section">
        <h1>Learning Roadmap Generator</h1>
        <p>Enter any topic and get a personalized learning path to master it</p>
      </div>

      <div className="generator-container">
        <div className="input-section">
          <div className="input-wrapper">
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter a topic (e.g., Machine Learning, Python, Digital Marketing)"
              className="topic-input"
              aria-label="Enter learning topic"
            />
            <button 
              className="generate-button"
              onClick={generateRoadmap}
              disabled={isLoading}
              aria-label={isLoading ? 'Generating roadmap' : 'Generate roadmap'}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
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
                  aria-label={`Select ${suggestion}`}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-animation">
            <div className="spinner" aria-hidden="true"></div>
            <p>Creating your personalized roadmap...</p>
          </div>
        )}

        {roadmap && (
          <div className="roadmap-result" ref={roadmapRef}>
            <div className="roadmap-header">
              <h3>Learning Roadmap: {topic}</h3>
              <button 
                className="download-button" 
                onClick={downloadAsPDF}
                aria-label="Download roadmap as PDF"
              >
                Download as PDF
              </button>
            </div>
            <div className="roadmap-content">
              {roadmap.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h2 key={index}>{line.substring(2)}</h2>;
                } else if (line.startsWith('## ')) {
                  return <h3 key={index}>{line.substring(3)}</h3>;
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
  );
};

// Added component documentation
RoadmapGenerator.displayName = 'RoadmapGenerator';

export default RoadmapGenerator;