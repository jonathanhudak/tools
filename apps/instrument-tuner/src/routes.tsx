import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import TunerPage from './pages/tuner';

// Root route
export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  ),
});

// Index route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TunerPage,
});

// Route tree
export const routeTree = rootRoute.addChildren([indexRoute]);
