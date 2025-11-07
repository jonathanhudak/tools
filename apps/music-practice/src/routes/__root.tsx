import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AppHeader } from '../components/app-header';
import { ThemeProvider } from '../hooks/use-theme';

const RootLayout = () => (
  <ThemeProvider>
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  </ThemeProvider>
);

export const Route = createRootRoute({ component: RootLayout });
