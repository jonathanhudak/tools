import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client';

// Create a new router instance
// Basepath follows Vite's base: '/tools/music-practice/' on GitHub Pages,
// '/' on the standalone AWS deploy (deploy script builds with --base /)
const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
