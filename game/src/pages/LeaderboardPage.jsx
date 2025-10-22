import React from 'react';

const LeaderboardPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>🏆 Leaderboard</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Leaderboard feature coming soon...
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
