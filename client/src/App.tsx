import Home from '@/pages/Home';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
        <Home />
    </ThemeProvider>
  );
}

export default App;
