import ChatBox from "@/components/chat/ChatBox";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Sidebar from "@/components/sidebar/Sidebar";

const DesktopView: React.FC = () => {
  return (
    <>
      <Sidebar />
      <section className="flex-1 flex h-full">
        <ChatBox />
        <ChatSidebar />
      </section>
    </>
  );
};

export default DesktopView;
