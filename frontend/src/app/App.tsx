import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './components/theme-provider';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="lineup-theme">
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
