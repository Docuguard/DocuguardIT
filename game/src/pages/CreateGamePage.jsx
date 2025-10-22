import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { wordPacks } from '../data/wordPacks';

const CreateGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    timer: 60,
    wordPacks: ['classic'],
    allowCustomWords: true,
    rounds: 'unlimited'
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const gameId = await createGame(user.uid, settings);
      toast.success('Game created! 🎉');
      navigate(`/game/${gameId}/lobby`);
    } catch (error) {
      toast.error('Failed to create game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Create New Game</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure your game settings
          </p>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Timer Duration (seconds)</label>
              <select
                className="form-select"
                value={settings.timer}
                onChange={(e) => setSettings({ ...settings, timer: parseInt(e.target.value) })}
              >
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds (Default)</option>
                <option value={90}>90 seconds</option>
                <option value={120}>120 seconds</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Word Packs</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.values(wordPacks).map((pack) => (
                  <label
                    key={pack.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settings.wordPacks.includes(pack.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({ ...settings, wordPacks: [...settings.wordPacks, pack.id] });
                        } else {
                          setSettings({
                            ...settings,
                            wordPacks: settings.wordPacks.filter(p => p !== pack.id)
                          });
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {pack.name}
                        {pack.isPremium && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>Premium</span>}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {pack.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.allowCustomWords}
                  onChange={(e) => setSettings({ ...settings, allowCustomWords: e.target.checked })}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Allow players to submit custom words</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || settings.wordPacks.length === 0}
                className="btn btn-primary btn-full"
              >
                {loading ? 'Creating...' : 'Create Game →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePage;
