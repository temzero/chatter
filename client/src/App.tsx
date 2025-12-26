// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { Theme, useTheme, useThemeStore } from "./stores/themeStore";
import { ToastContainer } from "react-toastify";
import AppRoutes from "@/routes/AppRoutes";
import { useDevice } from "./common/hooks/useDevice";
import { useVirtualKeyboard } from "./common/hooks/useVirtualKeyboard";
import { motion } from "framer-motion";

const App: React.FC = () => {
  useDevice();
  const keyboardHeight = useVirtualKeyboard();
  const initializeTheme = useThemeStore.getState().initialize;
  const theme = useTheme();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <Router>
      {/* <AppRoutes /> */}

      {/* Global app wrapper support virtual keyboard*/}
      <motion.div
        animate={{ y: -keyboardHeight }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="h-dvh w-full overflow-hidden"
      >
        <AppRoutes />
      </motion.div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        // closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastStyle={{
          padding: "12px",
          ...(theme === Theme.Dark
            ? {
                backgroundColor: "#222",
                color: "#fff",
                border: "2px solid #444",
              }
            : {
                backgroundColor: "#fff",
                color: "#1a202c",
                border: "2px solid #ddd",
              }),
        }}
      />
    </Router>
  );
};

export default App;
