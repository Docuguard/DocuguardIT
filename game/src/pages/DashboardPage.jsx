import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getUserProfile, checkFreeGamesRemaining } from '../services/firebase';
import { getLevelInfo } from '../data/achievements';

const DashboardPage = () => {
  const { user, userProfile } = useAuthStore();
  const [freeGamesLeft, setFreeGamesLeft] = useState(3);
  const [levelInfo, setLevelInfo] = useState(null);

  useEffect(() => {
    if (user && userProfile) {
      checkFreeGamesRemaining(user.uid).then(setFreeGamesLeft);
      setLevelInfo(getLevelInfo(userProfile.xp || 0));
    }
  }, [user, userProfile]);

  if (!userProfile) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700 }}>
              🎭 Charades Party
            </Link>
            <Link to="/profile" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Profile
            </Link>
          </div>

          <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>
            Welcome back, {userProfile.displayName}!
          </h1>

          {levelInfo && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  Level {levelInfo.level} - {levelInfo.title}
                </span>
                <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  {levelInfo.xp} XP
                </span>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                height: '8px',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'white',
                  height: '100%',
                  width: `${levelInfo.progress * 100}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
                {levelInfo.xpNeededForNext} XP until level {levelInfo.nextLevel}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Free Games Warning */}
        {!userProfile.isPremium && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            marginBottom: '2rem',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
                  {freeGamesLeft} Free Games Remaining This Month
                </h3>
                <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Upgrade to Premium for unlimited games!
                </p>
              </div>
              <Link to="/subscription" className="btn" style={{ background: 'white', color: '#d97706' }}>
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <Link to="/create" className="card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Create Game</h3>
            <p style={{ opacity: 0.9 }}>Start a new charades game</p>
          </Link>

          <Link to="/join" className="card" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>➕</div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Join Game</h3>
            <p style={{ opacity: 0.9 }}>Join with a game code</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <h2 style={{ marginBottom: '1.5rem' }}>Your Stats</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {userProfile.gamesPlayed || 0}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Games Played</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>
              {userProfile.gamesWon || 0}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Games Won</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              {userProfile.totalPoints || 0}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Total Points</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)', marginBottom: '0.5rem' }}>
              {userProfile.achievements?.length || 0}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Achievements</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/leaderboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              📊 View Leaderboard →
            </Link>
            <Link to="/profile" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              👤 Edit Profile →
            </Link>
            {!userProfile.isPremium && (
              <Link to="/subscription" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                💎 Upgrade to Premium →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
