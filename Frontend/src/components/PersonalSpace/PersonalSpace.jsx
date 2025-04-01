import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

          let summaryText = data.candidates[0].content.parts[0].text;
          
          let sectionCount = 0;
          summaryText = summaryText.replace(/## (.*?)(?:\r\n|\n|$)/g, (match, p1) => {
            sectionCount++;
            return `<div class="section-heading" data-number="${sectionCount}">${p1}</div>\n`;
          });
          
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

    const doc = new jsPDF();
    const fileNameWithoutExt = fileName.replace('.pdf', '');
    
    doc.setProperties({
      title: `Summary of ${fileNameWithoutExt}`,
      subject: 'Document Summary',
      creator: 'PDF Summarizer'
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(0, 255, 136); // Neon green
    doc.text(`Summary of ${fileNameWithoutExt}`, 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 28);
    
    const plainText = summary
      .replace(/<div class="section-heading" data-number="\d+">(.*?)<\/div>/g, '## $1')
      .replace(/<span class="highlight">(.*?)<\/span>/g, '$1')
      .replace(/<br\s*\/?>/g, '\n');
    
    const lines = plainText.split('\n');
    let yPos = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const textWidth = pageWidth - (margin * 2);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      if (line.startsWith('## ')) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos += 5;
        doc.setFontSize(14);
        doc.setTextColor(0, 255, 136); // Neon green
        doc.text(line.replace('## ', ''), 15, yPos);
        doc.setFontSize(11);
        doc.setTextColor(200, 200, 200); // Light gray
        yPos += 7;
      } else {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const splitLines = doc.splitTextToSize(line, textWidth);
        for (let j = 0; j < splitLines.length; j++) {
          doc.text(splitLines[j], 15, yPos);
          yPos += 7;
          
          if (yPos > 270 && j < splitLines.length - 1) {
            doc.addPage();
            yPos = 20;
          }
        }
        yPos += 3;
      }
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.getHeight() - 10);
    }
    
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
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
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
            <span>Selected file: {fileName}</span>
            <button 
              className="summarize-button"
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
            <div className="summary-header">
              <h3>Document Summary</h3>
              <button className="download-button" onClick={handleDownload}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
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