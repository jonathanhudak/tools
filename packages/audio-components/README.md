# @hudak/audio-components

Reusable audio visualization and interaction components for music applications.

## Components

### PitchGauge

Real-time pitch visualization with tuning feedback. Shows note name, cents deviation, and color-coded accuracy gauge.

**Features:**
- Real-time pitch visualization
- Color-coded accuracy feedback (red/flat, green/in-tune, yellow/sharp)
- Smooth animations using requestAnimationFrame
- Customizable styling with Tailwind classes
- Optional clarity indicator

**Usage:**

```tsx
import { PitchGauge } from '@hudak/audio-components';

function Tuner() {
  return (
    <PitchGauge
      note="A4"
      cents={12}
      clarity={0.85}
      className="my-custom-class"
    />
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `note` | `string` | Yes | Note name (e.g., "A4", "C#3") |
| `cents` | `number` | Yes | Pitch deviation in cents (-50 to +50) |
| `className` | `string` | No | Optional Tailwind classes for the container |
| `clarity` | `number` | No | Optional clarity indicator (0-1) |

## Installation

This is a workspace package. In your app's `package.json`:

```json
{
  "dependencies": {
    "@hudak/audio-components": "workspace:*"
  }
}
```

## Development

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Type check
npm run typecheck
```

## License

MIT
