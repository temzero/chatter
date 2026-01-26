// import "./main.css";
import "./assets/styles/main.css"
import "@/i18n"; // initializes i18n globally
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import App from "./App";
import bootstrapApp from "./common/hooks/app/bootstrap";
import LoadAppErrorPage from "./pages/error/LoadAppErrorPage";

// Add Buffer polyfill for music-metadata-browser
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

const currentPath = window.location.pathname;
const isPublicRoute = currentPath.startsWith("/auth/");


const renderApp = () => {
  createRoot(document.getElementById("root")!).render(
    // <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    // </StrictMode>
  );
};

if (isPublicRoute) {
  console.log("[BOOTSTRAP] Public route, skipping bootstrap");
  renderApp(); // just render app, skip bootstrap
} else {
  // Only bootstrap for private routes
  bootstrapApp()
    .then(() => {
      renderApp();
    })
    .catch((error) => {
      console.error("[BOOTSTRAP] Failed to bootstrap app:", error);
      createRoot(document.getElementById("root")!).render(<LoadAppErrorPage />);
    });
}
