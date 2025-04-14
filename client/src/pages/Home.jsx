import Sidebar from '@/components/sidebar/Sidebar';
import Chat from '@/components/chat/Chat';

function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default Home;
