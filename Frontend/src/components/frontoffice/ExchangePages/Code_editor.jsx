import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000"); // adapte selon ton serveur

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server:", socket.id);
    });

    socket.on("init", (initialCode) => {
      setCode(initialCode);
    });

    socket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("init");
      socket.off("code-change");
    };
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", newCode);
  };

  const handleRun = () => {
    try {
      const consoleLog = [];
      const originalConsole = console.log;
      console.log = (msg) => consoleLog.push(msg);

      if (language === 'javascript') {
        // eslint-disable-next-line no-eval
        eval(code);
      } else {
        consoleLog.push('⚡️ Code execution is only available for JavaScript.');
      }

      console.log = originalConsole;
      setOutput(consoleLog.join('\n'));
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => alert('📋 Code copied to clipboard!'))
      .catch(() => alert('❌ Failed to copy!'));
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillbridge-code.${language === 'html' ? 'html' : language === 'python' ? 'py' : 'js'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goBack = () => {
    navigate("/profiles");
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1DA1F2' }}>💻 SkillBridge Collaborative Code Editor</h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <select value={language} onChange={handleLanguageChange} style={{ padding: '10px', borderRadius: '5px', fontSize: '16px' }}>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '20px' }}>
          <Editor
            height="400px"
            language={language}
            theme="vs-light"
            value={code}
            onChange={handleCodeChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleRun} style={{ padding: '10px 20px', backgroundColor: '#1DA1F2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ▶️ Run Code
          </button>
          <button onClick={handleCopy} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            📋 Copy Code
          </button>
          <button onClick={handleDownload} style={{ padding: '10px 20px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            📥 Download Code
          </button>
          <button onClick={goBack} style={{ padding: '10px 20px', backgroundColor: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🔙 Back
          </button>
        </div>

        <div style={{ marginTop: '30px', background: '#1e1e1e', color: '#00ff90', padding: '20px', borderRadius: '10px', fontFamily: 'monospace' }}>
          <h3 style={{ color: '#fff' }}>🧪 Output:</h3>
          <pre>{output || '/* Output will appear here */'}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
