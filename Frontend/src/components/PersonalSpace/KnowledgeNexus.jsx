import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './KnowledgeNexus.scss';

const KnowledgeNexus = () => {
  const [query, setQuery] = useState('');
  const [learningPath, setLearningPath] = useState(null);
  const [resources, setResources] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  // Fetch trending topics
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const mockTrending = [
          "AI Prompt Engineering",
          "Web3 Development",
          "Cloud Native Applications",
          "Data Science Fundamentals",
          "UX/UI Design Principles",
          "DevOps Best Practices",
          "Cybersecurity Basics",
          "Python Automation",
          "React Native Mobile Development",
          "Blockchain Fundamentals"
        ];
        setTrendingTopics(mockTrending);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      }
    };
    
    fetchTrendingTopics();
  }, []);
  
  const generateContent = async (searchQuery) => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedPath = generateLearningPath(searchQuery);
      setLearningPath(generatedPath);
      generateWebResources(searchQuery);
    } catch (error) {
      console.error("Error generating content:", error);
      setGenerationError("Failed to generate learning path. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLearningPath = (topic) => {
    const commonModules = {
      "react hooks": [
        {
          title: "Introduction to React Hooks",
          duration: "1.5 hours",
          description: "Learn the fundamentals of React Hooks and when to use them",
          keyPoints: [
            "Understanding the motivation behind Hooks",
            "Rules of Hooks",
            "Comparing class components vs functional components with Hooks"
          ]
        },
        {
          title: "useState and useEffect",
          duration: "2.5 hours",
          description: "Deep dive into the most commonly used Hooks",
          keyPoints: [
            "Managing state with useState",
            "Side effects with useEffect",
            "Dependency arrays and optimization"
          ]
        },
        {
          title: "useContext and useReducer",
          duration: "2 hours",
          description: "Advanced state management with Hooks",
          keyPoints: [
            "Creating and consuming context",
            "Managing complex state with useReducer",
            "Performance considerations"
          ]
        },
        {
          title: "Custom Hooks",
          duration: "2 hours",
          description: "Building reusable custom hooks",
          keyPoints: [
            "Hook composition patterns",
            "Sharing logic across components",
            "Testing custom hooks"
          ]
        }
      ],
      "graphql": [
        {
          title: "GraphQL Fundamentals",
          duration: "2 hours",
          description: "Core concepts of GraphQL and how it differs from REST",
          keyPoints: [
            "GraphQL schema definition",
            "Queries and mutations",
            "Type system and resolvers"
          ]
        },
        {
          title: "Building a GraphQL API",
          duration: "3 hours",
          description: "Creating your first GraphQL server",
          keyPoints: [
            "Setting up a GraphQL server",
            "Defining schemas and resolvers",
            "Connecting to a database"
          ]
        },
        {
          title: "Advanced GraphQL",
          duration: "3 hours",
          description: "Deep dive into professional techniques",
          keyPoints: [
            "Authentication and authorization",
            "Performance optimization",
            "Error handling strategies"
          ]
        },
        {
          title: "GraphQL Clients",
          duration: "2 hours",
          description: "Consuming GraphQL APIs from the frontend",
          keyPoints: [
            "Apollo Client",
            "Relay",
            "GraphQL code generation"
          ]
        }
      ],
      "machine learning": [
        {
          title: "Machine Learning Fundamentals",
          duration: "4 hours",
          description: "Core concepts and principles of machine learning",
          keyPoints: [
            "Supervised vs. unsupervised learning",
            "Training and evaluation",
            "Feature engineering basics"
          ]
        },
        {
          title: "Python for Machine Learning",
          duration: "3 hours",
          description: "Essential Python libraries and tools for ML",
          keyPoints: [
            "NumPy and pandas fundamentals",
            "Data visualization with matplotlib",
            "Scikit-learn basics"
          ]
        },
        {
          title: "Practical Machine Learning Algorithms",
          duration: "5 hours",
          description: "Implementation of common ML algorithms",
          keyPoints: [
            "Linear and logistic regression",
            "Decision trees and random forests",
            "Support vector machines"
          ]
        },
        {
          title: "Neural Networks Introduction",
          duration: "4 hours",
          description: "Fundamentals of neural networks and deep learning",
          keyPoints: [
            "Neural network architecture",
            "Backpropagation and optimization",
            "Introduction to TensorFlow/PyTorch"
          ]
        }
      ]
    };

    const defaultModules = [
      {
        title: `Introduction to ${topic}`,
        duration: "2 hours",
        description: `Learn the basic concepts of ${topic}`,
        keyPoints: [
          `What is ${topic}?`,
          `Core principles and fundamentals`,
          `Getting started with ${topic}`
        ]
      },
      {
        title: `Intermediate ${topic} Concepts`,
        duration: "3 hours",
        description: `Build on your foundational knowledge`,
        keyPoints: [
          `Key methodologies and patterns`,
          `Common use cases`,
          `Best practices and conventions`
        ]
      },
      {
        title: `Advanced ${topic} Techniques`,
        duration: "3 hours",
        description: `Master professional-level skills`,
        keyPoints: [
          `Performance optimization`,
          `Advanced patterns and architectures`,
          `Real-world applications`
        ]
      },
      {
        title: `${topic} in Production`,
        duration: "2.5 hours",
        description: `Prepare for real-world implementation`,
        keyPoints: [
          `Deployment strategies`,
          `Monitoring and maintenance`,
          `Troubleshooting common issues`
        ]
      }
    ];

    const modules = commonModules[topic.toLowerCase()] || defaultModules;
    const totalHours = modules.reduce((total, module) => {
      const hours = parseFloat(module.duration.split(' ')[0]);
      return total + hours;
    }, 0);

    const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
    const estimatedHours = Math.round(totalHours);
    
    return {
      topic,
      description: `Comprehensive learning path for ${topic}`,
      estimatedHours,
      difficulty: difficultyLevels[Math.min(Math.floor(estimatedHours / 10), 2)],
      modules
    };
  };
  
  const generateWebResources = (searchQuery) => {
    const resourceTypes = [
      {
        name: "Courses",
        sources: ["Udemy", "Coursera", "Pluralsight", "Frontend Masters"],
        icon: "📚"
      },
      {
        name: "Tutorials",
        sources: ["FreeCodeCamp", "MDN Web Docs", "W3Schools"],
        icon: "📖"
      },
      {
        name: "Videos",
        sources: ["YouTube", "Egghead", "Vimeo"],
        icon: "🎥"
      },
      {
        name: "Documentation",
        sources: ["Official Docs", "GitHub Repos", "API References"],
        icon: "📄"
      }
    ];
    
    const generatedResources = resourceTypes.flatMap(type => {
      return type.sources.slice(0, 2).map(source => ({
        title: `${source}: ${searchQuery} ${type.name}`,
        type: type.name,
        icon: type.icon,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${source} ${searchQuery} ${type.name}`)}`
      }));
    });

    setResources(generatedResources);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      generateContent(query);
    }
  };
  
  const generateDocxContent = () => {
    if (!learningPath) return '';
    
    const { topic, description, estimatedHours, difficulty, modules } = learningPath;
    
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <title>${topic} Learning Path</title>
        <style>
          body {
            font-family: Calibri, Arial, sans-serif;
            line-height: 1.5;
          }
          h1 {
            color: #2b579a;
            font-size: 28pt;
          }
          h2 {
            color: #2b579a;
            font-size: 22pt;
            border-bottom: 1px solid #2b579a;
            padding-bottom: 4px;
          }
          h3 {
            color: #2b579a;
            font-size: 18pt;
          }
          .module {
            margin-bottom: 20px;
          }
          .key-points {
            margin-left: 20px;
          }
          .meta {
            color: #666666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1>${topic} Learning Path</h1>
        <p>${description}</p>
        <p class="meta">Estimated time: ${estimatedHours} hours | Difficulty: ${difficulty}</p>
    `;
    
    htmlContent += `<h2>Learning Modules</h2>`;
    modules.forEach((module, index) => {
      htmlContent += `
        <div class="module">
          <h3>Module ${index + 1}: ${module.title}</h3>
          <p class="meta">Duration: ${module.duration}</p>
          <p>${module.description}</p>
          <div class="key-points">
            <h4>Key Learning Points:</h4>
            <ul>
              ${module.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });
    
    htmlContent += `<h2>Recommended Resources</h2>`;
    htmlContent += `<ul>`;
    resources.forEach(resource => {
      htmlContent += `<li><a href="${resource.url}">${resource.title}</a> (${resource.type})</li>`;
    });
    htmlContent += `</ul>`;
    
    htmlContent += `
        <p style="margin-top: 40px; color: #888888;">
          Generated by Knowledge Nexus on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;
    
    return htmlContent;
  };
  
  const exportAsWord = async () => {
    if (!learningPath) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Generate the HTML content
      const htmlContent = generateDocxContent();
      
      // Create a Blob with the HTML content
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      
      // Update progress
      setExportProgress(50);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${learningPath.topic.replace(/[^a-z0-9]/gi, '_')}_learning_path.doc`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
        }, 500);
      }, 100);
      
    } catch (error) {
      console.error("Error exporting to Word:", error);
      setIsExporting(false);
      setExportProgress(0);
      alert("Failed to generate Word document. Please try again.");
    }
  };
  
  const exportAsZip = async () => {
    if (!learningPath) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const zip = new JSZip();
      const { topic, modules } = learningPath;
      
      // Create a folder for the modules
      const folder = zip.folder(`${topic} Learning Path`);
      
      // Add each module as a separate text file
      modules.forEach((module, index) => {
        let moduleContent = `Module ${index + 1}: ${module.title}\n\n`;
        moduleContent += `Duration: ${module.duration}\n\n`;
        moduleContent += `${module.description}\n\n`;
        moduleContent += `Key Learning Points:\n`;
        module.keyPoints.forEach(point => {
          moduleContent += `- ${point}\n`;
        });
        
        folder.file(`Module_${index + 1}_${module.title.replace(/[^a-z0-9]/gi, '_')}.txt`, moduleContent);
        setExportProgress((index + 1) * (80 / modules.length));
      });
      
      // Add resources file
      let resourcesContent = `Recommended Resources for ${topic}\n\n`;
      resources.forEach(resource => {
        resourcesContent += `- ${resource.title} (${resource.type}): ${resource.url}\n`;
      });
      folder.file('Resources.txt', resourcesContent);
      
      setExportProgress(90);
      
      // Generate the ZIP file
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setExportProgress(90 + (metadata.percent / 10));
      });
      
      // Download the ZIP file
      saveAs(content, `${topic.replace(/[^a-z0-9]/gi, '_')}_learning_modules.zip`);
      
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
      
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      setIsExporting(false);
      setExportProgress(0);
      alert("Failed to create ZIP file. Please try again.");
    }
  };
  
  const openWebSearch = (url) => {
    window.open(url, '_blank');
  };

  const resetSearch = () => {
    setLearningPath(null);
    setQuery('');
    setActiveTab('discover');
  };

  return (
    <div className="knowledge-nexus">
      <div className="nexus-header">
        <div className="search-container">
          <form onSubmit={handleSubmit}>
            <div className="search-box">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to learn today?"
                className="search-input"
              />
              <div className="search-actions">
                <button type="submit" className="search-button">Explore</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="nexus-tabs">
        <button 
          className={`nexus-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button 
          className={`nexus-tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending Topics
        </button>
      </div>
      
      <div className="nexus-content">
        {activeTab === 'discover' && (
          <div className="discover-content">
            {!learningPath && !isGenerating && (
              <div className="nexus-welcome">
                <div className="welcome-icon">🔍</div>
                <h2>Your Personal Learning Generator</h2>
                <p>Search for any topic and instantly generate a complete learning path with web resources you can explore.</p>
                <p className="custom-message">
                  Can't find what you're looking for in our courses? Let's fix that together!
                </p>
                <div className="suggestion-chips">
                  <button onClick={() => { setQuery("React Hooks"); generateContent("React Hooks"); }}>React Hooks</button>
                  <button onClick={() => { setQuery("GraphQL"); generateContent("GraphQL"); }}>GraphQL</button>
                  <button onClick={() => { setQuery("Machine Learning"); generateContent("Machine Learning"); }}>Machine Learning</button>
                </div>
              </div>
            )}
            
            {isGenerating && (
              <div className="generating-indicator">
                <div className="pulse-animation"></div>
                <p>Building your learning path and finding the best resources...</p>
              </div>
            )}
            
            {generationError && (
              <div className="generation-error">
                <p>{generationError}</p>
                <button onClick={() => setGenerationError(null)}>Try Again</button>
              </div>
            )}
            
            {learningPath && !isGenerating && (
              <div className="learning-path">
                <div className="path-header">
                  <div className="path-title-section">
                    <h2>{learningPath.topic}</h2>
                    <p className="path-description">{learningPath.description}</p>
                    <div className="path-meta">
                      <span className="path-time">{learningPath.estimatedHours} hours</span>
                      <span className="path-difficulty">{learningPath.difficulty}</span>
                    </div>
                  </div>
                  <div className="path-actions">
                    <button 
                      className="action-button primary"
                      onClick={exportAsWord}
                      disabled={isExporting}
                    >
                      {isExporting && exportProgress < 100 ? 'Exporting...' : 'Export as Word'}
                    </button>
                    <button 
                      className="action-button primary"
                      onClick={exportAsZip}
                      disabled={isExporting}
                    >
                      {isExporting && exportProgress < 100 ? 'Exporting...' : 'Export as ZIP'}
                    </button>
                    <button className="action-button secondary" onClick={resetSearch}>
                      Back to Search
                    </button>
                  </div>
                </div>
                
                {isExporting && (
                  <div className="export-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${exportProgress}%` }}
                      ></div>
                    </div>
                    <p>Exporting learning path... {Math.round(exportProgress)}%</p>
                  </div>
                )}
                
                <div className="modules-container">
                  <h3>Learning Modules</h3>
                  <div className="modules-list">
                    {learningPath.modules.map((module, index) => (
                      <div className="module-item" key={index}>
                        <div className="module-number">{index + 1}</div>
                        <div className="module-content">
                          <h4>{module.title}</h4>
                          <p>{module.description}</p>
                          <div className="module-meta">
                            <span className="module-duration">{module.duration}</span>
                          </div>
                          <div className="key-points">
                            <ul>
                              {module.keyPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="resources-container">
                  <h3>Web Resources</h3>
                  <p className="resource-subtitle">Click any link to search the web for relevant content</p>
                  <div className="resources-list">
                    {resources.map((resource, index) => (
                      <div 
                        className="resource-card" 
                        key={index}
                        onClick={() => openWebSearch(resource.url)}
                      >
                        <div className="resource-type-indicator">
                          <span>{resource.icon}</span>
                        </div>
                        <div className="resource-details">
                          <h4>{resource.title}</h4>
                          <div className="resource-meta">
                            <span className="resource-source">{resource.type}</span>
                          </div>
                        </div>
                        <div className="resource-link">
                          Open
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="ai-generation-notice">
                  <span className="ai-icon">🤖</span>
                  <span>This learning path was generated automatically. Web resources will open in a new tab.</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'trending' && (
          <div className="trending-topics">
            <h2>Trending in Skill Exchange & E-Learning</h2>
            <p>Explore what others are learning right now</p>
            <div className="topics-grid">
              {trendingTopics.map((topic, index) => (
                <div 
                  className="topic-card" 
                  key={index}
                  onClick={() => {
                    setQuery(topic);
                    generateContent(topic);
                    setActiveTab('discover');
                  }}
                >
                  <div className="trend-indicator">
                    {index < 3 ? '🔥' : '📈'}
                  </div>
                  <h3>{topic}</h3>
                  <div className="explore-button">Explore</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeNexus;