# Audio Visualizer

Beautiful radial waveform visualizations with complementary color palettes.

## Features

- **Radial Waveform Visualization** - Colored thin lines visualizing amplitude of multiple audio files in a circular pattern
- **Random Complementary Color Palettes** - Automatic color generation using LCH color space with chroma.js
- **Multi-track Audio Support** - Upload and visualize multiple audio files simultaneously
- **Interactive Controls** - Adjust visualization parameters in real-time
- **Drag-and-Drop** - Easy file upload via drag-and-drop interface
- **Export** - Save visualizations as images (future: GIF/video export)

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type-safe development
- **p5.js** - Canvas graphics rendering
- **chroma.js** - LCH color space manipulation
- **Vite** - Fast build tooling
- **Tailwind CSS v4** - Styling
- **@hudak/audio-viz-core** - Core audio analysis utilities

## Usage

1. Click "Upload Audio" or drag-and-drop audio files
2. Supported formats: MP3, WAV, OGG, M4A
3. Adjust visualization settings:
   - Line thickness
   - Rotation speed
   - Color palette regeneration
4. Click "Export Image" to save your visualization

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

# Lint
pnpm run lint
```

## Architecture

```
apps/audio-visualizer/
├── src/
│   ├── components/
│   │   ├── AudioUploader.tsx    # File upload interface
│   │   ├── VisualizerCanvas.tsx # p5.js canvas wrapper
│   │   ├── ControlPanel.tsx     # Visualization controls
│   │   └── ExportButton.tsx     # Image export functionality
│   ├── hooks/
│   │   ├── useAudioFiles.ts     # Audio file management
│   │   └── useVisualization.ts  # Visualization state
│   ├── utils/
│   │   └── p5-visualizer.ts     # p5.js visualization logic
│   ├── App.tsx
│   └── main.tsx
```

## Future Enhancements

- Beat detection for reactive visuals
- Frequency band isolation (bass, mids, highs)
- Shader-based effects for GPU acceleration
- Export as GIF/video
- MIDI visualization support
- AI-generated visualizations based on audio mood
- Integration with music-practice app

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

ISC
