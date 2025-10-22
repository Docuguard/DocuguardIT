import React, { useEffect, useState, useRef } from 'react';

const Timer = ({ duration, isActive, onComplete, showLarge = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [wakeLock, setWakeLock] = useState(null);
  const audioRef = useRef(null);

  // Request screen wake lock to keep screen on during game
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
          console.log('Screen wake lock activated');
        }
      } catch (err) {
        console.error('Failed to activate wake lock:', err);
      }
    };

    if (isActive) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          console.log('Screen wake lock released');
        });
      }
    };
  }, [isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft === 0) {
        // Play buzzer sound
        playBuzzer();
        onComplete && onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const playBuzzer = () => {
    // Create buzzer sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 400; // Buzzer frequency
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error('Failed to play buzzer:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isExpired = timeLeft === 0;

  if (showLarge) {
    // Large timer for performer's screen
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isExpired ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: isWarning ? 'pulse 1s infinite' : 'none'
      }}>
        <div style={{
          fontSize: 'clamp(4rem, 20vw, 12rem)',
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          fontFamily: 'monospace'
        }}>
          {formatTime(timeLeft)}
        </div>
        {isExpired && (
          <div style={{
            position: 'absolute',
            bottom: '4rem',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center'
          }}>
            TIME'S UP!
          </div>
        )}
      </div>
    );
  }

  // Normal timer display
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: isExpired ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--primary)',
          fontFamily: 'monospace',
          animation: isWarning ? 'pulse 1s infinite' : 'none'
        }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem'
        }}>
          {isExpired ? 'Time\'s up!' : isActive ? 'Time remaining' : 'Ready'}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'var(--bg-tertiary)',
        height: '8px',
        borderRadius: '999px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: isExpired ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--primary)',
          height: '100%',
          width: `${progress}%`,
          transition: 'width 1s linear',
          borderRadius: '999px'
        }}></div>
      </div>
    </div>
  );
};

export default Timer;
