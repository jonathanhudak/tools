import { createFileRoute, Link } from "@tanstack/react-router";
import { Blockworld } from "../components/Blockworld";

export const Route = createFileRoute("/blockworld")({
  component: BlockworldPage,
});

function BlockworldPage() {
  return (
    <div className="blockworld-page">
      <div className="blockworld-topbar">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.1rem" }}>🧱 Blockworld</h1>
      </div>
      <Blockworld />
    </div>
  );
}
