import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from 'sonner';
import { AppHeader } from '../components/app-header';
import { ThemeProvider } from '../hooks/use-theme';
import { useEffect, useRef } from 'react';

const RootLayout = () => {
  const navigate = useNavigate();
  const redirectProcessedRef = useRef(false);

  // Handle deep link redirect from 404.html
  useEffect(() => {
    if (redirectProcessedRef.current) return;
    
    // Check for redirect parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const redirectRoute = searchParams.get('redirect');
    
    if (redirectRoute && redirectRoute !== '/') {
      redirectProcessedRef.current = true;
      // Navigate to the redirect route (e.g., /chord-quiz)
      navigate({ to: redirectRoute as any });
    }
  }, [navigate]);

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
        <TanStackRouterDevtools />
      </div>
    </ThemeProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
