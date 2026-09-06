import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read any saved preference, otherwise default to light.
  const [theme, setTheme] = useState(() => localStorage.getItem("baba-jay-theme") || "light");

  // Whenever theme changes, set it as an attribute on <html> — this is
  // what theme.css's [data-theme="dark"] selectors key off of — and
  // persist the choice so it survives a page refresh.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("baba-jay-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
