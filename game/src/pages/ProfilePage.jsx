import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { logout } from '../services/firebase';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ marginBottom: '2rem' }}>Profile</h1>

          {userProfile && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="avatar avatar-xl" style={{ margin: '0 auto 1rem' }}>
                  {userProfile.displayName?.charAt(0).toUpperCase()}
                </div>
                <h2>{userProfile.displayName}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{userProfile.email}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Account Status</h3>
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)' }}>
                  {userProfile.isPremium ? (
                    <span className="badge badge-success">Premium Member</span>
                  ) : (
                    <span className="badge badge-info">Free Tier</span>
                  )}
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-danger btn-full">
                Logout
              </button>
            </div>
          )}
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

export default ProfilePage;
