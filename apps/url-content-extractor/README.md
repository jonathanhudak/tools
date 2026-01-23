# URL Content Extractor

A beautiful, mobile-optimized tool for extracting clean, readable text from any URL. Perfect for quickly grabbing article content, blog posts, or any web page text without the clutter.

## Features

- **Simple & Clean**: Paste a URL, click extract, get clean text
- **Mobile-First**: Optimized for iPhone and mobile devices
- **Dark Mode**: Automatic theme detection with manual toggle
- **Privacy-First**: All processing happens client-side (via CORS proxy)
- **Copy to Clipboard**: One-click copy of extracted content
- **Beautiful Design**: Soft rounded corners, spacious layout, minimal aesthetic

## How It Works

1. Paste any URL into the input field
2. Click "Extract Content"
3. The app fetches the page via a CORS proxy
4. Extracts the main content (removes navigation, headers, footers, etc.)
5. Displays clean, readable text
6. Copy to clipboard with one click

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
- AllOrigins CORS Proxy

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
```

## Limitations

- Relies on external CORS proxy (allorigins.win)
- Content extraction quality depends on page structure
- Some sites with heavy JavaScript rendering may not work perfectly
- Rate limits may apply from the CORS proxy

## Future Improvements

- [ ] Migrate to serverless backend for better reliability
- [ ] Add support for PDF extraction
- [ ] Save extracted content locally
- [ ] Export to markdown/plain text files
- [ ] Better content parsing with Mozilla Readability

## License

ISC
