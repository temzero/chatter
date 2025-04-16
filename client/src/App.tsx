import Home from '@/pages/Home';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ChatProvider } from '@/contexts/ChatContext';

function App() {

  return (
    <ThemeProvider>
      <SidebarProvider>
        <ChatProvider>
          <Home />
        </ChatProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
