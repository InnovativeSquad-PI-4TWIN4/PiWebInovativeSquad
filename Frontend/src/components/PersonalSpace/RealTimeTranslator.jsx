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

  console.log('Rendering RealTimeTranslator component');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' },
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; // Capture partial results for better speaker detection
      recognitionRef.current.lang = detectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        transcriptBufferRef.current += transcript;
        const fullTranscript = transcriptBufferRef.current.trim();
        setTranscribedText(fullTranscript);
        translateText(fullTranscript);
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
    console.log('Translating text:', text, 'to', languages.find(lang => lang.code === outputLanguage).name);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`;
      const targetLanguage = languages.find(lang => lang.code === outputLanguage).name;
      const prompt = {
        role: 'user',
        parts: [{
          text: `Translate the following text into ${targetLanguage} using the most common and informal translation: "${text}"`
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
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Translation failed.';
      console.log('Translated text:', translated);
      setTranslatedText(translated);

      setHistory(prev => [
        ...prev,
        {
          transcribed: text,
          translated: translated,
          timestamp: new Date().toLocaleTimeString(),
        }
      ].slice(-10));
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
        setManualText(text);
        setTranscribedText(text);
        translateText(text);
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
    setManualText('');
  };

  const togglePanel = () => {
    console.log('Toggling panel, current state:', isPanelOpen);
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
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste document text or type here..."
              className="text-input"
              rows="3"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleManualTextSubmit()}
            />
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
              {isTranscribing ? 'Stop' : 'Start'}
            </button>
          </div>
          <div className="panel-content">
            <div className="text-box">
              <h3>Transcribed Text ({detectedLanguage === 'auto' ? 'Auto' : detectedLanguage})</h3>
              <p>{transcribedText || 'No transcription yet.'}</p>
            </div>
            <div className="text-box">
              <h3>Translated Text ({languages.find(lang => lang.code === outputLanguage).name})</h3>
              <p>{loading ? 'Translating...' : translatedText || 'No translation yet.'}</p>
            </div>
            <div className="history-box">
              <h3>Translation History</h3>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div key={index} className="history-entry">
                      <p><strong>[{entry.timestamp}] Transcribed:</strong> {entry.transcribed}</p>
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
