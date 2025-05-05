// src/routes/PrivateLayout.tsx
import { ChatProvider } from "@/contexts/ChatContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ChatInfoProvider } from "@/contexts/ChatInfoContext";
import { ROUTES } from "@/constants/routes";
import MediaModal from "@/components/modal/MediaModal";
import Sidebar from "@/components/sidebar/Sidebar";
import Chat from "@/components/chat/Chat";
import BackgroundContent from "@/components/ui/BackgroundContent";
import { Navigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";

interface PrivateLayoutProps {
  isAuthenticated: boolean;
}

const ChatContent: React.FC = () => {
  const { activeChat } = useChat();
  return activeChat ? <Chat /> : null;
};

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }


  return (
    <ChatProvider>
      <ModalProvider>
        <div className="flex h-screen overflow-hidden">
          <MediaModal />
          <BackgroundContent />

          <SidebarProvider>
            <Sidebar />
          </SidebarProvider>
          
          <ChatInfoProvider>
            <ChatContent/>
          </ChatInfoProvider>
        </div>
      </ModalProvider>
    </ChatProvider>
  );
};

export default PrivateLayout;