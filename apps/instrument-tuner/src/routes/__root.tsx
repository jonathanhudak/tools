import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../hooks/use-theme';
import { ReferencePitchProvider } from '../hooks/use-reference-pitch';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <ReferencePitchProvider>
        <Outlet />
        <Toaster richColors position="top-center" />
      </ReferencePitchProvider>
    </ThemeProvider>
  ),
});
