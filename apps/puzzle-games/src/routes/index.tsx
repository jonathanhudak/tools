import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1>🎮 Puzzle Games</h1>
      <p style={{ textAlign: "center", marginBottom: 24 }}>
        Touch-friendly puzzles for Theodore
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Link to="/sokoban" className="link-button">
          <button style={{ width: "100%" }}>
            📦 Sokoban
            <br />
            <small>Push boxes to targets</small>
          </button>
        </Link>

        <Link to="/word-search" className="link-button">
          <button style={{ width: "100%" }}>
            🔤 Word Search
            <br />
            <small>Find hidden words</small>
          </button>
        </Link>

        <Link to="/crossword" className="link-button">
          <button style={{ width: "100%" }}>
            📝 Crossword
            <br />
            <small>Advanced vocabulary puzzles</small>
          </button>
        </Link>

        <Link to="/nonogram" className="link-button">
          <button style={{ width: "100%" }}>
            🖼️ Nonogram
            <br />
            <small>Reveal pixel pictures</small>
          </button>
        </Link>
      </div>
    </div>
  );
}
