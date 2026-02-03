import { createRootRoute, Outlet } from "@tanstack/react-router";
import { PlayerProvider } from "../contexts/PlayerContext";
import { PlayerSelector } from "../components/PlayerSelector";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { usePlayer } from "../contexts/PlayerContext";

function RootLayout() {
  return (
    <PlayerProvider>
      <RootContent />
    </PlayerProvider>
  );
}

function RootContent() {
  const { isPlayerSelected } = usePlayer();

  if (!isPlayerSelected) {
    return (
      <div className="container">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '12px 0',
        borderBottom: '2px solid #eee',
      }}>
        <PlayerSelector />
      </div>
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
