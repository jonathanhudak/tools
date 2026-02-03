import { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export function WelcomeScreen() {
  const { addNewPlayer } = usePlayer();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      addNewPlayer(trimmedName);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: 24,
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>🎮</h1>
      <h2 style={{ marginBottom: 8 }}>Welcome to Puzzle Games!</h2>
      <p style={{ marginBottom: 32, color: '#666' }}>
        Enter your name to start playing
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 300 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #000',
            borderRadius: 8,
            fontSize: 18,
            marginBottom: 16,
            textAlign: 'center',
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 18,
            opacity: name.trim() ? 1 : 0.5,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Start Playing
        </button>
      </form>
    </div>
  );
}
