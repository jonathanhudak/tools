import { createFileRoute, Link } from "@tanstack/react-router";
import { Nonogram } from "../components/Nonogram";

export const Route = createFileRoute("/nonogram")({
  component: NonogramPage,
});

function NonogramPage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/" className="back-link">
          ← Back
        </Link>
      </div>
      <h1>🖼️ Nonogram</h1>
      <Nonogram />
    </div>
  );
}
