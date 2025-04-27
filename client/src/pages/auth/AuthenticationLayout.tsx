import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import backgroundLight from '@/assets/image/backgroundSky.jpg';
import backgroundDark from '@/assets/image/backgroundDark.jpg';
import { Logo } from '@/components/ui/Logo';
import { useNavigate } from 'react-router-dom'; // or your routing hook

interface AuthenticationLayoutProps {
  children: ReactNode;
  showExampleButton?: boolean;
  onExampleSubmit?: () => void;
  loading?: boolean;
}

export const AuthenticationLayout = ({
  children,
  showExampleButton = false,
  onExampleSubmit,
  loading = false,
}: AuthenticationLayoutProps) => {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate(); // Get the navigate function

  const handleLogoClick = () => {
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className='relative w-full h-screen overflow-hidden'>
      {/* Background Image */}
      <div className='fixed inset-0 -z-10'>
        <img
          className="w-full h-full object-cover"
          src={resolvedTheme === 'dark' ? backgroundDark : backgroundLight}
          alt="Background"
        />
      </div>

      {/* Content */}
      <div className='relative w-full h-full flex items-center justify-center'>
        <div 
          className='flex gap-1 items-center absolute top-20 z-10 select-none cursor-pointer'
          onClick={handleLogoClick} // Add click handler
        >
          <Logo className="w-[50px] text-white" />
          <h1 className='text-5xl text-white'>Chatter</h1>
        </div>

        {children}

        {showExampleButton && onExampleSubmit && (
          <button
            type="button"
            disabled={loading}
            onClick={onExampleSubmit}
            className="absolute bottom-10 primary px-2"
          >
            {loading ? 'Logging in...' : 'Skip this'}
            <i className="material-symbols-outlined ml-1">arrow_right_alt</i>
          </button>
        )}
      </div>
    </div>
  );
};