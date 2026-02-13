import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../hooks/use-theme';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <Outlet />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  ),
});
