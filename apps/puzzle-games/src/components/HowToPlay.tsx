import { useState, useEffect } from "react";
import { Modal } from "./Modal";

type Game = "sokoban" | "word-search" | "nonogram";

const INSTRUCTIONS: Record<Game, { title: string; content: string }> = {
  sokoban: {
    title: "📦 How to Play Sokoban",
    content: `Push all the boxes onto the target spots!

• Tap next to your character to move
• You can only PUSH boxes, not pull them
• Each box needs to go on a circle target
• If you get stuck, hit Undo or Reset!

Tip: Think ahead before you push!`,
  },
  "word-search": {
    title: "🔤 How to Play Word Search",
    content: `Find all the hidden words in the grid!

• Words can go across, down, or diagonal
• Tap the first letter of a word
• Drag to the last letter and let go
• Found words turn black

Tip: Start with the longest words!`,
  },
  nonogram: {
    title: "🖼️ How to Play Nonogram",
    content: `Fill in squares to reveal a hidden picture!

• Numbers show how many squares to fill
• "3 1" means: 3 filled, gap, then 1 filled
• Use Fill mode to color squares black
• Use Mark mode (✕) for squares you know are empty

Tip: Start with rows that have big numbers!`,
  },
};

function getStorageKey(game: Game) {
  return `puzzle-games-help-seen-${game}`;
}

interface HowToPlayProps {
  game: Game;
  showOnFirstVisit?: boolean;
}

export function HowToPlay({ game, showOnFirstVisit = true }: HowToPlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem(getStorageKey(game));
    setHasSeenHelp(!!seen);
    if (!seen && showOnFirstVisit) {
      setIsOpen(true);
    }
  }, [game, showOnFirstVisit]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(getStorageKey(game), "true");
    setHasSeenHelp(true);
  };

  const instruction = INSTRUCTIONS[game];

  return (
    <>
      <button
        className="help-button"
        onClick={() => setIsOpen(true)}
        title="How to Play"
        aria-label="How to Play"
      >
        ?
      </button>
      <Modal isOpen={isOpen} onClose={handleClose} title={instruction.title}>
        <div className="help-content">
          {instruction.content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {!hasSeenHelp && (
          <label className="dont-show-again">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  localStorage.setItem(getStorageKey(game), "true");
                }
              }}
            />
            Don't show again
          </label>
        )}
      </Modal>
    </>
  );
}
