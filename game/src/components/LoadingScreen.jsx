import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          margin: '0 auto',
          width: '3rem',
          height: '3rem',
          borderColor: 'rgba(255,255,255,0.3)',
          borderTopColor: 'white'
        }}></div>
        <p style={{
          color: 'white',
          marginTop: '1rem',
          fontSize: '1.125rem',
          fontWeight: 600
        }}>
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
