import React from 'react';
import { useParams } from 'react-router-dom';

const GamePlayPage = () => {
  const { gameId } = useParams();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1>Game Play Page</h1>
        <p>Game ID: {gameId}</p>
        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
          This is the main game interface. Implementation in progress...
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/dashboard" className="btn btn-primary">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default GamePlayPage;
