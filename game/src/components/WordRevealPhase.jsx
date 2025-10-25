import React, { useState, useEffect } from 'react';
import { updateGame } from '../services/firebase';
import Timer from './Timer';

const WordRevealPhase = ({ game, userId, onTimerComplete }) => {
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [myGuesses, setMyGuesses] = useState([]);

  const selectedWord = game?.currentRoundData?.selectedWord;
  const performerId = game?.currentRoundData?.performerId;
  const isPerformer = userId === performerId;
  const myTeam = game?.players?.[userId]?.team;
  const wordSelectingTeam = game?.currentRoundData?.wordSelectingTeam;

  // Debug logging
  useEffect(() => {
    if (isPerformer) {
      console.log('🎭 PERFORMER STATE:', {
        isPerformer,
        isReady,
        countdown,
        wordRevealed,
        timerStarted,
        selectedWord
      });
    }
  }, [isPerformer, isReady, countdown, wordRevealed, timerStarted]);

  // Can see the word if:
  // 1. You're the performer
  // 2. You're on the team that selected the word
  const canSeeWord = isPerformer || myTeam === wordSelectingTeam;

  // Performer readiness flow
  const handlePerformerReady = async () => {
    console.log('🎭 Performer clicked "I\'m Ready"');
    setIsReady(true);

    // Start 3-2-1 countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count = count - 1;
      console.log(`⏱️ Countdown: ${count}`);
      setCountdown(count);

      if (count <= 0) {
        clearInterval(countdownInterval);
        console.log('🚀 Countdown finished, revealing word...');
        // After countdown, reveal word and start timer for everyone
        revealWordAndStartTimer();
      }
    }, 1000);
  };

  // Reveal word and start timer (called after performer countdown OR by word-selecting team)
  const revealWordAndStartTimer = async () => {
    console.log('📢 Revealing word and starting timer...');

    // Set local state immediately
    setWordRevealed(true);
    setTimerStarted(true);

    try {
      await updateGame(game.gameId, {
        'currentRoundData.wordRevealed': true,
        'currentRoundData.timerStartedAt': new Date().toISOString()
      });
      console.log('✅ Word revealed in Firebase');
    } catch (error) {
      console.error('❌ Error revealing word:', error);
    }
  };

  // Anyone from Team A can tap to reveal word on performer's screen
  const handleRevealWord = async () => {
    if (myTeam !== wordSelectingTeam) return;
    await revealWordAndStartTimer();
  };

  // Listen for word reveal from Firebase
  useEffect(() => {
    if (game?.currentRoundData?.wordRevealed && !wordRevealed) {
      setWordRevealed(true);
      setTimerStarted(true);
    }
  }, [game?.currentRoundData?.wordRevealed]);

  // Handle guess submission
  const handleSubmitGuess = async (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const guess = guessInput.trim();
    setMyGuesses([...myGuesses, guess]);
    setGuessInput('');

    try {
      // Save guess to Firebase
      const currentGuesses = game?.currentRoundData?.guesses || {};
      const playerGuesses = currentGuesses[userId] || [];

      await updateGame(game.gameId, {
        [`currentRoundData.guesses.${userId}`]: [...playerGuesses, {
          guess,
          timestamp: new Date().toISOString(),
          playerName: game.players[userId].name
        }]
      });

      // Check if guess is correct
      if (guess.toLowerCase() === selectedWord.toLowerCase()) {
        const guesserTeam = game.players[userId].team;
        const guesserName = game.players[userId].name;

        console.log(`🎯 CORRECT GUESS by ${guesserName} from ${guesserTeam}`);
        console.log(`   Word: "${selectedWord}"`);
        console.log(`   Guesser team: ${guesserTeam}`);
        console.log(`   Word-selecting team: ${wordSelectingTeam}`);

        // Mark as correctly guessed and STOP TIMER by moving to scoring
        await updateGame(game.gameId, {
          'currentRoundData.correctlyGuessed': true,
          'currentRoundData.guessedBy': userId,
          'currentRoundData.guessedByName': guesserName,
          'currentRoundData.guessedByTeam': guesserTeam,
          gamePhase: 'scoring' // Stop timer and go to scoring
        });
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  // PERFORMER VIEW - Before ready
  if (isPerformer && !isReady && !wordRevealed) {
    console.log('📱 Rendering: Performer "I\'m Ready" button');
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem'
        }}>
          🎭
        </div>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          marginBottom: '1rem'
        }}>
          You're the Performer!
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.125rem',
          marginBottom: '3rem',
          maxWidth: '400px'
        }}>
          Place your phone on the table where you can see it, then tap "I'm Ready" when everyone is watching
        </p>
        <button
          onClick={handlePerformerReady}
          className="btn btn-lg"
          style={{
            background: 'white',
            color: '#667eea',
            padding: '1.25rem 3rem',
            fontSize: '1.25rem',
            fontWeight: 700
          }}
        >
          I'm Ready! 🎯
        </button>
      </div>
    );
  }

  // PERFORMER VIEW - Countdown
  if (isPerformer && isReady && countdown > 0 && !wordRevealed) {
    console.log('📱 Rendering: Performer countdown -', countdown);
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: 'clamp(8rem, 30vw, 20rem)',
          fontWeight: 900,
          color: 'white',
          animation: 'pulse 0.5s ease-in-out'
        }}>
          {countdown}
        </div>
      </div>
    );
  }

  // PERFORMER VIEW - Word revealed with timer
  if (isPerformer && wordRevealed) {
    console.log('📱 Rendering: Performer WORD DISPLAY -', selectedWord);
    return (
      <>
        {/* Full screen word display */}
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          padding: '2rem'
        }}>
          <div style={{
            fontSize: 'clamp(2rem, 10vw, 6rem)',
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            wordBreak: 'break-word'
          }}>
            {selectedWord}
          </div>
          <div style={{
            marginTop: '2rem',
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600
          }}>
            🎭 Act it out!
          </div>
        </div>

        {/* Timer overlay */}
        <Timer
          duration={game?.settings?.timer || 60}
          isActive={timerStarted}
          onComplete={onTimerComplete}
          showLarge={true}
        />
      </>
    );
  }

  // WORD-SELECTING TEAM VIEW - Can reveal word
  if (myTeam === wordSelectingTeam && !wordRevealed) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👀</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Ready to Start?
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem'
        }}>
          When the performer places their phone down, tap the button below to reveal the word on their screen
        </p>

        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Selected Word:
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            {selectedWord}
          </div>
        </div>

        <button
          onClick={handleRevealWord}
          className="btn btn-primary btn-full btn-lg"
        >
          👉 Tap to Reveal Word & Start Timer
        </button>
      </div>
    );
  }

  // OTHER TEAM VIEW - Waiting/Guessing
  if (myTeam !== wordSelectingTeam && !wordRevealed) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '0.5rem'
        }}>
          Get Ready to Guess!
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Watch your teammate perform and try to guess the word
        </p>
      </div>
    );
  }

  // OTHER TEAM VIEW - Timer running (GUESSING TEAM - NON-PERFORMERS ONLY)
  if (myTeam !== wordSelectingTeam && wordRevealed && !isPerformer) {
    const wasGuessed = game?.currentRoundData?.correctlyGuessed;

    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--secondary)',
          marginBottom: '0.5rem'
        }}>
          GUESS THE WORD!
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Watch your teammate and type your guesses below
        </p>

        {/* Guess Input Form */}
        {!wasGuessed && (
          <form onSubmit={handleSubmitGuess} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type your guess..."
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                style={{ marginBottom: 0, fontSize: '1.125rem' }}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!guessInput.trim()}
                style={{ whiteSpace: 'nowrap', padding: '0 2rem' }}
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {/* Show if word was guessed correctly */}
        {wasGuessed && (
          <div style={{
            padding: '1rem',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '1.125rem'
          }}>
            🎉 {game.currentRoundData.guessedByName} got it!
          </div>
        )}

        {/* My previous guesses */}
        {myGuesses.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Your guesses:
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {myGuesses.map((g, i) => (
                <div key={i}>• {g}</div>
              ))}
            </div>
          </div>
        )}

        <Timer
          duration={game?.settings?.timer || 60}
          isActive={timerStarted}
          onComplete={onTimerComplete}
          showLarge={false}
        />
      </div>
    );
  }

  // WORD-SELECTING TEAM VIEW - Timer running
  if (myTeam === wordSelectingTeam && wordRevealed) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👀</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Watch & Listen
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          The word is: <strong>{selectedWord}</strong>
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          You'll score the round when time is up
        </p>

        <Timer
          duration={game?.settings?.timer || 60}
          isActive={timerStarted}
          onComplete={onTimerComplete}
          showLarge={false}
        />
      </div>
    );
  }

  // Fallback - should never reach here if logic is correct
  console.warn('⚠️ WordRevealPhase: No view matched!', {
    isPerformer,
    isReady,
    countdown,
    wordRevealed,
    timerStarted,
    myTeam,
    wordSelectingTeam
  });

  return null;
};

export default WordRevealPhase;
