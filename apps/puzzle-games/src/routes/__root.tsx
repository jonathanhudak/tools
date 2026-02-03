import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeToggle } from "@hudak/ui";

export const Route = createRootRoute({
  component: () => (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  ),
});
