import React, { createContext, useState, useEffect } from "react";

// Création du contexte pour le thème
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Vérifier le thème sauvegardé ou utiliser le mode "light" par défaut
  const getInitialTheme = () => {
    return localStorage.getItem("theme") || "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Appliquer la classe sur `body`
    document.body.setAttribute("data-theme", theme);
    // Sauvegarder le thème dans localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fonction pour basculer entre light/dark mode
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
