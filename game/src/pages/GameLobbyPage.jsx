import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToGame, joinGame, updateGame } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const GameLobbyPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [game, setGame] = useState(null);
  const [playerName, setPlayerName] = useState(userProfile?.displayName || '');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      setGame(gameData);

      if (gameData.status === 'playing') {
        navigate(`/game/${gameId}/play`);
      }
    });

    return () => unsubscribe();
  }, [gameId, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await joinGame(gameId, user.uid, playerName);
      setHasJoined(true);
      toast.success('Joined game!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStartGame = async () => {
    try {
      await updateGame(gameId, { status: 'playing' });
      toast.success('Starting game!');
    } catch (error) {
      toast.error('Failed to start game');
    }
  };

  if (!game) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading game...</div>;
  }

  const isHost = game.hostId === user?.uid;
  const players = Object.values(game.players || {});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Game Lobby</h1>
            <div style={{
              display: 'inline-block',
              background: 'var(--primary)',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '0.1em'
            }}>
              {gameId}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Share this code with friends to join
            </p>
          </div>

          {!hasJoined && !players.find(p => p.userId === user?.uid) ? (
            <form onSubmit={handleJoin} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Join Game
              </button>
            </form>
          ) : (
            <>
              <h3 style={{ marginBottom: '1rem' }}>
                Players ({players.length})
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
                {players.map((player) => (
                  <div
                    key={player.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius)'
                    }}
                  >
                    <div className="avatar">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{player.name}</div>
                      {player.userId === game.hostId && (
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Host</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={players.length < 4}
                  className="btn btn-primary btn-full btn-lg"
                >
                  {players.length < 4 ? `Waiting for ${4 - players.length} more players...` : 'Start Game →'}
                </button>
              )}

              {!isHost && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center'
                }}>
                  Waiting for host to start game...
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← Leave lobby
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameLobbyPage;
