import React, { useState, useEffect } from 'react';
import { updateGame } from '../services/firebase';
import toast from 'react-hot-toast';

const QuickScorePhase = ({ game, userId, onComplete }) => {
  const [scored, setScored] = useState(null); // true/false
  const [canUndo, setCanUndo] = useState(false);
  const [undoTimeLeft, setUndoTimeLeft] = useState(3);
  const [scoredBy, setScoredBy] = useState(null);

  const myTeam = game?.players?.[userId]?.team;
  const wordSelectingTeam = game?.currentRoundData?.wordSelectingTeam;
  const canScore = myTeam === wordSelectingTeam;
  const selectedWord = game?.currentRoundData?.selectedWord;

  // Listen for score from Firebase
  useEffect(() => {
    if (game?.currentRoundData?.scored !== undefined && scored === null) {
      setScored(game.currentRoundData.scored);
      setScoredBy(game.currentRoundData.scoredBy);
      setCanUndo(true);

      // Start undo countdown
      const undoInterval = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(undoInterval);
            finalizeScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(undoInterval);
    }
  }, [game?.currentRoundData?.scored]);

  const handleQuickScore = async (didScore) => {
    if (scored !== null) return;

    try {
      await updateGame(game.gameId, {
        'currentRoundData.scored': didScore,
        'currentRoundData.scoredBy': userId
      });

      setScored(didScore);
      setScoredBy(userId);
      setCanUndo(true);
      toast.success(didScore ? 'Point awarded! ✓' : 'No point');
    } catch (error) {
      console.error('Error scoring:', error);
      toast.error('Failed to score');
    }
  };

  const handleUndo = async () => {
    if (!canUndo) return;

    try {
      await updateGame(game.gameId, {
        'currentRoundData.scored': null,
        'currentRoundData.scoredBy': null
      });

      setScored(null);
      setScoredBy(null);
      setCanUndo(false);
      setUndoTimeLeft(3);
      toast.success('Score undone');
    } catch (error) {
      console.error('Error undoing score:', error);
      toast.error('Failed to undo');
    }
  };

  const finalizeScore = async () => {
    setCanUndo(false);

    try {
      // Update team scores
      const currentScoreA = game.scores?.teamA || 0;
      const currentScoreB = game.scores?.teamB || 0;

      const updates = {
        gamePhase: 'roundComplete'
      };

      if (scored) {
        if (wordSelectingTeam === 'teamA') {
          updates['scores.teamA'] = currentScoreA + 1;
        } else {
          updates['scores.teamB'] = currentScoreB + 1;
        }
      }

      await updateGame(game.gameId, updates);

      // Wait a moment then complete
      setTimeout(() => {
        onComplete && onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error finalizing score:', error);
    }
  };

  const getPlayerName = (uid) => {
    return game?.players?.[uid]?.name || 'Someone';
  };

  // Quick score buttons (only for scoring team)
  if (canScore && scored === null) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            Time's Up!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Did they guess the word?
          </p>
          <div style={{
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            {selectedWord}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <button
            onClick={() => handleQuickScore(false)}
            className="btn btn-lg"
            style={{
              background: 'var(--error)',
              color: 'white',
              padding: '1.5rem',
              fontSize: '1.125rem'
            }}
          >
            ❌ No
          </button>
          <button
            onClick={() => handleQuickScore(true)}
            className="btn btn-lg"
            style={{
              background: 'var(--success)',
              color: 'white',
              padding: '1.5rem',
              fontSize: '1.125rem'
            }}
          >
            ✓ Yes
          </button>
        </div>

        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          First person to tap scores the round
        </p>
      </div>
    );
  }

  // Score submitted - undo window
  if (scored !== null && canUndo) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '2rem',
          background: scored ? '#d1fae5' : '#fee2e2',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {scored ? '✓' : '❌'}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: scored ? '#065f46' : '#991b1b',
            marginBottom: '0.5rem'
          }}>
            {scored ? 'Point Awarded!' : 'No Point'}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: scored ? '#065f46' : '#991b1b',
            opacity: 0.8
          }}>
            Scored by {scoredBy === userId ? 'you' : getPlayerName(scoredBy)}
          </div>
        </div>

        {canScore && (
          <>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--warning)',
              marginBottom: '1rem'
            }}>
              {undoTimeLeft}
            </div>
            <button
              onClick={handleUndo}
              className="btn btn-outline btn-lg"
              style={{
                borderColor: 'var(--warning)',
                color: 'var(--warning)'
              }}
            >
              ↩️ Undo
            </button>
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              Tap undo within {undoTimeLeft}s to change
            </p>
          </>
        )}

        {!canScore && (
          <div style={{
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)'
          }}>
            Finalizing in {undoTimeLeft}s...
          </div>
        )}
      </div>
    );
  }

  // Score finalized
  if (scored !== null && !canUndo) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '2rem',
          background: scored ? '#d1fae5' : '#fee2e2',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {scored ? '🎉' : '💪'}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: scored ? '#065f46' : '#991b1b'
          }}>
            {scored ? 'Point Scored!' : 'Better Luck Next Round!'}
          </div>
        </div>
        <div style={{
          marginTop: '1.5rem',
          color: 'var(--text-secondary)'
        }}>
          Starting next round...
        </div>
      </div>
    );
  }

  // Waiting for score
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem',
      boxShadow: 'var(--shadow-md)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '0.5rem'
      }}>
        Waiting for Score...
      </h3>
      <p style={{ color: 'var(--text-secondary)' }}>
        Team {wordSelectingTeam === 'teamA' ? 'A' : 'B'} is scoring the round
      </p>
    </div>
  );
};

export default QuickScorePhase;
