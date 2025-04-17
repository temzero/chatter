import Sidebar from '@/components/sidebar/Sidebar';
import Chat from '@/components/chat/Chat';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ChatInfoProvider } from '@/contexts/ChatInfoContext';
import { useTheme } from '@/contexts/ThemeContext';
import backgroundLight from '@/assets/image/backgroundLight.jpg';
import backgroundDark from '@/assets/image/backgroundDark.jpg';

const Home: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />

      <ChatProvider>
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
        <ChatInfoProvider>
          <ChatContent />
        </ChatInfoProvider>
      </ChatProvider>
    </div>
  );
};

// Chat content component
const ChatContent: React.FC = () => {
  const { activeChat } = useChat();

  if (activeChat) {
    return <Chat />;
  }

  return null;
};

// Background component (now properly layered behind content)
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

export default Home;