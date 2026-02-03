import { createFileRoute, Link } from "@tanstack/react-router";
import { WordSearch } from "../components/WordSearch";

export const Route = createFileRoute("/word-search")({
  component: WordSearchPage,
});

function WordSearchPage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/" className="back-link">
          ← Back
        </Link>
      </div>
      <h1>🔤 Word Search</h1>
      <WordSearch />
    </div>
  );
}
