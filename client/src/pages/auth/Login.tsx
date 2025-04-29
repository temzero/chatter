import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { currentUserProfileData } from '@/data/currentUser';
import { AuthenticationLayout } from './AuthenticationLayout';
import qrCode from '@/assets/icon/qr-code.svg';
import { QRCode } from '@/components/ui/QrCode';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false); // State to control QR code visibility
  const { login, setCurrentUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in');
      console.error(err);
    }
    setLoading(false);
  };

  const exampleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate setting a predefined example user
      setCurrentUser(currentUserProfileData);
      setIsAuthenticated(true);

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(currentUserProfileData));
      localStorage.setItem('isAuthenticated', 'true');

      navigate('/');
    } catch (err) {
      setError('Failed to login with example');
      console.error(err);
    }

    setLoading(false);
  };

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <AuthenticationLayout
      showExampleButton
      onExampleSubmit={exampleSubmit}
      loading={loading}
    >
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-[300px] rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)] overflow-hidden"
      >
        <form onSubmit={handleSubmit} className='flex flex-col justify-center w-[400px] gap-2 p-8'>
          <h2 className="text-4xl font-semibold mb-4">Login</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          <motion.input
            whileTap={{ scale: 0.98 }}
            type="email"
            id="email"
            placeholder='Email or Username'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />
          <motion.input
            whileTap={{ scale: 0.98 }}

            type="password"
            id="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input backdrop-blur-lg"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}

            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>

          <div className="flex items-center justify-between gap-4 mt-2">
            <Link to="/register" className="opacity-40 hover:opacity-100 hover:text-green-400">
              Register
            </Link>
            <Link to="/forgot-password" className="opacity-40 hover:opacity-100 hover:text-green-400">
              Forgot Password?
            </Link>
          </div>
        </form>

        <motion.div
          className="h-full p-6 flex flex-col gap-3 justify-end custom-border-l hover:bg-[var(--sidebar-color)] cursor-pointer select-none"
          onClick={toggleQrCode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h1 className='text-xl font-semibold text-center'>Scan to login</h1>
          {showQrCode ? (
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className='w-[200px] rounded' 
              src={qrCode} 
              alt="Chatter Logo" 
            />
          ) : (
            <QRCode className="w-[200px]" />
          )}
        </motion.div>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default Login;