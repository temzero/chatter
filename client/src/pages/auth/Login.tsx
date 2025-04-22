// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { currentUserProfileData } from '@/data/currentUser';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
  

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-5 text-center dark:text-white">Log In</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Forgot Password?
        </Link>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Need an account?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Sign Up
        </Link>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={exampleSubmit}
        className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Example Login'}
      </button>

    </div>
  );
};

export default Login;