// SidebarRegister.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarRegisterProps {
  onSubmit: () => void;
}

const SidebarRegister: React.FC<SidebarRegisterProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth(); // Assuming you have a `register` function in the AuthContext

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add your register logic (e.g., API call)
    register(); // Update the auth context
    onSubmit(); // Notify parent component that registration is done
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
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
          Register
        </button>
      </form>
    </div>
  );
};

export default SidebarRegister;
