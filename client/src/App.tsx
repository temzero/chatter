import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ChatInfoProvider } from '@/contexts/ChatInfoContext';
import { ModalProvider } from './contexts/ModalContext';
import MediaModal from './components/modal/MediaModal';
import { motion } from 'framer-motion';

import Sidebar from '@/components/sidebar/Sidebar';
import Chat from '@/components/chat/Chat';
import backgroundLight from '@/assets/image/backgroundSky.jpg';
import backgroundDark from '@/assets/image/backgroundDark.jpg';

import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

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

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </>
      )}

      {/* Private Route */}
      <Route
        path="/"
        element={
          <PrivateRoute>
              <ChatProvider>

            <ModalProvider>

            <div className="flex h-screen overflow-hidden">
              
              <MediaModal/>
              <BackgroundContent />

                <SidebarProvider>
                  <Sidebar />
                </SidebarProvider>
                <ChatInfoProvider>
                  <ChatContent />
                </ChatInfoProvider>
              
            </div>
                </ModalProvider>
              </ChatProvider>
          </PrivateRoute>
        }
      />

      {/* Redirect if authenticated goes to login */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
};


const ChatContent: React.FC = () => {
  const { activeChat } = useChat();
  return activeChat ? <Chat /> : null;
};

const BackgroundContent: React.FC = () => {
  const { resolvedTheme } = useTheme();
  return (
    <img
      className="w-full h-full object-cover absolute inset-0 z-0"
      src={resolvedTheme === 'dark' ? backgroundDark : backgroundLight}
      alt="Background"
    />
  );
};

export default App;
