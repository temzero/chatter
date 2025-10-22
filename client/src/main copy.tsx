// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary";
import "@/i18n"; // initializes i18n globally

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
  // </StrictMode>,
);
