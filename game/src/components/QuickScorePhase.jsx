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
  const guessingTeam = wordSelectingTeam === 'teamA' ? 'teamB' : 'teamA';
  const canScore = myTeam === wordSelectingTeam;
  const selectedWord = game?.currentRoundData?.selectedWord;
  const wasGuessedCorrectly = game?.currentRoundData?.correctlyGuessed;
  const guessedByName = game?.currentRoundData?.guessedByName;
  const guessedByTeam = game?.currentRoundData?.guessedByTeam;

  // Debug log on mount
  useEffect(() => {
    console.log('📊 QuickScorePhase loaded:');
    console.log(`   Word-selecting team: ${wordSelectingTeam}`);
    console.log(`   Guessing team: ${guessingTeam}`);
    console.log(`   Was guessed correctly: ${wasGuessedCorrectly}`);
    console.log(`   Guessed by: ${guessedByName} (${guessedByTeam})`);
  }, []);

  // Auto-score if word was typed correctly (skip confirmation)
  useEffect(() => {
    if (wasGuessedCorrectly && scored === null && game?.currentRoundData?.scored === undefined) {
      // Word was typed correctly - auto-award point to guessing team
      const autoScore = async () => {
        try {
          // Set scored=true because word was guessed correctly
          await updateGame(game.gameId, {
            'currentRoundData.scored': true,
            'currentRoundData.scoredBy': 'auto',
            'currentRoundData.scoredByName': guessedByName
          });

          setScored(true);
          setScoredBy('auto');
          setCanUndo(false); // No undo for auto-scoring
          toast.success(`🎉 ${guessedByName} guessed it! Point to Team ${guessingTeam === 'teamA' ? 'A' : 'B'}!`);

          // Finalize score after brief delay
          setTimeout(async () => {
            await finalizeScoreWithValue(true); // true = word was guessed
          }, 2000);
        } catch (error) {
          console.error('Error auto-scoring:', error);
        }
      };

      autoScore();
    }
  }, [wasGuessedCorrectly]);

  // Listen for score from Firebase (when manually scored, not auto-scored)
  useEffect(() => {
    if (game?.currentRoundData?.scored !== undefined &&
        game?.currentRoundData?.scoredBy !== 'auto' &&
        scored === null) {
      const scoreValue = game.currentRoundData.scored;

      setScored(scoreValue);
      setScoredBy(game.currentRoundData.scoredBy);
      setCanUndo(true);

      // Start undo countdown
      const undoInterval = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(undoInterval);
            finalizeScoreWithValue(scoreValue); // Use captured value
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(undoInterval);
    }
  }, [game?.currentRoundData?.scored, game?.currentRoundData?.scoredBy]);

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

  const finalizeScoreWithValue = async (scoreValue) => {
    setCanUndo(false);

    try {
      // Update team scores
      const currentScoreA = game.scores?.teamA || 0;
      const currentScoreB = game.scores?.teamB || 0;
      const guessingTeam = wordSelectingTeam === 'teamA' ? 'teamB' : 'teamA';

      const updates = {
        gamePhase: 'roundComplete'
      };

      // CORRECT SCORING LOGIC:
      // If scoreValue = true: Word was guessed correctly → GUESSING team gets point + individual who guessed
      // If scoreValue = false: Word was NOT guessed → WORD-SELECTING team gets point
      if (scoreValue) {
        // Guessing team got it right!
        if (guessingTeam === 'teamA') {
          updates['scores.teamA'] = currentScoreA + 1;
          console.log(`✓ Team A (guessing team) gets point! ${currentScoreA} → ${currentScoreA + 1}`);
        } else {
          updates['scores.teamB'] = currentScoreB + 1;
          console.log(`✓ Team B (guessing team) gets point! ${currentScoreB} → ${currentScoreB + 1}`);
        }

        // Award individual point to the person who guessed correctly
        if (guessedByTeam) {
          const guesserId = game.currentRoundData?.guessedBy;
          if (guesserId) {
            const currentPlayerScore = game.playerPoints?.[guesserId] || 0;
            updates[`playerPoints.${guesserId}`] = currentPlayerScore + 1;
            console.log(`✓ ${guessedByName} gets individual point! ${currentPlayerScore} → ${currentPlayerScore + 1}`);
          }
        }
      } else {
        // Guessing team failed → Word-selecting team gets point
        if (wordSelectingTeam === 'teamA') {
          updates['scores.teamA'] = currentScoreA + 1;
          console.log(`✓ Team A (word-selecting team) gets point! ${currentScoreA} → ${currentScoreA + 1}`);
        } else {
          updates['scores.teamB'] = currentScoreB + 1;
          console.log(`✓ Team B (word-selecting team) gets point! ${currentScoreB} → ${currentScoreB + 1}`);
        }
      }

      await updateGame(game.gameId, updates);

      // DO NOT auto-advance - user will manually start next round
      // setTimeout(() => {
      //   onComplete && onComplete();
      // }, 2000);
    } catch (error) {
      console.error('Error finalizing score:', error);
    }
  };

  const finalizeScore = async () => {
    await finalizeScoreWithValue(scored);
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
            Did Team {guessingTeam === 'teamA' ? 'A' : 'B'} guess the word?
          </p>
          <div style={{
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            {selectedWord}
          </div>

          {/* Show if word was auto-detected as guessed */}
          {wasGuessedCorrectly && (
            <div style={{
              padding: '0.75rem',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              ✓ {guessedByName} typed it correctly!
            </div>
          )}
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
          YES = Team {guessingTeam === 'teamA' ? 'A' : 'B'} scores | NO = Team {wordSelectingTeam === 'teamA' ? 'A' : 'B'} scores
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

  // Waiting for score (phase will change to 'roundComplete' once finalized)
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
