import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaLanguage, FaFileImport } from 'react-icons/fa';
import './RealTimeTranslator.scss';

const RealTimeTranslator = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [detectedLanguage, setDetectedLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [manualText, setManualText] = useState('');
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const transcriptBufferRef = useRef('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ko', name: 'Korean' },
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = detectedLanguage !== 'auto' ? detectedLanguage : '';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (transcript.trim()) {
          transcriptBufferRef.current += transcript;
          const fullTranscript = transcriptBufferRef.current.trim();
          setTranscribedText(fullTranscript);
          translateText(fullTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsTranscribing(false);
      };

      recognitionRef.current.onend = () => {
        if (isTranscribing) {
          recognitionRef.current.start();
        }
      };
    } else {
      console.error('SpeechRecognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [detectedLanguage, isTranscribing]);

  const translateText = async (text) => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`;
      // Get the language name based on selected output language code
      const targetLanguage = languages.find(lang => lang.code === outputLanguage)?.name || 'English';
      
      // Create a more explicit prompt for the translation API
      const prompt = {
        role: 'user',
        parts: [{
          text: `Translate this text to ${targetLanguage}. Be sure to use the ${targetLanguage} language and not any other language: "${text}"`
        }]
      };

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-1.5-flash',
          contents: [prompt],
        }),
      };

      const response = await fetch(apiUrl, requestOptions);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Extra validation to ensure we get translation data
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Translation failed.';
      
      // Remove any quotation marks that might be in the translation response
      const cleanTranslation = translated.replace(/^["']|["']$/g, '').trim();
      setTranslatedText(cleanTranslation);

      // Add to history (keep last 10 entries)
      setHistory(prev => [
        {
          transcribed: text,
          translated: cleanTranslation,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 10));
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        if (text && text.trim()) {
          setManualText(text);
          setTranscribedText(text);
          // Ensure we call translateText with the text content
          translateText(text);
        } else {
          setTranslatedText('The uploaded file appears to be empty.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a .txt file.');
    }
  };

  const handleManualTextSubmit = () => {
    if (!manualText.trim()) return;
    setTranscribedText(manualText);
    translateText(manualText);
  };

  const togglePanel = () => {
    setIsPanelOpen(prev => !prev);
    if (isTranscribing) {
      stopTranscription();
    }
  };

  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      transcriptBufferRef.current = '';
      setTranscribedText('');
      setTranslatedText('');
      recognitionRef.current.start();
      setIsTranscribing(true);
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
  };

  const handleLanguageChange = (e) => {
    setOutputLanguage(e.target.value);
    // Re-translate if we have text
    if (transcribedText) {
      translateText(transcribedText);
    }
  };

  const handleDetectedLanguageChange = (e) => {
    setDetectedLanguage(e.target.value);
    if (recognitionRef.current) {
      recognitionRef.current.lang = e.target.value !== 'auto' ? e.target.value : '';
      
      if (isTranscribing) {
        stopTranscription();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsTranscribing(true);
        }, 300);
      }
    }
  };

  // Add a keyboard event handler for textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid adding a newline
      handleManualTextSubmit();
    }
  };

  return (
    <div className="translator-container">
      <div className="translator-bulb" onClick={togglePanel}>
        <FaLanguage className="bulb-icon" />
        <span className="bulb-text">Translation</span>
      </div>
      {isPanelOpen && (
        <div className="translator-panel">
          <div className="panel-header">
            <h2>Real-Time Translator</h2>
            <button className="close-btn" onClick={togglePanel}>✖</button>
          </div>
          <div className="panel-controls">
            <div className="language-controls">
              <div className="language-selector">
                <label>Input Language:</label>
                <select 
                  value={detectedLanguage} 
                  onChange={handleDetectedLanguageChange}
                >
                  <option value="auto">Auto Detect</option>
                  {languages.map((lang) => (
                    <option key={`input-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="language-selector">
                <label>Output Language:</label>
                <select
                  value={outputLanguage}
                  onChange={handleLanguageChange}
                >
                  {languages.map((lang) => (
                    <option key={`output-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste document text or type here..."
              className="text-input"
              rows="3"
            />
            <div className="control-buttons">
              <input
                type="file"
                accept=".txt"
                onChange={handleDocumentUpload}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-upload-btn">
                <FaFileImport className="file-icon" />
                Upload Document
              </label>
              <button
                className={`transcribe-btn ${isTranscribing ? 'stop' : ''}`}
                onClick={toggleTranscription}
              >
                {isTranscribing ? <FaStop /> : <FaMicrophone />}
                {isTranscribing ? 'Stop' : 'Start Recording'}
              </button>
            </div>
          </div>
          <div className="panel-content">
            <div className="text-box transcribed">
              <h3>Transcribed Text</h3>
              <p>{transcribedText || 'No transcription yet.'}</p>
            </div>
            <div className="text-box translated">
              <h3>Translated Text ({languages.find(lang => lang.code === outputLanguage)?.name || 'English'})</h3>
              <p>{loading ? 'Translating...' : translatedText || 'No translation yet.'}</p>
            </div>
            <div className="history-box">
              <h3>Translation History</h3>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div key={index} className="history-entry">
                      <p><strong>[{entry.timestamp}]</strong></p>
                      <p><strong>Original:</strong> {entry.transcribed}</p>
                      <p><strong>Translated:</strong> {entry.translated}</p>
                    </div>
                  ))
                ) : (
                  <p>No history yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeTranslator;