import { useState } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <h1>InstrumentPractice Pro</h1>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <h2>Modules</h2>
            <ul>
              <li className="active">Sight Reading</li>
              <li>Scales (Coming Soon)</li>
              <li>Key Signatures (Coming Soon)</li>
              <li>Chords (Coming Soon)</li>
            </ul>
          </nav>

          <div className="sidebar-section">
            <h3>Instrument</h3>
            <select className="instrument-select">
              <option value="piano">Piano (MIDI)</option>
              <option value="violin">Violin (Microphone)</option>
              <option value="guitar">Guitar (Microphone)</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Settings</h3>
            <p>Settings panel coming soon...</p>
          </div>
        </aside>

        <main className="main-content">
          <div className="practice-area">
            <h2>Sight Reading Practice</h2>
            <p>React migration in progress...</p>
            <p>The music-practice app is being converted to React + Vite.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
