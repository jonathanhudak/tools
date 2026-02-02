# Puzzle Games

A collection of classic puzzle games, optimized for touch devices and e-ink displays like the Daylight Computer.

## Current Games

### Sokoban

A classic box-pushing puzzle game that teaches planning and spatial reasoning. Push all boxes onto target locations to complete each level.

#### Features

- **Touch-Optimized Controls**
  - Tap adjacent cells to move
  - Swipe gestures for directional movement
  - Large touch targets (minimum 44x44px)
  - No hover states (touch-first design)

- **Multiple Input Methods**
  - Touch/swipe gestures
  - Arrow keys
  - WASD keys
  - Tap adjacent cells

- **Game Features**
  - 10 beginner-friendly levels
  - Undo functionality (Ctrl+Z or button)
  - Level reset
  - Move counter
  - Progress tracking in localStorage
  - Best moves tracking

- **Visual Design**
  - Black and white only (e-ink friendly)
  - High contrast for readability
  - Clean, minimal aesthetic
  - Grid-based layout with clear boundaries
  - Simple unicode symbols for game elements

## Game Elements

- `☺` - Player
- `□` - Box
- `·` - Target location
- `■` - Box on target
- `█` - Wall
- `☻` - Player on target

## Controls

### Keyboard
- **Arrow Keys / WASD**: Move player
- **Ctrl+Z**: Undo last move
- **R**: Reset level

### Touch/Mouse
- **Tap adjacent cell**: Move player in that direction
- **Swipe**: Move player in swipe direction
- **Undo button**: Undo last move
- **Reset button**: Restart level
- **Tap and hold Undo**: Undo multiple moves

## Architecture

### Technology Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- Shared UI components from `@hudak/ui`

### Project Structure

```
src/
├── components/
│   ├── SokobanGame.tsx      # Main game container
│   ├── SokobanGrid.tsx      # Game grid display
│   ├── SokobanControls.tsx  # Control buttons
│   └── LevelSelector.tsx    # Level selection screen
├── hooks/
│   ├── useSokoban.ts        # Game state management
│   └── useSwipeGesture.ts   # Touch gesture handling
├── utils/
│   ├── game-logic.ts        # Core game logic
│   └── levels.ts            # Level definitions
├── types/
│   └── sokoban.ts           # TypeScript types
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

## Level Format

Levels use standard Sokoban text format:

```
#####
#   #
# $.#
# @ #
#####
```

- `#` = wall
- ` ` = floor
- `$` = box
- `.` = target
- `@` = player
- `*` = box on target
- `+` = player on target

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Browser Compatibility

- Modern browsers with ES2020+ support
- Touch events for mobile/tablet
- localStorage for progress tracking
- No external dependencies for gameplay

## Future Enhancements

- Additional puzzle games (Nonogram, Sudoku, etc.)
- Custom level editor
- Level sharing via URL
- Timer mode
- Hints system
- Sound effects (optional, toggleable)

## Credits

Created as part of the Tools monorepo for Theodore's puzzle game collection.
