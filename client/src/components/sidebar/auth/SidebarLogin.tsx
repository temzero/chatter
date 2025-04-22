// SidebarLogin.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { currentUserProfileData } from '@/data/currentUser';

interface SidebarLoginProps {
  onSubmit: () => void;
}

const SidebarLogin: React.FC<SidebarLoginProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setCurrentUser } = useAuth();
  

  const handleLogin = () => {
    const fakeUser = currentUserProfileData; // Replace with actual login logic
    localStorage.setItem('user', JSON.stringify(fakeUser));
    setCurrentUser(fakeUser);
    setIsAuthenticated(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {/* <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Login
        </button>
      </form> */}
      <button className="w-full py-2 bg-blue-500 text-white rounded" onClick={handleLogin}>Log in</button>

      <div className="mt-4 text-center">
        <button onClick={() => onSubmit('forgotPassword')} className="text-blue-500">Forgot Password?</button>
      </div>
    </div>
  );
};

export default SidebarLogin;
