import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{
        padding: '1rem 0',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
            🎭 Charades Party
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost" style={{ color: 'white' }}>
                  Dashboard
                </Link>
                <Link to="/profile" className="btn" style={{ background: 'white', color: '#667eea' }}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/leaderboard" className="btn btn-ghost" style={{ color: 'white' }}>
                  Leaderboard
                </Link>
                <Link to="/auth" className="btn" style={{ background: 'white', color: '#667eea' }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              color: 'white',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 900,
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              Play Charades with Friends in Real-Time!
            </h1>

            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.25rem',
              marginBottom: '2.5rem',
              lineHeight: 1.6
            }}>
              The ultimate multiplayer charades game for your phone. Create a game, share the link, and start playing instantly!
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to={user ? "/create" : "/auth"}
                className="btn btn-lg"
                style={{ background: 'white', color: '#667eea', fontSize: '1.125rem' }}
              >
                🎮 Create Game
              </Link>
              <Link
                to="/join"
                className="btn btn-lg btn-outline"
                style={{ borderColor: 'white', color: 'white' }}
              >
                ➕ Join Game
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Designed for your phone. Play anywhere, anytime!'
              },
              {
                icon: '⚡',
                title: 'Real-Time Sync',
                description: 'Everything syncs instantly across all devices.'
              },
              {
                icon: '👥',
                title: 'Teams or Solo',
                description: 'Play as teams or individuals. You decide!'
              },
              {
                icon: '🎯',
                title: 'Track Progress',
                description: 'Level up, unlock achievements, and climb leaderboards!'
              },
              {
                icon: '🎨',
                title: 'Custom Words',
                description: 'Add your own words or choose from themed packs.'
              },
              {
                icon: '🔥',
                title: 'Addictive Fun',
                description: 'Perfect for parties, gatherings, and game nights!'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="card"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  padding: '2rem'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '4rem 0', background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="container">
          <h2 style={{
            color: 'white',
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem'
          }}>
            Simple Pricing
          </h2>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Free Tier */}
            <div className="card" style={{ background: 'white', padding: '2.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                $0
              </div>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Try it out!
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', textAlign: 'left' }}>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>3 games per month</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Classic word pack</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Up to 8 players</span>
                </li>
              </ul>
              <Link to="/auth" className="btn btn-outline btn-full">
                Get Started
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2.5rem',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              transform: 'scale(1.05)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#f59e0b',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                BEST VALUE
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Premium</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                $4.99
              </div>
              <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
                per year
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', textAlign: 'left' }}>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>Unlimited games</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>All word packs & themes</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>Up to 20 players</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>Custom word packs</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>Game history & stats</span>
                </li>
                <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>No ads</span>
                </li>
              </ul>
              <Link to="/subscription" className="btn btn-full" style={{ background: 'white', color: '#667eea' }}>
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
            Ready to Play?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: '2rem' }}>
            Join thousands of players already having fun!
          </p>
          <Link
            to={user ? "/create" : "/auth"}
            className="btn btn-lg"
            style={{ background: 'white', color: '#667eea' }}
          >
            Start Playing Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem 0',
        background: 'rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <div className="container">
          <p>&copy; 2024 Charades Party. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
