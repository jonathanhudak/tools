import { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { Modal } from "./Modal";

export function PlayerSelect() {
  const { currentPlayer, players, selectPlayer, addPlayer } = usePlayer();
  const [showModal, setShowModal] = useState(!currentPlayer);
  const [newName, setNewName] = useState("");

  const handleAddPlayer = () => {
    const name = newName.trim();
    if (name) {
      addPlayer(name);
      setNewName("");
      setShowModal(false);
    }
  };

  const handleSelectPlayer = (name: string) => {
    selectPlayer(name);
    setShowModal(false);
  };

  return (
    <>
      <button
        className="player-button"
        onClick={() => setShowModal(true)}
        title="Player Profile"
      >
        {currentPlayer ? `👤 ${currentPlayer.name}` : "👤 Player"}
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => currentPlayer && setShowModal(false)}
        title="👤 Player Profile"
      >
        {players.length > 0 && (
          <div className="player-list">
            <p>Select a player:</p>
            {players.map((p) => (
              <button
                key={p.name}
                className={`player-option ${p.name === currentPlayer?.name ? "selected" : ""}`}
                onClick={() => handleSelectPlayer(p.name)}
              >
                {p.name}
                {p.name === currentPlayer?.name && " ✓"}
              </button>
            ))}
          </div>
        )}

        <div className="add-player">
          <p>{players.length > 0 ? "Or add a new player:" : "Enter your name:"}</p>
          <div className="add-player-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              autoFocus={players.length === 0}
            />
            <button onClick={handleAddPlayer} disabled={!newName.trim()}>
              Add
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
