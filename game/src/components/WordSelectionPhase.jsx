import React, { useState, useEffect } from 'react';
import { updateGame } from '../services/firebase';
import { getCombinedWords } from '../data/wordPacks';
import toast from 'react-hot-toast';

const WordSelectionPhase = ({ game, userId, onComplete }) => {
  const [wordOptions, setWordOptions] = useState([]);
  const [customWord, setCustomWord] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [votes, setVotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);

  const allowCustomWords = game?.settings?.allowCustomWords;
  const wordPacks = game?.settings?.wordPacks || ['classic'];

  // Initialize word options
  useEffect(() => {
    const words = getCombinedWords(wordPacks, 5);
    setWordOptions(words);
  }, []);

  // Auto-submit timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Listen for votes from other players
  useEffect(() => {
    if (game?.currentRoundData?.votes) {
      setVotes(game.currentRoundData.votes);

      // Check if all team members have submitted
      const teamMembers = game.teams.teamA || [];
      const submittedCount = Object.keys(game.currentRoundData.votes).length;

      if (submittedCount === teamMembers.length) {
        // Calculate winner
        setTimeout(() => {
          determineWinningWord();
        }, 1000);
      }
    }
  }, [game?.currentRoundData?.votes]);

  const handleVote = (word) => {
    if (hasSubmitted) {
      toast.error('You already submitted your vote');
      return;
    }
    setSelectedWord(word);
  };

  const handleAddCustomWord = () => {
    if (!customWord.trim()) {
      toast.error('Please enter a word');
      return;
    }

    if (wordOptions.length >= 8) {
      toast.error('Maximum 8 options allowed');
      return;
    }

    setWordOptions([...wordOptions, customWord.trim()]);
    setCustomWord('');
    toast.success('Custom word added!');
  };

  const handleSubmitVote = async () => {
    if (!selectedWord) {
      toast.error('Please select a word');
      return;
    }

    try {
      // Submit vote to Firebase
      const newVotes = {
        ...votes,
        [userId]: selectedWord
      };

      await updateGame(game.gameId, {
        'currentRoundData.votes': newVotes
      });

      setHasSubmitted(true);
      toast.success('Vote submitted!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  const handleAutoSubmit = async () => {
    if (hasSubmitted || !selectedWord) return;

    try {
      const newVotes = {
        ...votes,
        [userId]: selectedWord || wordOptions[0]
      };

      await updateGame(game.gameId, {
        'currentRoundData.votes': newVotes
      });

      setHasSubmitted(true);
    } catch (error) {
      console.error('Error auto-submitting vote:', error);
    }
  };

  const determineWinningWord = async () => {
    // Count votes
    const voteCounts = {};
    Object.values(votes).forEach(word => {
      voteCounts[word] = (voteCounts[word] || 0) + 1;
    });

    // Find word with most votes
    let winningWord = '';
    let maxVotes = 0;

    Object.entries(voteCounts).forEach(([word, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winningWord = word;
      }
    });

    // Update game with winning word
    try {
      await updateGame(game.gameId, {
        'currentRoundData.selectedWord': winningWord,
        gamePhase: 'performing'
      });

      onComplete && onComplete();
    } catch (error) {
      console.error('Error setting winning word:', error);
    }
  };

  const getVoteCount = (word) => {
    return Object.values(votes).filter(v => v === word).length;
  };

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
          color: 'var(--primary)',
          marginBottom: '0.5rem'
        }}>
          🎭 Team A: Select Your Word
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Vote for a word or add your own! Most votes wins.
        </p>

        {/* Timer */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: timeLeft <= 10 ? '#fef3c7' : 'var(--bg-tertiary)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          fontWeight: 600,
          color: timeLeft <= 10 ? '#92400e' : 'var(--text-primary)'
        }}>
          ⏱️ {timeLeft}s remaining {timeLeft <= 10 && '- Hurry!'}
        </div>
      </div>

      {/* Word Options */}
      <div style={{
        display: 'grid',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {wordOptions.map((word, index) => {
          const voteCount = getVoteCount(word);
          const isSelected = selectedWord === word;

          return (
            <button
              key={index}
              onClick={() => handleVote(word)}
              disabled={hasSubmitted}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'white',
                cursor: hasSubmitted ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                opacity: hasSubmitted && !isSelected ? 0.6 : 1
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontWeight: 600,
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '1rem'
                }}>
                  {isSelected && '✓ '}{word}
                </div>
                {voteCount > 0 && (
                  <div style={{
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '999px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700
                  }}>
                    {voteCount}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Word Input */}
      {allowCustomWords && !hasSubmitted && (
        <div style={{
          padding: '1rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            Add Your Own Word
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter a custom word..."
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomWord()}
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={handleAddCustomWord}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!hasSubmitted ? (
        <button
          onClick={handleSubmitVote}
          disabled={!selectedWord}
          className="btn btn-primary btn-full btn-lg"
        >
          Submit Vote ✓
        </button>
      ) : (
        <div style={{
          padding: '1rem',
          background: '#d1fae5',
          color: '#065f46',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          fontWeight: 600
        }}>
          ✓ Vote submitted! Waiting for others...
        </div>
      )}

      {/* Voting Status */}
      <div style={{
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        {Object.keys(votes).length} / {game?.teams?.teamA?.length || 0} votes submitted
      </div>
    </div>
  );
};

export default WordSelectionPhase;
