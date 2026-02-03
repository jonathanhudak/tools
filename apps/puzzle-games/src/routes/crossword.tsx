import { createFileRoute } from "@tanstack/react-router";
import { Crossword } from "../components/Crossword";

export const Route = createFileRoute("/crossword")({
  component: CrosswordPage,
});

function CrosswordPage() {
  return (
    <div className="container">
      <Crossword />
    </div>
  );
}
