# Ikigai Tool

An interactive web application to help you discover your Ikigai - your reason for being. Map out what you love, what you're good at, what you can be paid for, and what the world needs to find your purpose at the intersection of these elements.

## Features

- **Interactive Diagram**: Click anywhere on the Ikigai circles to add items
- **Drag & Drop**: Move items around to find their perfect position
- **Auto-categorization**: Items are automatically categorized based on where you place them
- **Persistent Storage**: Your Ikigai is automatically saved to localStorage
- **Export**: Download your Ikigai as a JSON file
- **Clean UI**: Modern, dark-themed interface with smooth interactions
- **Real-time Organization**: Sidebar shows all your items grouped by category

## What is Ikigai?

Ikigai (生き甲斐) is a Japanese concept meaning "a reason for being." It's found at the intersection of:

- **What you love** (Passion)
- **What you're good at** (Profession)
- **What you can be paid for** (Vocation)
- **What the world needs** (Mission)

The sweet spot where all four circles overlap is your **Ikigai** - your purpose in life.

## Usage

1. **Add Items**: Click on any of the four colored circles to add an item
2. **Organize**: Drag items to reposition them within or between circles
3. **Review**: Check the sidebar to see your items organized by category
4. **Export**: Save your Ikigai diagram as JSON for later use
5. **Clear**: Remove all items to start fresh

### Categories

- **What you love** (Pink): Activities, subjects, or pursuits that bring you joy
- **What you're good at** (Blue): Your skills, talents, and natural abilities
- **What you can be paid for** (Green): Marketable skills and career opportunities
- **What the world needs** (Yellow): Ways you can contribute to society

### Intersections

Items that fall in the overlapping areas represent:

- **Passion**: What you love + What you're good at
- **Profession**: What you're good at + What you can be paid for
- **Vocation**: What you can be paid for + What the world needs
- **Mission**: What the world needs + What you love
- **Ikigai** (center): All four elements combined

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Required APIs**: localStorage, modern JavaScript (ES2020)

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **React Flow**: Interactive node-based diagram
- **Vite**: Fast build tool and dev server

## Architecture

The application consists of several key components:

- `App.tsx`: Main application with React Flow provider
- `IkigaiFlow`: Core diagram component with state management
- `IkigaiItemNode`: Custom node component for user items
- `IkigaiBackground`: SVG background with four circles
- `Modal`: Input dialog for adding new items
- `Sidebar`: Category-based item list with actions

### State Management

- Uses React Flow's built-in node and edge state management
- localStorage persistence for automatic saving
- No external state management library needed

### Data Structure

Each item is stored as a React Flow node with:
```typescript
{
  id: string;           // Unique identifier
  type: 'ikigaiItem';   // Node type
  position: { x, y };   // Position on canvas
  data: {
    label: string;      // Item text
    region: 'love' | 'good' | 'paid' | 'need'
  }
}
```

## Privacy

- **No tracking**: No analytics or telemetry
- **Local storage only**: All data stays in your browser
- **No accounts**: No sign-up or authentication required
- **Offline capable**: Works without internet connection after initial load

## Tips for Finding Your Ikigai

1. **Be honest**: Don't add what you think should be there, add what truly resonates
2. **Be specific**: "Writing" is vague, "Writing technical documentation" is specific
3. **Be realistic**: Balance passion with practicality
4. **Iterate**: Your Ikigai can evolve over time - revisit and update regularly
5. **Look for patterns**: Items that could fit in multiple circles are powerful insights

## Keyboard Shortcuts

- **Enter**: Save item in modal
- **Escape**: Close modal
- **Click + Drag**: Move items on diagram

## Export Format

When you export your Ikigai, you'll get a JSON file with this structure:

```json
{
  "exported": "2025-01-04T12:00:00.000Z",
  "nodes": [
    {
      "id": "item-1234567890",
      "label": "Your item text",
      "region": "love",
      "position": { "x": 250, "y": 250 }
    }
  ]
}
```

## License

MIT

## Contributing

This tool is part of a larger monorepo of web-based utilities. See the root README for contribution guidelines.

## Resources

- [Ikigai: The Japanese Secret to a Long and Happy Life](https://www.penguin.co.uk/books/295663/ikigai-by-garcia-hector-and-miralles-francesc/9781786330895)
- [React Flow Documentation](https://reactflow.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Live Demo**: [View Tool](https://your-username.github.io/tools/ikigai-tool/)

Built with ❤️ using AI-assisted development
