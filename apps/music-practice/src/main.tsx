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


// After a deploy, `s3 sync --delete` removes the previous build's hashed
// chunks and CloudFront answers those URLs with index.html, so a tab still on
// the old build fails every lazy route import ("'text/html' is not a valid
// JavaScript MIME type"). Reload once to pick up the new build; the timestamp
// guard stops a reload loop if the chunk is genuinely broken.
const CHUNK_RELOAD_KEY = 'chunk-reload-at';
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    return; // no storage → no loop guard, so leave the router's error showing
  }
  event.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
