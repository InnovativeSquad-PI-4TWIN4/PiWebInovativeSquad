import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaFileUpload } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import './PersonalSpace.scss';

const PersonalSpace = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const summaryContentRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    } else {
      setFile(null);
      setFileName('');
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      
      fileReader.onload = async () => {
        try {
          const base64 = btoa(
            new Uint8Array(fileReader.result)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          const apiKey = import.meta.env.VITE_API_KEY;
          const apiUrl = `${import.meta.env.VITE_API_URL}?key=${apiKey}`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: "Please provide a professional summary of the following document. Focus on key points, main ideas, and actionable insights. Structure the summary with clear sections, bullet points where appropriate, and a brief conclusion. Keep the summary concise but comprehensive." },
                    { 
                      inline_data: {
                        mime_type: "application/pdf",
                        data: base64
                      }
                    }
                  ]
                }
              ]
            })
          });

          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error.message || 'Error processing the PDF');
          }

          // Improved formatting of summary text
          let summaryText = data.candidates[0].content.parts[0].text;
          
          // Process section headings with improved structure
          let sectionCount = 0;
          summaryText = summaryText.replace(/## (.*?)(?:\r\n|\n|$)/g, (match, p1) => {
            sectionCount++;
            return `<div class="section-heading" data-number="${sectionCount}"><span class="section-number">${sectionCount}</span>${p1}</div>\n`;
          });
          
          // Process bullet points to ensure proper formatting
          summaryText = summaryText.replace(/- (.*?)(?:\r\n|\n|$)/g, '<li class="summary-item">$1</li>\n');
          summaryText = summaryText.replace(/<li class="summary-item">(.*?)<\/li>\n<li class="summary-item">/g, '<li class="summary-item">$1</li>\n<li class="summary-item">');
          summaryText = summaryText.replace(/(?:<li class="summary-item">.*?<\/li>\n)+/g, '<ul class="summary-list">\n$&</ul>\n');
          
          // Format highlighted text
          summaryText = summaryText.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
          
          // Properly wrap paragraphs
          summaryText = summaryText.replace(/(?<!\n<\/div>|\n<\/ul>|\n<ul|\n<li|\n<\/li>)(\n\n+)(?!<div|<ul|<\/ul>|<li)/g, '</p><p>');
          summaryText = summaryText.replace(/(?<!<\/div>\n|<\/ul>\n|<ul|<li|<\/li>\n|<p>|<\/p>)([^\n<].+?(?:\n(?!<div|<ul|<\/ul>|<li|<\/li>)[^\n<].*?)*)(?=\n<div|\n<ul|$)/gs, '<p>$1</p>');
          
          setSummary(summaryText);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing PDF:', error);
          setError('Error processing the PDF: ' + error.message);
          setIsLoading(false);
        }
      };

      fileReader.onerror = () => {
        setError('Error reading the PDF file');
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error handling file:', error);
      setError('Error handling the file: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;

    const doc = new jsPDF();
    const fileNameWithoutExt = fileName.replace('.pdf', '');
    
    // Set document properties
    doc.setProperties({
      title: `Summary of ${fileNameWithoutExt}`,
      subject: 'Document Summary',
      creator: 'PDF Summarizer'
    });
    
    // Define consistent colors for PDF - using RGB values (0-255)
    const primaryColor = [38, 43, 89]; // Darker blue
    const textColor = [50, 50, 50]; // Dark gray for body text
    const headingColor = [70, 82, 179]; // Medium blue for headings
    const bulletColor = [70, 82, 179]; // Blue for bullets
    
    // Header styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(`Summary of ${fileNameWithoutExt}`, 20, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100); // Gray for date
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 28);
    
    // Add a decorative line with proper RGB values
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Process summary content for the PDF - fixing text extraction
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = summary;
    
    // Extract proper text structure from HTML
    const sections = [];
    const headings = tempDiv.querySelectorAll('.section-heading');
    
    headings.forEach(heading => {
      const sectionNumber = heading.getAttribute('data-number');
      const sectionTitle = heading.textContent.replace(sectionNumber, '').trim();
      
      // Get content until the next heading
      let content = [];
      let currentEl = heading.nextElementSibling;
      
      while (currentEl && !currentEl.classList.contains('section-heading')) {
        if (currentEl.tagName === 'UL') {
          const bullets = Array.from(currentEl.querySelectorAll('li')).map(li => `• ${li.textContent.trim()}`);
          content = [...content, ...bullets];
        } else if (currentEl.tagName === 'P') {
          content.push(currentEl.textContent.trim());
        }
        currentEl = currentEl.nextElementSibling;
      }
      
      sections.push({
        title: sectionTitle,
        content: content
      });
    });
    
    // If no sections were found, extract text directly
    if (sections.length === 0) {
      const paragraphs = tempDiv.querySelectorAll('p');
      const bullets = tempDiv.querySelectorAll('li');
      
      const content = [
        ...Array.from(paragraphs).map(p => p.textContent.trim()),
        ...Array.from(bullets).map(li => `• ${li.textContent.trim()}`)
      ];
      
      sections.push({
        title: 'Summary',
        content: content
      });
    }
    
    // Start rendering from this Y position
    let yPos = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const textWidth = pageWidth - (margin * 2);
    
    // Process each section
    sections.forEach((section, index) => {
      // Add page break if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add space before section title (except first section)
      if (index > 0) {
        yPos += 10;
      }
      
      // Format section title
      doc.setFontSize(16);
      doc.setTextColor(...headingColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${section.title}`, 20, yPos);
      
      // Reset text format for content
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      
      // Process each content piece
      section.content.forEach(line => {
        // Skip empty lines
        if (!line.trim()) return;
        
        // Add page break if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Handle bullet points
        if (line.startsWith('•')) {
          // Format bullet point with proper indentation
          const bulletText = line.substring(1).trim();
          const splitLines = doc.splitTextToSize(bulletText, textWidth - 8);
          
          // Add bullet symbol with proper color
          doc.setTextColor(...bulletColor);
          doc.setFont('helvetica', 'bold');
          doc.text('•', 20, yPos);
          
          // Reset text format for bullet text
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'normal');
          
          // Add bullet text with indentation
          doc.text(splitLines, 25, yPos);
          
          // Increment Y position based on number of lines in this bullet
          yPos += 6 * splitLines.length;
        } 
        // Handle regular paragraphs
        else {
          const splitLines = doc.splitTextToSize(line, textWidth);
          doc.text(splitLines, 20, yPos);
          yPos += 6 * splitLines.length;
        }
        
        // Add a small gap after each content piece
        yPos += 2;
      });
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 15);
    }
    
    doc.save(`${fileNameWithoutExt}_summary.pdf`);
  };

  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="title-container">
          <GiBrain className="brain-icon" />
          <h1 className="dashboard-title">
            PDF <span className="highlight">Summarizer</span>
          </h1>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="glass-panel">
          <div className="section-header">
            <FaFileUpload className="section-icon" />
            <h2>Upload Your Document</h2>
          </div>
          
          <div 
            className="upload-area" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="upload-icon">
              <FaFileUpload />
            </div>
            <h3>Drag & Drop your PDF here</h3>
            <p>or click to browse files</p>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>

          {fileName && (
            <div className="file-info">
              <div className="file-name-container">
                <span className="file-label">Selected file:</span>
                <span className="file-name">{fileName}</span>
              </div>
              <button 
                className="generate-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Summarizing...
                  </>
                ) : 'Summarize Document'}
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {isLoading && (
            <div className="loading-animation">
              <div className="spinner"></div>
              <p>Analyzing your document...</p>
            </div>
          )}

          {summary && (
            <div className="summary-result">
              <div className="section-header">
                <div className="header-content">
                  <h2>Document Summary</h2>
                  <button className="download-btn" onClick={handleDownload}>
                    <FaDownload className="btn-icon" />
                    Download PDF
                  </button>
                </div>
              </div>
              <div 
                className="summary-content"
                dangerouslySetInnerHTML={createMarkup(summary)}
                ref={summaryContentRef}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalSpace;