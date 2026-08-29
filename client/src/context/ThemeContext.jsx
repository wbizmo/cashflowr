import { createContext, useContext, useLayoutEffect, useState } from "react";

import { applyThemeToRoot, persistTheme, readStoredTheme } from "./theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredTheme);

  useLayoutEffect(() => {
    const normalizedTheme = applyThemeToRoot(theme);
    persistTheme(normalizedTheme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);