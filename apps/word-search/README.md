# Word Search Generator

Generate and solve word search puzzles with custom word lists, touch-optimized for Daylight Computer.

## Features

- **Touch-Optimized Controls**: Drag to select words horizontally, vertically, and diagonally
- **Multiple Difficulty Levels**: Easy (8x8, H/V only), Medium (10x10, +diagonal), Hard (12x12, +backwards)
- **Preset Themes**: Animals, Space, Dinosaurs
- **Custom Word Lists**: Create puzzles with your own words
- **Black & White Design**: High contrast for e-ink displays
- **Optional Timer**: Track solving time
- **Victory Detection**: Automatic celebration when all words are found

## How to Play

1. **Choose Difficulty**: Easy, Medium, or Hard
2. **Select Theme**: Pick a preset theme or use Custom to enter your own words
3. **Generate Puzzle**: Click "Generate New Puzzle" to create a new game
4. **Find Words**: Touch and drag across letters to select words
5. **Win**: Find all words to see the victory screen!

## Technical Details

### Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS v4 (via @hudak/ui)

### Algorithm
1. Sort words by length (longest first)
2. Place words randomly in allowed directions
3. Allow overlapping letters if they match
4. Fill remaining cells with random letters
5. Verify all words are findable

### Touch Controls
- **Touch and Drag**: Select letters to form words
- **Release**: Confirm word selection
- **Tap Word**: (Future) Get hint by highlighting first letter

## Browser Compatibility

- Modern browsers with ES2020+ support
- Touch-enabled devices
- Optimized for Daylight Computer e-ink display

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Type check
pnpm run typecheck
```

## File Structure

```
apps/word-search/
├── src/
│   ├── components/
│   │   ├── Grid.tsx          # Grid with touch selection
│   │   ├── WordList.tsx      # List of words to find
│   │   └── WordSearch.tsx    # Main game component
│   ├── lib/
│   │   ├── generator.ts      # Word search generation algorithm
│   │   └── themes.ts         # Preset word themes
│   ├── styles/
│   │   └── index.css         # Black and white styles
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Future Enhancements

- [ ] Hint system (highlight first letter)
- [ ] Pinch to zoom on larger grids
- [ ] Save/load custom word lists
- [ ] Difficulty-based scoring
- [ ] Best time tracking per theme
- [ ] Share puzzle capability
- [ ] Print-friendly mode

## License

ISC
