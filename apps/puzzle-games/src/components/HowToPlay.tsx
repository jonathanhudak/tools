import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@hudak/ui";
import { Button } from "@hudak/ui";

type GameType = "sokoban" | "word-search" | "nonogram";

interface HowToPlayProps {
  game: GameType;
}

const INSTRUCTIONS: Record<GameType, { title: string; content: string[] }> = {
  sokoban: {
    title: "How to Play Sokoban",
    content: [
      "Push all the boxes onto the target spots!",
      "Tap a direction to move.",
      "You can only PUSH boxes, not pull them.",
      "If you get stuck, hit restart!",
    ],
  },
  "word-search": {
    title: "How to Play Word Search",
    content: [
      "Find all the hidden words in the grid!",
      "Words can go horizontal, vertical, or diagonal.",
      "Tap the first letter, then tap the last letter to select a word.",
    ],
  },
  nonogram: {
    title: "How to Play Nonogram",
    content: [
      "Fill in the squares to reveal a hidden picture!",
      "The numbers tell you how many squares to fill in each row and column.",
      "Groups of filled squares must have at least one empty square between them.",
    ],
  },
};

export function HowToPlay({ game }: HowToPlayProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const storageKey = `howtoplay-${game}-dismissed`;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setOpen(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, "true");
    }
    setOpen(false);
  };

  const instructions = INSTRUCTIONS[game];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="How to play"
        className="absolute top-4 right-4"
      >
        <Info className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{instructions.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {instructions.content.map((text, index) => (
              <p key={index} className="text-base leading-relaxed">
                {text}
              </p>
            ))}
          </div>

          <DialogFooter className="flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dont-show"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="size-4 cursor-pointer"
              />
              <label htmlFor="dont-show" className="text-sm cursor-pointer">
                Don't show this again
              </label>
            </div>
            <Button onClick={handleClose} className="w-full" size="lg">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
