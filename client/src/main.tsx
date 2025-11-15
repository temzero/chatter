// import { StrictMode } from 'react'
import "./main.css";
import "@/i18n"; // initializes i18n globally
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary";
import bootstrapApp from "./common/hooks/app/boostrap.ts";
import { createRoot } from "react-dom/client";
import LoadAppErrorPage from "./pages/error/LoadAppErrorPage.tsx";

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
    console.log("Caught error during bootstrap:", err);
    if (err?.response?.status === 401) {
      // Ignore 401 errors (unauthenticated)
      console.info("[INIT]", "Unauthorized, skipping error page.");
      return;
    } else {
      console.error("[INIT]", "Failed to initialize app:", err);
      createRoot(document.getElementById("root")!).render(<LoadAppErrorPage />);
    }
  });
