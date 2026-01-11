# InstrumentPractice Pro

A comprehensive web-based instrument practice application designed to improve sight reading, scales, key signatures, and chord recognition through interactive exercises. Supports keyboard instruments via MIDI input and stringed/bowed instruments (violin, guitar) via microphone-based pitch detection.

## Features

### 🎵 Multi-Instrument Support
- **Instrument Profiles**: Choose from Piano (MIDI), Violin (microphone), or Guitar (microphone)
- **Dual Input Methods**:
  - **MIDI**: For keyboard instruments with real-time note detection (< 50ms latency)
  - **Microphone**: For stringed/bowed instruments with pitch detection (< 200ms latency)
- **Automatic Device Detection**: Instantly recognizes MIDI devices or requests microphone access
- **Adaptive Validation**: MIDI exact-match for keyboards, pitch tolerance (±50 cents) for strings
- **Virtual Keyboard Fallback**: Practice without a physical MIDI device

### 👁️ Sight Reading Practice
- **Dual Visualization Modes**:
  - **Staff Notation**: Traditional music notation rendered with VexFlow
  - **Falling Notes**: Game-like visualization for beginners (Synthesia-style)
- **Instrument-Specific Settings**:
  - **Piano**: Treble/bass clef, full keyboard range (A0-C8)
  - **Violin**: Treble clef, typical range (G3-D6)
  - **Guitar**: Treble clef, standard tuning range (E2-E6)
  - Natural notes only (no sharps/flats in basic mode)
- **Real-time Feedback**: Instant validation with visual and audio cues
- **Performance Metrics**: Track accuracy, speed, and streaks
- **Monophonic Detection**: Single-note validation for microphone input (ideal for scales and melodies)

### 📊 Progress Tracking & Spaced Repetition
- **Session History**: Automatically saves all practice sessions per instrument profile
- **Detailed Statistics**:
  - Correct/incorrect note counts
  - Average response time
  - Best streak records
  - Module-specific analytics
  - Instrument-specific metrics (e.g., pitch accuracy for violin/guitar)
- **SRS Integration**: Spaced repetition scheduling for weak areas (scales, difficult notes)
- **Profile-Specific Queues**: Separate practice schedules for each instrument
- **Local Storage**: All data stored privately in your browser (no account required)
- **Export Capability**: Download your practice data as JSON or CSV

### 🎨 Modern Interface
- **Dark/Light Mode**: Toggle between themes for comfortable practice in any lighting
- **Responsive Design**: Works on desktop, tablet, and laptop screens (1024px+)
- **Clean Layout**: Minimal distractions to maximize focus
- **Keyboard Shortcuts**:
  - `Space`: Start session or advance to next note
  - `Escape`: Stop current session

### 🎼 Coming Soon
- **Scales Quiz**: Practice major and minor scales with validation (MIDI/microphone)
- **Key Signatures**: Master key recognition and circle of fifths
- **Chords Quiz**: Learn triads, seventh chords, and progressions (keyboard) or arpeggios (strings)
- **Arpeggios Practice**: Broken chord patterns for all instruments
- **Guitar Tuning Assistant**: Real-time tuning validation for EADGBE
- **Violin Intonation Trainer**: Practice perfect pitch with tolerance feedback
- **Progress Dashboard**: Visual charts and analytics with SRS calendar

## Getting Started

### Requirements
- Modern web browser (Chrome, Edge recommended for Web MIDI/Audio API support)
- **For Piano**: MIDI-compatible keyboard (optional - virtual keyboard available)
- **For Violin/Guitar**: Microphone access (built-in or external mic)
- Quiet practice environment for optimal pitch detection accuracy

### Installation

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Connect** your MIDI device (if available)
4. **Start Practicing!**

No installation, no dependencies, no build process required. Just open and play!

### Browser Compatibility

| Browser | MIDI Support | Microphone/Web Audio | Recommended |
|---------|--------------|---------------------|-------------|
| Chrome | ✅ Full | ✅ Full | ✅ Yes |
| Edge | ✅ Full | ✅ Full | ✅ Yes |
| Firefox | ⚠️ Limited | ✅ Full | ⚠️ Partial |
| Safari | ⚠️ Limited | ⚠️ Limited | ⚠️ Partial |
| iOS Safari | ❌ No | ⚠️ Limited | ❌ No |

**Note**: For best MIDI and microphone performance, use Chrome or Edge on desktop.

## How to Use

### Selecting Your Instrument

1. On first launch, select your instrument profile: **Piano**, **Violin**, or **Guitar**
2. The app will configure input method and note ranges automatically
3. You can switch instruments at any time from the settings panel

### Setting Up MIDI (Piano)

1. Connect your MIDI keyboard to your computer via USB or Bluetooth
2. Open the app in your browser
3. The app will automatically detect and connect to your device
4. Check the MIDI status indicator in the top right (should show green when connected)
5. If auto-connection fails, use the device selector in the left sidebar

### Setting Up Microphone (Violin/Guitar)

1. Open the app in your browser
2. Allow microphone access when prompted (HTTPS required)
3. Position your microphone 6-12 inches from your instrument
4. Check the microphone status indicator (should show green when active)
5. **Guitar**: Complete the tuning check for EADGBE open strings
6. **Violin**: Calibrate with A4 (440Hz) reference
7. Ensure quiet environment for best pitch detection accuracy

### Sight Reading Practice

1. Click **"Sight Reading"** in the left sidebar (default module)
2. Customize your practice:
   - Select clef (treble or bass)
   - Choose note range based on your instrument and level
   - Toggle "Falling Notes Mode" for alternative visualization
   - Adjust pitch tolerance (for microphone input)
3. Click **"Start Practice"** to begin
4. A note will appear on the staff
5. Play the note on your instrument:
   - **Piano**: Press the correct key
   - **Violin/Guitar**: Play the note clearly and sustain briefly
6. Receive instant feedback (correct/incorrect with pitch accuracy)
7. The app automatically advances to the next note after correct answers
8. Click **"Next Note"** to skip challenging notes
9. Click **"Stop"** to end the session and view your statistics

### Tips for Best Results

- **Warm Up**: Start with a narrow range appropriate to your instrument
- **Focus on Accuracy**: Speed will naturally improve with practice
- **Track Progress**: Review your session history to identify weak areas
- **Daily Practice**: Consistent 20-30 minute sessions yield best results
- **Use Streaks**: Try to maintain accuracy streaks to build confidence
- **Microphone Users**:
  - Practice in a quiet room to minimize background noise
  - Play notes clearly and sustain for at least 0.5 seconds
  - Check tuning regularly (especially guitar)
  - Position mic consistently for reliable detection

## Architecture

### Technology Stack

- **Frontend**: React + TypeScript (Vite)
- **Routing**: TanStack Router
- **Data/Async**: TanStack React Query
- **Input**:
  - **MIDI**: Web MIDI API (for keyboard instruments)
  - **Audio**: Web Audio API with pitch detection (for strings/bowed)
- **Libraries**:
  - **VexFlow** 4.2+: SVG-based music notation rendering
  - **Tonal.js**: Music theory utilities (scales, chords, intervals)
  - **Pitchy**: Real-time monophonic pitch detection (McLeod autocorrelation)
- **Storage**: LocalStorage/IndexedDB API

### Project Structure

```
music-practice/
├── index.html                    # Vite entry
├── package.json                  # App dependencies/scripts
├── src/
│   ├── main.tsx                  # App bootstrap (router + query client)
│   ├── routes/                   # TanStack Router routes
│   ├── components/               # UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── input/                # MIDI/audio managers
│   │   ├── notation/             # VexFlow renderers
│   │   ├── utils/                # Music theory + scoring utilities
│   │   └── game/                 # Note ranges + rendering helpers
│   └── test/                     # Test setup
└── README.md
```

### Key Components

- **MidiManager**: Handles MIDI device connection, note events, and input validation
- **AudioManager**: Manages microphone access and real-time audio processing (NEW)
- **PitchDetector**: Wraps Pitchy library for frequency-to-MIDI conversion (NEW)
- **InstrumentConfig**: Defines profiles for Piano/Violin/Guitar (ranges, tuning, etc.) (NEW)
- **StaffRenderer**: Renders musical notation using VexFlow library
- **FallingNotesRenderer**: Provides game-like falling notes visualization
- **SightReadingModule**: Manages practice sessions, scoring, and feedback (instrument-agnostic)
- **MusicTheory**: Utilities for note generation, validation, and conversions (with Tonal.js)
- **Storage**: Local data persistence for sessions and settings

## Development

### Customization

The app is designed to be easily customizable:

- **Add New Instruments**: Create profile in `src/lib/utils/instrument-config.ts`
- **Add New Modules**: Add modules under `src/lib/`
- **Modify Note Ranges**: Update `src/lib/game/note-range.ts` or `src/lib/utils/music-theory.ts`
- **Change Themes**: Adjust CSS variables in `src/index.css` or theme provider
- **Tune Pitch Detection**: Update `src/lib/utils/pitch-detector.ts`

### Testing Without Physical Instruments

**Without MIDI keyboard:**
1. Enable **Virtual Keyboard** in the sidebar
2. Use `MidiManager.simulateNote(midiNote)` in browser console
3. Click virtual piano keys to simulate input

**Without microphone:**
1. Use `AudioManager.simulateFrequency(hz)` in browser console
2. Pre-recorded audio file upload (coming soon)

Example:
```javascript
// Simulate playing middle C (MIDI 60 / 261.63 Hz)
app.midiManager.simulateNote(60);
app.audioManager.simulateFrequency(261.63);

// Simulate guitar low E (MIDI 40 / 82.41 Hz)
app.audioManager.simulateFrequency(82.41);
```

## Performance Notes

- **MIDI Latency**: < 50ms input to visual feedback
- **Microphone Latency**: < 200ms pitch detection to feedback
- **Render Speed**: < 200ms for notation updates
- **Pitch Accuracy**: ±1 semitone detection accuracy (±50 cents tolerance)
- **Memory**: < 50MB typical usage
- **Storage**: < 5MB for 100 sessions per instrument profile

## Privacy

- **No Account Required**: All features work offline (after initial page load)
- **Local Data Only**: Practice data never leaves your device
- **No Tracking**: No analytics or external API calls
- **Permissions**: Browser will request MIDI/microphone access on first use (HTTPS required for mic)

## Troubleshooting

### MIDI Device Not Detected

1. Check physical connections (USB/Bluetooth)
2. Ensure device is powered on
3. Try disconnecting and reconnecting
4. Refresh the browser page
5. Try a different browser (Chrome recommended)
6. Check browser permissions: `chrome://settings/content/midi`

### Notes Not Registering

- Verify MIDI device is selected in sidebar dropdown
- Check MIDI status indicator (should be green)
- Ensure you're playing in the correct octave
- Enable "Allow Octave Error" for more forgiving validation

### Microphone Not Working

1. Check browser permissions: `chrome://settings/content/microphone`
2. Ensure HTTPS connection (required for microphone access)
3. Test microphone in system settings
4. Try a different browser (Chrome recommended)
5. Check microphone is not muted/blocked by other apps
6. Reload page and re-grant permissions

### Pitch Detection Issues

- Ensure quiet environment (background noise affects accuracy)
- Play notes clearly and sustain for 0.5-1 second
- Check instrument tuning (especially guitar)
- Adjust pitch tolerance in settings (increase for beginners)
- Position microphone 6-12 inches from instrument
- For guitar: Pluck single strings cleanly (avoid harmonics/muted notes)
- For violin: Use steady bow pressure and clear tone

### Visual Issues

- Try toggling between staff and falling notes mode
- Clear browser cache and reload
- Zoom to 100% (keyboard shortcuts may affect rendering)
- Check browser console for errors (F12)

## Credits

- **VexFlow**: Music notation rendering library
- **Tonal.js**: Music theory and computational utilities
- **Pitchy**: Real-time pitch detection library
- **Web MIDI API**: Browser MIDI support
- **Web Audio API**: Browser audio processing and microphone access
- **Inspiration**: Sightread, Piano Marvel, Synthesia, Yousician

## License

This is a personal project built for practice and learning. Feel free to use and modify for your own purposes.

## Contributing

This is currently a personal tool, but suggestions and feedback are welcome!

Areas for future enhancement:
- **Polyphonic pitch detection** for guitar chords and piano chords via microphone
- Additional quiz modules (scales, keys, chords, arpeggios) for all instruments
- Advanced sight reading (multi-note chords, rhythms, dynamics)
- Metronome integration with rhythm exercises
- Audio playback and ear training exercises
- Fretboard/fingerboard visualization for guitar/violin
- Bow technique analysis (violin/cello)
- Cloud sync for multi-device practice
- Mobile app version (iOS/Android)

## Version History

- **v1.0** (MVP/POC) - November 2025
  - Initial release
  - Multi-instrument support (Piano, Violin, Guitar)
  - Dual input methods (MIDI + microphone pitch detection)
  - Sight reading module with instrument-specific ranges
  - Dual visualization modes (staff + falling notes)
  - Basic progress tracking and SRS scheduling
  - Dark/light themes
  - Profile-based practice sessions

---

**Happy Practicing! 🎹🎻🎸🎶**
