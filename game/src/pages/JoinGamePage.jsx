import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const JoinGamePage = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams();
  const [gameCode, setGameCode] = useState(urlGameId || '');

  const handleJoin = (e) => {
    e.preventDefault();
    if (gameCode.trim()) {
      navigate(`/game/${gameCode.toUpperCase()}/lobby`);
    } else {
      toast.error('Please enter a game code');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Join Game</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Enter the game code to join
        </p>

        <form onSubmit={handleJoin}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter game code (e.g., ABC123)"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.1em'
              }}
              maxLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg">
            Join Game →
          </button>
        </form>

        <div style={{ marginTop: '2rem' }}>
          <a href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default JoinGamePage;
