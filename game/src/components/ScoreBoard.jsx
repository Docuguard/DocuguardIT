import React, { useEffect, useState } from 'react';

const ScoreBoard = ({ game, myTeam }) => {
  const teamAScore = game?.scores?.teamA || 0;
  const teamBScore = game?.scores?.teamB || 0;
  const teamAPlayers = game?.teams?.teamA || [];
  const teamBPlayers = game?.teams?.teamB || [];

  const getPlayerName = (userId) => {
    return game?.players?.[userId]?.name || 'Unknown';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        {/* Team A */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: myTeam === 'teamA' ? 'var(--primary)' : 'var(--text-secondary)',
            marginBottom: '0.25rem'
          }}>
            {teamAScore}
          </div>
          <div style={{
            fontWeight: 600,
            color: myTeam === 'teamA' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            Team A {myTeam === 'teamA' && '(You)'}
          </div>
        </div>

        {/* VS */}
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-tertiary)'
        }}>
          VS
        </div>

        {/* Team B */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: myTeam === 'teamB' ? 'var(--secondary)' : 'var(--text-secondary)',
            marginBottom: '0.25rem'
          }}>
            {teamBScore}
          </div>
          <div style={{
            fontWeight: 600,
            color: myTeam === 'teamB' ? 'var(--secondary)' : 'var(--text-secondary)'
          }}>
            Team B {myTeam === 'teamB' && '(You)'}
          </div>
        </div>
      </div>

      {/* Team Rosters - Collapsed */}
      <details style={{ marginTop: '1rem' }}>
        <summary style={{
          cursor: 'pointer',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          View Teams
        </summary>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)'
        }}>
          {/* Team A Players */}
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              color: 'var(--primary)'
            }}>
              Team A
            </div>
            {teamAPlayers.map((userId) => (
              <div key={userId} style={{
                fontSize: '0.875rem',
                padding: '0.25rem 0',
                color: 'var(--text-secondary)'
              }}>
                • {getPlayerName(userId)}
              </div>
            ))}
          </div>

          {/* Team B Players */}
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              color: 'var(--secondary)'
            }}>
              Team B
            </div>
            {teamBPlayers.map((userId) => (
              <div key={userId} style={{
                fontSize: '0.875rem',
                padding: '0.25rem 0',
                color: 'var(--text-secondary)'
              }}>
                • {getPlayerName(userId)}
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
};

export default ScoreBoard;
