import React from 'react';
import { useAuthStore } from '../stores/authStore';

const SubscriptionPage = () => {
  const { userProfile } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>💎 Upgrade to Premium</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Get unlimited games and access to all word packs!
          </p>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              $4.99
            </div>
            <div style={{ opacity: 0.9 }}>per year</div>
          </div>

          <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem' }}>
            {[
              'Unlimited games',
              'All word packs & themes',
              'Up to 20 players per game',
              'Custom word packs',
              'Game history & stats',
              'No ads',
              'Priority support'
            ].map((feature, i) => (
              <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button className="btn btn-primary btn-full btn-lg" disabled>
            Upgrade Now (Stripe Integration Pending)
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
            Secure payment powered by Stripe
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
