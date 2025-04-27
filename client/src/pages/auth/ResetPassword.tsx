import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPasswordWithToken } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!token) {
      return setError('Invalid reset token');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPasswordWithToken(token, password);
      setMessage('Password successfully reset. You can now login with your new password.');
      setTimeout(() => navigate('/login'), 3000);
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

        <form onSubmit={handleSubmit} className='flex flex-col justify-center w-[360px] gap-2 p-8'>
          <h2 className="text-4xl font-semibold mb-4">Reset Password</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{message}</div>}
          <input
            type="password"
            id="password"
            placeholder='New Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder='Confirm New Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input backdrop-blur-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
          <div className="flex items-center gap-4 mt-2">
            <Link to="/login" className="opacity-40 hover:opacity-100 hover:text-green-400">
              Back to Login
            </Link>
          </div>
        </form>

        <i className="material-symbols-outlined text-[250px] z-10 backdrop-blur-md">password</i>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default ResetPassword;