import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";  // Assure-toi que ce fichier existe (tu peux créer un fichier CSS si nécessaire)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
