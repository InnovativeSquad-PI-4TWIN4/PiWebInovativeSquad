import React, { useState, useRef } from 'react';
import './PersonalSpace.scss';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
      // Read the PDF file
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      
      fileReader.onload = async () => {
        try {
          // Convert PDF to text (simplified - in a real app, you'd use a PDF parsing library)
          // Here we're just using base64 encoding as a placeholder
          const base64 = btoa(
            new Uint8Array(fileReader.result)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          // Send the PDF content to Gemini API
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

          let summaryText = data.candidates[0].content.parts[0].text;
          
          // Format the summary - replace markdown with our custom formatting
          // Replace ## headings with numbered section headings
          let sectionCount = 0;
          summaryText = summaryText.replace(/## (.*?)(?:\r\n|\n|$)/g, (match, p1) => {
            sectionCount++;
            return `<div class="section-heading" data-number="${sectionCount}">${p1}</div>\n`;
          });
          
          // Replace **text** with highlights
          summaryText = summaryText.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
          
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

    // Create new PDF document
    const doc = new jsPDF();
    const fileNameWithoutExt = fileName.replace('.pdf', '');
    
    // Set PDF properties
    doc.setProperties({
      title: `Summary of ${fileNameWithoutExt}`,
      subject: 'Document Summary',
      creator: 'PDF Summarizer'
    });
    
    // Set font
    doc.setFont('helvetica', 'normal');
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 136); // Teal color for title
    doc.text(`Summary of ${fileNameWithoutExt}`, 15, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 28);
    
    // Process summary content
    const plainText = summary
      .replace(/<div class="section-heading" data-number="\d+">(.*?)<\/div>/g, '## $1')
      .replace(/<span class="highlight">(.*?)<\/span>/g, '$1')
      .replace(/<br\s*\/?>/g, '\n');
    
    // Split by lines for processing
    const lines = plainText.split('\n');
    let yPos = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const textWidth = pageWidth - (margin * 2);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this is a section heading
      if (line.startsWith('## ')) {
        // Move to next page if near bottom
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Add some space before section headings
        yPos += 5;
        
        // Format section heading
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 136); // Teal
        doc.text(line.replace('## ', ''), 15, yPos);
        
        // Reset text style
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50); // Dark grey
        
        yPos += 7;
      }
      // Regular paragraph
      else {
        // Check if we need to add a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Split long text into lines that fit the page width
        const splitLines = doc.splitTextToSize(line, textWidth);
        
        // Add each line to the PDF
        for (let j = 0; j < splitLines.length; j++) {
          doc.text(splitLines[j], 15, yPos);
          yPos += 7;
          
          // Add a new page if needed
          if (yPos > 270 && j < splitLines.length - 1) {
            doc.addPage();
            yPos = 20;
          }
        }
        
        yPos += 3; // Add some space after paragraphs
      }
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.getHeight() - 10);
    }
    
    // Save the PDF
    doc.save(`${fileNameWithoutExt}_summary.pdf`);
  };

  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div className="pdf-summarizer">
      <div className="hero-section">
        <h1>PDF Summarizer</h1>
        <p>Upload your documents and get professional AI-powered summaries in seconds.</p>
      </div>

      <div className="summarizer-container">
        <div 
          className="upload-area" 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="upload-icon">📄</div>
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
            <span>Selected file: {fileName}</span>
            <button 
              className="summarize-button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Summarizing...' : 'Summarize Document'}
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
            <div className="summary-header">
              <h3>Document Summary</h3>
              <button className="download-button" onClick={handleDownload}>
                Download PDF
              </button>
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
  );
};

export default PersonalSpace;