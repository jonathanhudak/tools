import { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export function PlayerSelector() {
  const { currentPlayer, allPlayers, addNewPlayer, switchPlayer } = usePlayer();
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (): void => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      return;
    }

    if (allPlayers.some(p => p.name === trimmedName)) {
      alert('A player with this name already exists!');
      return;
    }

    addNewPlayer(trimmedName);
    setNewPlayerName('');
    setIsAddingPlayer(false);
  };

  const handlePlayerChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    switchPlayer(event.target.value);
  };

  if (isAddingPlayer) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Enter name"
          style={{
            padding: '8px 12px',
            border: '2px solid #000',
            borderRadius: 4,
            fontSize: 16,
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddPlayer();
            } else if (e.key === 'Escape') {
              setIsAddingPlayer(false);
              setNewPlayerName('');
            }
          }}
        />
        <button onClick={handleAddPlayer} style={{ padding: '8px 16px' }}>
          ✓
        </button>
        <button
          onClick={() => {
            setIsAddingPlayer(false);
            setNewPlayerName('');
          }}
          style={{ padding: '8px 16px' }}
        >
          ✗
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {allPlayers.length > 0 && (
        <select
          value={currentPlayer?.name ?? ''}
          onChange={handlePlayerChange}
          style={{
            padding: '8px 12px',
            border: '2px solid #000',
            borderRadius: 4,
            fontSize: 16,
            minWidth: 150,
          }}
        >
          {allPlayers.map((player) => (
            <option key={player.name} value={player.name}>
              {player.name}
            </option>
          ))}
        </select>
      )}
      <button onClick={() => setIsAddingPlayer(true)} style={{ padding: '8px 16px' }}>
        + Add Player
      </button>
    </div>
  );
}
