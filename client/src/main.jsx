import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./styles/globals.css";

import { UIProvider } from "./context/UIContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppPreloader from "./components/common/AppPreloader";

const Root = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <AppPreloader />;

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);