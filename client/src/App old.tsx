// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppRoutes from "@/routes/AppRoutes";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;