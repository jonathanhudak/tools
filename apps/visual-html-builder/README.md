# Visual HTML Editor

A powerful, intuitive visual HTML editor that allows you to build and customize web pages with real-time preview and inline editing capabilities.

## Features

### Inline Visual Editing
- **Text Editing**: Click any text element to edit it directly in place
- **Image Upload**: Click on images to upload and replace them instantly
- **Immediate Preview**: See all changes in real-time as you edit

### Element Management
- **Add Elements**: Use the toolbar to add various HTML elements:
  - H1 (Main Heading)
  - H2 (Subheading)
  - P (Paragraph)
  - Button
  - Container (Div)
  - Image

### Full Style Customization
The style panel provides complete control over element appearance:
- **Typography**:
  - Font size (10-72px)
  - Font weight (Normal, Bold, Lighter)
  - Text color
  - Text alignment (Left, Center, Right, Justify)

- **Spacing**:
  - Padding (0-100px)
  - Margin bottom (0-100px)

- **Borders**:
  - Border width (0-10px)
  - Border color
  - Border radius (0-50px)

- **Background**:
  - Background color

- **Images**:
  - Width adjustment (50-1200px)

### Export Functionality
- Export your complete web page as a standalone HTML file
- Downloaded file includes all styles and content
- Ready to deploy or share

## How to Use

1. **Open the Editor**: Open `index.html` in a web browser

2. **Add Elements**:
   - Click toolbar buttons on the left to add elements to your page
   - Elements appear in the canvas area (center)

3. **Edit Content**:
   - Click on any text element to edit it inline
   - Click on images to upload new ones

4. **Customize Styles**:
   - Click on any element to select it
   - Use the style panel on the right to adjust appearance
   - Changes apply immediately

5. **Delete Elements**:
   - Select an element
   - Click the "Delete Element" button in the style panel

6. **Export Your Page**:
   - Click the download button (⬇) at the bottom of the toolbar
   - Your page will be downloaded as `my-webpage.html`

## Interface Layout

```
┌──────────┬─────────────────────┬──────────────┐
│          │                     │              │
│ Toolbar  │   Canvas Area       │ Style Panel  │
│          │   (Preview)         │              │
│          │                     │              │
│  H1      │  ┌───────────────┐  │  Font Size   │
│  H2      │  │               │  │  Color       │
│  P       │  │  Your page    │  │  Padding     │
│  B       │  │  content      │  │  Border      │
│  □       │  │  here         │  │  etc...      │
│  🖼       │  │               │  │              │
│          │  └───────────────┘  │  [Delete]    │
│  ⬇       │                     │              │
│          │                     │              │
└──────────┴─────────────────────┴──────────────┘
```

## Technical Details

- **Single File Application**: Everything is contained in one HTML file
- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **Responsive**: Works on different screen sizes
- **Modern Design**: Clean, intuitive interface

## Browser Compatibility

Works with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Tips

- **Hover Effects**: Hover over elements to see edit indicators
- **Visual Feedback**: Selected elements are highlighted with a blue outline
- **Undo**: Use your browser's undo (Ctrl/Cmd + Z) while editing text
- **Image Formats**: Supports all common image formats (JPG, PNG, GIF, SVG, etc.)

## Use Cases

- **Landing Pages**: Create simple landing pages quickly
- **Prototypes**: Build visual prototypes without coding
- **Email Templates**: Design HTML email templates
- **Learning**: Great tool for learning HTML and CSS
- **Quick Mockups**: Create quick visual mockups

## Getting Started

Simply open `index.html` in your favorite web browser and start creating!

No installation, no setup, no dependencies required.
