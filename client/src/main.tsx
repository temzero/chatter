// import { StrictMode } from 'react'
import "./main.css";
import "@/i18n"; // initializes i18n globally
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary";
import bootstrapApp from "./common/hooks/app/boostrap.ts";
import { createRoot } from "react-dom/client";
import LoadAppErrorPage from "./pages/error/LoadAppErrorPage.tsx";
import logger from "./common/utils/logger.ts";

// Wait for all stores to initialize before mounting React
bootstrapApp()
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      // <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      // </StrictMode>,
    );
  })
  .catch((err) => {
    logger.error({ prefix: "INIT", timestamp: true }, "Failed to initialize app:", err);
    createRoot(document.getElementById("root")!).render(<LoadAppErrorPage />);
  });
