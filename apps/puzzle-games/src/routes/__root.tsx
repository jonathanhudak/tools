import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "../components/ThemeToggle";
import { PlayerSelect } from "../components/PlayerSelect";
import { HowToPlay } from "../components/HowToPlay";

type GameRoute = "sokoban" | "word-search" | "nonogram";

const GAME_ROUTES: GameRoute[] = ["sokoban", "word-search", "nonogram"];

function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/tools\/puzzle-games/, "").replace(/^\//, "") || "/";
  
  // Determine if we're on a game page
  const currentGame = GAME_ROUTES.find((g) => pathname === g || pathname === `/${g}`);

  return (
    <div className="container">
      <header className="app-header">
        {currentGame && <HowToPlay game={currentGame} showOnFirstVisit={true} />}
        <PlayerSelect />
        <ThemeToggle />
      </header>
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
