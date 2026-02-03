import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({ 
  routeTree,
  basepath: '/tools/puzzle-games'
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <PlayerProvider>
        <RouterProvider router={router} />
      </PlayerProvider>
    </ThemeProvider>
  </StrictMode>
);
