import "./main.css";
import "@/i18n"; // initializes i18n globally
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary";
import bootstrapApp from "./common/hooks/app/boostrap.ts";
import LoadAppErrorPage from "./pages/error/LoadAppErrorPage.tsx";

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
