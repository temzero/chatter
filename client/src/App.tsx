import Home from '@/pages/Home';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GlobalProvider } from './contexts/GlobalContext';

function App() {
  return (
    <GlobalProvider>
      <ThemeProvider>
          <Home />
      </ThemeProvider>
    </GlobalProvider>
  );
}

export default App;
