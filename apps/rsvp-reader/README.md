# RSVP Reader

A speed reading app powered by RSVP (Rapid Serial Visual Presentation) technology with zero-jiggle ORP highlighting. Extract text from URLs, paste content, or upload files, then read at up to 3x your normal speed.

## Features

### RSVP Speed Reading
- **Zero-Jiggle ORP Highlighting**: Red letter stays perfectly centered as words change (like ReadFast)
- **Adjustable Speed**: 100-1000 WPM with real-time slider (default 400 WPM)
- **Smart Punctuation Pauses**: Longer pauses for periods (2.5x), medium for commas (1.5x)
- **Keyboard Controls**: Space to play/pause, arrows to navigate, Esc to exit
- **Progress Tracking**: Visual progress bar and word count
- **Full-Screen Reading Mode**: Immersive, distraction-free experience

### Text Input Options
- **URL Extraction**: Extract clean text from any article or blog post
- **Paste Text**: Directly paste content from clipboard
- **File Upload**: Upload .txt files for reading
- **Smart Content Parsing**: Automatically removes navigation, ads, and clutter

### Design & UX
- **Mobile-First**: Optimized for all devices
- **Dark Mode**: Automatic detection with manual toggle
- **Privacy-First**: All processing happens client-side (no data stored)
- **Beautiful UI**: Soft rounded corners, spacious layout, modern aesthetic

## How It Works

### RSVP Technology
RSVP displays one word at a time in rapid succession, allowing you to read faster by:
- Eliminating eye movement (no saccades)
- Highlighting the Optimal Recognition Point (ORP) of each word in red
- Keeping the ORP perfectly centered for smooth reading

### Usage
1. Choose input method: URL, Text, or File Upload
2. Load your content
3. Click "Read with RSVP"
4. Adjust speed with the WPM slider
5. Press Space to start reading
6. Use arrow keys to navigate backward/forward

## Browser Compatibility

- Modern browsers (Chrome, Safari, Firefox, Edge)
- iOS Safari (optimized for iPhone)
- Requires JavaScript enabled

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (icons)
- AllOrigins CORS Proxy (for URL extraction)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Technical Details

### Zero-Jiggle Implementation
The critical feature of this RSVP reader is the perfectly stable red letter highlighting. This is achieved using:
- Monospace font (`font-mono`) for consistent character widths
- CSS `translateX` transform to shift each word so the ORP letter aligns at center
- No CSS transitions on the word display to prevent any jiggling
- Fixed viewport positioning

### ORP Calculation
The Optimal Recognition Point (ORP) is typically located at 1/3 of the word length:
- "example" (7 letters) → ORP at index 2 (the 'a')
- "the" (3 letters) → ORP at index 1 (the 'h')

## Limitations

- URL extraction relies on external CORS proxy (allorigins.win)
- Content extraction quality depends on page structure
- Some sites with heavy JavaScript rendering may not work perfectly
- Currently supports only .txt file uploads (no PDF/DOCX yet)

## Future Improvements

- [ ] Add PDF and DOCX file support
- [ ] Local storage for bookmarks and reading history
- [ ] Customizable fonts and colors
- [ ] Statistics dashboard (reading speed, time saved, etc.)
- [ ] Support for multiple languages
- [ ] Better content parsing with Mozilla Readability

## Inspiration

This app is inspired by ReadFast (https://www.readfast.co/) and implements the critical "zero-jiggle" ORP highlighting that makes RSVP reading smooth and comfortable.

## License

ISC
