import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <AuthenticationLayout>
      <motion.div 
       initial={{ scale: 1.2, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
      className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)]">
        <form onSubmit={handleSubmit} className='flex flex-col justify-center w-[400px] gap-2 p-8'>
          <h2 className="text-4xl font-semibold text-center mb-6">Forgot Password</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{message}</div>}
          <motion.input
            whileTap={{ scale: 0.98 }}

            type="email"
            id="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.98 }}

            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </motion.button>
          <div className="flex items-center gap-4 mt-2">
            <Link to="/login" className="opacity-40 hover:opacity-100 hover:text-green-400">
              Back to Login
            </Link>
          </div>
        </form>

      </motion.div>
    </AuthenticationLayout>
  );
};

export default ForgotPassword;