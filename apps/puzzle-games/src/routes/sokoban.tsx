import { createFileRoute, Link } from "@tanstack/react-router";
import { Sokoban } from "../components/Sokoban";

export const Route = createFileRoute("/sokoban")({
  component: SokobanPage,
});

function SokobanPage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/" className="back-link">
          ← Back
        </Link>
      </div>
      <h1>📦 Sokoban</h1>
      <Sokoban />
    </div>
  );
}
