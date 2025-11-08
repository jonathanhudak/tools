# Instrument Tuner

Free online instrument tuner with real-time pitch detection. Perfect for guitar, bass, violin, and more.

## Features

- **Real-time Pitch Detection** - Uses Web Audio API and advanced pitch detection algorithms
- **Visual Feedback** - Beautiful pitch gauge with color-coded accuracy
- **Multiple Tunings** - Standard and Drop D guitar tunings
- **Auto String Detection** - Automatically highlights which string you're playing
- **Adjustable Sensitivity** - Customize detection threshold (±3-20 cents)
- **Smooth Dial Movement** - Configurable smoothing for graceful gauge animation
- **Dark Mode Support** - Automatic theme detection

## Supported Tunings

### Guitar
- **Standard** (E A D G B E)
- **Drop D** (D A D G B E)

## How to Use

1. **Allow Microphone Access** - Click allow when your browser requests microphone permissions
2. **Play a String** - Strum or pluck any string on your instrument
3. **Watch the Gauge** - The dial shows how far sharp (♯) or flat (♭) you are from perfect tuning
4. **Tune** - Adjust your tuning pegs until the gauge reads "In tune! ✓"

## Settings

- **Pitch Sensitivity**: Controls how strict the "in tune" detection is (default: ±10 cents)
- **Dial Smoothing**: Controls how smoothly the gauge needle moves (default: 70%)
- **Auto-detect String**: Automatically highlights which guitar string you're tuning

## Technology

- **React + TypeScript** - Type-safe component architecture
- **TanStack Router** - Modern routing solution
- **Vite** - Lightning-fast development and builds
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS v4** - Utility-first styling
- **Web Audio API** - Real-time audio processing
- **Pitchy** - High-quality pitch detection
- **Tonal** - Music theory utilities

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 94+
- Safari 14.1+

Requires modern browser with Web Audio API and getUserMedia support.

## Privacy

This app runs entirely in your browser. No data is sent to any server. Microphone access is only used for real-time pitch detection.

## License

ISC
