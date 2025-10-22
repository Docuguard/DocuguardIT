import React, { useEffect, useState } from 'react';
import { updateGame } from '../services/firebase';
import toast from 'react-hot-toast';

const PerformerSelectionPhase = ({ game, userId }) => {
  const [selectedPerformer, setSelectedPerformer] = useState(null);
  const [autoSelectedPerformer, setAutoSelectedPerformer] = useState(null);

  const teamBMembers = game?.teams?.teamB || [];
  const performerHistory = game?.performerHistory || {};

  // Auto-select next performer in rotation
  useEffect(() => {
    const nextPerformer = getNextPerformer();
    setAutoSelectedPerformer(nextPerformer);

    // Auto-update after 3 seconds if not manually selected
    const timer = setTimeout(() => {
      if (!selectedPerformer) {
        updatePerformer(nextPerformer);
      }
    }, 25000); // 25 seconds (5 seconds before word voting ends)

    return () => clearTimeout(timer);
  }, []);

  const getNextPerformer = () => {
    // Get performer who has performed the least
    const performCounts = {};

    teamBMembers.forEach(userId => {
      performCounts[userId] = performerHistory[userId] || 0;
    });

    // Find player with minimum performances
    let minCount = Infinity;
    let nextPerformer = teamBMembers[0];

    Object.entries(performCounts).forEach(([userId, count]) => {
      if (count < minCount) {
        minCount = count;
        nextPerformer = userId;
      }
    });

    return nextPerformer;
  };

  const updatePerformer = async (performerId) => {
    try {
      await updateGame(game.gameId, {
        'currentRoundData.performerId': performerId,
        [`performerHistory.${performerId}`]: (performerHistory[performerId] || 0) + 1
      });

      toast.success('Performer selected!');
    } catch (error) {
      console.error('Error selecting performer:', error);
      toast.error('Failed to select performer');
    }
  };

  const handleSelectPerformer = (performerId) => {
    setSelectedPerformer(performerId);
    updatePerformer(performerId);
  };

  const getPlayerName = (userId) => {
    return game?.players?.[userId]?.name || 'Unknown';
  };

  const getPerformCount = (userId) => {
    return performerHistory[userId] || 0;
  };

  const currentPerformer = game?.currentRoundData?.performerId;

  if (currentPerformer) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--secondary)',
          marginBottom: '0.5rem'
        }}>
          Team B Performer
        </h3>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          {getPlayerName(currentPerformer)}
        </div>
        {currentPerformer === userId && (
          <div style={{
            padding: '0.75rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: 'var(--radius)',
            marginTop: '1rem',
            fontWeight: 600
          }}>
            ⭐ You're up! Get ready to perform!
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--secondary)',
          marginBottom: '0.5rem'
        }}>
          🎯 Team B: Select Performer
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Choose who will act out the word
        </p>
      </div>

      {/* Auto-selected performer highlight */}
      {autoSelectedPerformer && (
        <div style={{
          padding: '0.75rem',
          background: '#dbeafe',
          borderRadius: 'var(--radius)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#1e40af',
          textAlign: 'center'
        }}>
          ⭐ Suggested: {getPlayerName(autoSelectedPerformer)} (fair rotation)
        </div>
      )}

      {/* Team B Members */}
      <div style={{
        display: 'grid',
        gap: '0.75rem'
      }}>
        {teamBMembers.map((memberId) => {
          const isAutoSelected = memberId === autoSelectedPerformer;
          const performCount = getPerformCount(memberId);

          return (
            <button
              key={memberId}
              onClick={() => handleSelectPerformer(memberId)}
              disabled={selectedPerformer !== null}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isAutoSelected ? 'var(--secondary)' : 'var(--border)'}`,
                background: isAutoSelected ? 'rgba(236, 72, 153, 0.1)' : 'white',
                cursor: selectedPerformer ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    {getPlayerName(memberId)}
                    {memberId === userId && ' (You)'}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Performed {performCount} time{performCount !== 1 ? 's' : ''}
                  </div>
                </div>
                {isAutoSelected && (
                  <div style={{
                    background: 'var(--secondary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Suggested
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PerformerSelectionPhase;
