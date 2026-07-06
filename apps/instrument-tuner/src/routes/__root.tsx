import { useEffect, useRef } from 'react';
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../hooks/use-theme';
import { ReferencePitchProvider } from '../hooks/use-reference-pitch';

const RootLayout = () => {
  const navigate = useNavigate();
  const redirectProcessedRef = useRef(false);

  // Restore deep links bounced through the GitHub Pages root 404 redirector
  // (docs/404.html rewrites /tools/instrument-tuner/<route> to /?redirect=<route>)
  useEffect(() => {
    if (redirectProcessedRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const redirectRoute = searchParams.get('redirect');

    if (redirectRoute && redirectRoute !== '/') {
      redirectProcessedRef.current = true;
      void navigate({ to: redirectRoute as never });
    }
  }, [navigate]);

  return (
    <ThemeProvider>
      <ReferencePitchProvider>
        <Outlet />
        <Toaster richColors position="top-center" />
      </ReferencePitchProvider>
    </ThemeProvider>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});
