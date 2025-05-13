
import React from "react";
import './CodeRoomSidebar.scss';

const CodeRoomSidebar = ({
  handleRun,
  handleCopy,
  handleDownload,
  goBack,
  handleAutoFix,
  handleExplainCode,
  handleAICodeHelp,
  isLoading,
  aiLoading,
  aiPrompt,
  setAiPrompt,
  language,
  exampleCodes,
  setCode
}) => {
  return (
    <div className="code-sidebar">
      <input
        type="text"
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="💡 Describe what to build"
        className="code-sidebar-input"
      />
      <button onClick={handleAICodeHelp} disabled={aiLoading}>👥 AI Help Me Code</button>
      <button onClick={handleRun}>▶️ Run Code</button>
      <button onClick={handleCopy}>📋 Copy Code</button>
      <button onClick={handleDownload}>📥 Download</button>
      <button onClick={goBack}>🔙 Back</button>
      <button
        onClick={() => {
          if (exampleCodes[language]) {
            setCode(exampleCodes[language]);
          } else {
            alert("No example for this language.");
          }
        }}
      >🎯 Load Example</button>
      <button onClick={handleAutoFix} disabled={isLoading}>🛠 AI Fix</button>
      <button onClick={handleExplainCode} disabled={isLoading}>📘 Explain Code</button>
      {isLoading && <div className="spinner" />}
    </div>
  );
};

export default CodeRoomSidebar;
