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
    content: `🎯 GOAL: Fill in squares to reveal a hidden picture!

📐 WHAT THE NUMBERS MEAN:
The numbers on the edge tell you how many squares to fill in that row or column.

Examples:
• "5" = fill 5 squares in a row
• "2 3" = fill 2 squares, leave a gap, then fill 3 more
• "1 1 1" = fill 1, gap, fill 1, gap, fill 1

🎮 HOW TO PLAY:
1. Tap "■ Fill" button to turn on fill mode
2. Tap squares to fill them in black
3. Tap "✕ Mark" to mark squares you know are empty
4. Use the numbers as clues to figure out which squares to fill

💡 BEGINNER TIPS:
• Start with rows/columns that have the biggest numbers
• If you see "5" in a 5-square row, fill the whole row!
• Mark empty squares with ✕ so you don't forget
• Complete rows and columns one at a time

🔄 Made a mistake? Hit the Reset button to start over!`,
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
