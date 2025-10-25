import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToGame, updateGame, getUserProfile, updateUserProfile } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

// Components
import ScoreBoard from '../components/ScoreBoard';
import WordSelectionPhase from '../components/WordSelectionPhase';
import PerformerSelectionPhase from '../components/PerformerSelectionPhase';
import WordRevealPhase from '../components/WordRevealPhase';
import QuickScorePhase from '../components/QuickScorePhase';
import LoadingScreen from '../components/LoadingScreen';

const GamePlayPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [game, setGame] = useState(null);
  const [gamePhase, setGamePhase] = useState('setup'); // setup, wordSelection, performing, scoring, roundComplete, finished
  const [myTeam, setMyTeam] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      setGame(gameData);

      // Update phase from game data
      if (gameData.gamePhase) {
        setGamePhase(gameData.gamePhase);
      }

      // Get my team
      const myPlayerId = user?.uid;
      if (myPlayerId && gameData.players?.[myPlayerId]) {
        setMyTeam(gameData.players[myPlayerId].team);
      }

      // Check if game ended
      if (gameData.status === 'finished') {
        setGamePhase('finished');
      }
    });

    return () => unsubscribe();
  }, [gameId, user]);

  // Initialize game - assign teams and start first round
  useEffect(() => {
    if (game && game.status === 'playing' && !game.teamsAssigned && game.hostId === user?.uid) {
      assignTeams();
    }
  }, [game, user]);

  const assignTeams = async () => {
    try {
      const players = Object.keys(game.players);
      const shuffled = [...players].sort(() => 0.5 - Math.random());

      const midpoint = Math.ceil(shuffled.length / 2);
      const teamA = shuffled.slice(0, midpoint);
      const teamB = shuffled.slice(midpoint);

      // Update each player's team
      const playerUpdates = {};
      teamA.forEach(playerId => {
        playerUpdates[`players.${playerId}.team`] = 'teamA';
      });
      teamB.forEach(playerId => {
        playerUpdates[`players.${playerId}.team`] = 'teamB';
      });

      await updateGame(gameId, {
        ...playerUpdates,
        'teams.teamA': teamA,
        'teams.teamB': teamB,
        teamsAssigned: true,
        gamePhase: 'wordSelection',
        currentRound: 1,
        'currentRoundData.wordSelectingTeam': 'teamA',
        'currentRoundData.performingTeam': 'teamB',
        'currentRoundData.votes': {}
      });

      toast.success('Teams assigned! Game starting!');
    } catch (error) {
      console.error('Error assigning teams:', error);
      toast.error('Failed to assign teams');
    }
  };

  const handleRoundComplete = async () => {
    try {
      // Swap teams for next round
      const nextWordSelectingTeam = game.currentRoundData.wordSelectingTeam === 'teamA' ? 'teamB' : 'teamA';
      const nextPerformingTeam = game.currentRoundData.performingTeam === 'teamA' ? 'teamB' : 'teamA';

      await updateGame(gameId, {
        currentRound: (game.currentRound || 1) + 1,
        gamePhase: 'wordSelection',
        'currentRoundData.wordSelectingTeam': nextWordSelectingTeam,
        'currentRoundData.performingTeam': nextPerformingTeam,
        'currentRoundData.votes': {},
        'currentRoundData.selectedWord': null,
        'currentRoundData.performerId': null,
        'currentRoundData.wordRevealed': false,
        'currentRoundData.timerStartedAt': null,
        'currentRoundData.scored': null,
        'currentRoundData.scoredBy': null
      });

      toast.success('Next round starting!');
    } catch (error) {
      console.error('Error starting next round:', error);
      toast.error('Failed to start next round');
    }
  };

  const handleTimerComplete = async () => {
    try {
      await updateGame(gameId, {
        gamePhase: 'scoring'
      });
    } catch (error) {
      console.error('Error moving to scoring:', error);
    }
  };

  const handleEndGame = async () => {
    try {
      // Update user stats
      const didWin = (myTeam === 'teamA' && game.scores.teamA > game.scores.teamB) ||
                     (myTeam === 'teamB' && game.scores.teamB > game.scores.teamA);

      const currentStats = await getUserProfile(user.uid);

      await updateUserProfile(user.uid, {
        gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
        gamesWon: didWin ? (currentStats.gamesWon || 0) + 1 : currentStats.gamesWon,
        totalPoints: (currentStats.totalPoints || 0) + (myTeam === 'teamA' ? game.scores.teamA : game.scores.teamB),
        xp: (currentStats.xp || 0) + 50 // Base XP for completing game
      });

      await updateGame(gameId, {
        status: 'finished'
      });

      setShowConfetti(true);
      toast.success('Game ended!');
    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Failed to end game');
    }
  };

  if (!game) {
    return <LoadingScreen />;
  }

  const isHost = game.hostId === user?.uid;
  const currentRound = game.currentRound || 1;

  // Game hasn't started yet
  if (!game.teamsAssigned) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
          <div className="spinner" style={{ margin: '0 auto 2rem' }}></div>
          <h2 style={{ marginBottom: '1rem' }}>Preparing Game...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isHost ? 'Assigning teams and setting up the first round...' : 'Host is preparing the game...'}
          </p>
        </div>
      </div>
    );
  }

  // Game Finished
  if (gamePhase === 'finished') {
    const teamAScore = game.scores?.teamA || 0;
    const teamBScore = game.scores?.teamB || 0;
    const winner = teamAScore > teamBScore ? 'Team A' : teamBScore > teamAScore ? 'Team B' : 'Tie';
    const didWin = (winner === 'Team A' && myTeam === 'teamA') || (winner === 'Team B' && myTeam === 'teamB');

    // Create individual player rankings
    const playerRankings = Object.entries(game.players || {}).map(([playerId, player]) => ({
      id: playerId,
      name: player.name,
      team: player.team,
      points: game.playerPoints?.[playerId] || 0
    })).sort((a, b) => b.points - a.points);

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}

        <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '600px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
            {winner === 'Tie' ? '🤝' : '🏆'}
          </div>

          <h1 style={{ marginBottom: '1rem' }}>
            {winner === 'Tie' ? "It's a Tie!" : `${winner} Wins!`}
          </h1>

          {didWin && winner !== 'Tie' && (
            <div style={{
              padding: '1rem',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              fontWeight: 700,
              fontSize: '1.125rem'
            }}>
              🎉 Congratulations! You won!
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: myTeam === 'teamA' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--primary)',
                marginBottom: '0.5rem'
              }}>
                {teamAScore}
              </div>
              <div style={{ fontWeight: 600 }}>
                Team A {myTeam === 'teamA' && '(You)'}
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: myTeam === 'teamB' ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--secondary)',
                marginBottom: '0.5rem'
              }}>
                {teamBScore}
              </div>
              <div style={{ fontWeight: 600 }}>
                Team B {myTeam === 'teamB' && '(You)'}
              </div>
            </div>
          </div>

          {/* Individual Player Rankings */}
          <div style={{
            marginBottom: '2rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              color: 'white',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              🏆 Individual Rankings
            </div>
            <div style={{ padding: '0.5rem' }}>
              {playerRankings.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: player.id === user.uid ? 'rgba(99, 102, 241, 0.1)' : 'white',
                    borderRadius: 'var(--radius)',
                    marginBottom: '0.5rem',
                    border: player.id === user.uid ? '2px solid var(--primary)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'var(--text-tertiary)',
                      minWidth: '2rem'
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: player.id === user.uid ? 700 : 600,
                        fontSize: '1rem',
                        marginBottom: '0.125rem'
                      }}>
                        {player.name} {player.id === user.uid && '(You)'}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: player.team === 'teamA' ? 'var(--primary)' : 'var(--secondary)',
                        fontWeight: 600
                      }}>
                        Team {player.team === 'teamA' ? 'A' : 'B'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--primary)'
                  }}>
                    {player.points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Played {currentRound - 1} rounds
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/dashboard" className="btn btn-primary btn-full btn-lg">
              Back to Dashboard
            </a>
            <a href="/create" className="btn btn-outline btn-full">
              Play Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Main gameplay
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem 0',
        marginBottom: '1.5rem'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                Round {currentRound}
              </h2>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Game: {gameId}
              </div>
            </div>
            {isHost && (
              <button
                onClick={handleEndGame}
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                End Game
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Scoreboard */}
        <ScoreBoard game={game} myTeam={myTeam} />

        {/* Game Phases */}
        {gamePhase === 'wordSelection' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Team A - Word Selection */}
            {myTeam === game.currentRoundData.wordSelectingTeam ? (
              <WordSelectionPhase
                game={game}
                userId={user.uid}
                onComplete={() => {}}
              />
            ) : (
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Waiting for Team {game.currentRoundData.wordSelectingTeam === 'teamA' ? 'A' : 'B'}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  They're selecting a word...
                </p>
              </div>
            )}

            {/* Team B - Performer Selection */}
            {myTeam === game.currentRoundData.performingTeam && (
              <PerformerSelectionPhase game={game} userId={user.uid} />
            )}
          </div>
        )}

        {gamePhase === 'performing' && (
          <WordRevealPhase
            game={game}
            userId={user.uid}
            onTimerComplete={handleTimerComplete}
          />
        )}

        {gamePhase === 'scoring' && (
          <QuickScorePhase
            game={game}
            userId={user.uid}
            onComplete={handleRoundComplete}
          />
        )}

        {gamePhase === 'roundComplete' && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center'
          }}>
            <div style={{
              padding: '2rem',
              background: '#d1fae5',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#065f46',
                marginBottom: '0.5rem'
              }}>
                Round {currentRound - 1} Complete!
              </div>
              {game.currentRoundData?.guessedByName && (
                <div style={{
                  fontSize: '1rem',
                  color: '#065f46',
                  opacity: 0.9
                }}>
                  {game.currentRoundData.guessedByName} guessed it correctly!
                </div>
              )}
            </div>

            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Current Scores</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '1.25rem', fontWeight: 700 }}>
                <div>Team A: {game.scores?.teamA || 0}</div>
                <div>Team B: {game.scores?.teamB || 0}</div>
              </div>
            </div>

            {isHost && (
              <button
                onClick={handleRoundComplete}
                className="btn btn-primary btn-full btn-lg"
              >
                Start Round {currentRound} →
              </button>
            )}

            {!isHost && (
              <div style={{
                padding: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
              }}>
                Waiting for host to start next round...
              </div>
            )}
          </div>
        )}

        {/* Debug Info (remove in production) */}
        <details style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <summary style={{ cursor: 'pointer', padding: '0.5rem' }}>Debug Info</summary>
          <pre style={{
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius)',
            overflow: 'auto',
            fontSize: '0.75rem'
          }}>
            {JSON.stringify({
              gamePhase,
              myTeam,
              currentRound,
              wordSelectingTeam: game.currentRoundData?.wordSelectingTeam,
              performingTeam: game.currentRoundData?.performingTeam,
              selectedWord: game.currentRoundData?.selectedWord,
              performerId: game.currentRoundData?.performerId,
              scores: game.scores
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default GamePlayPage;
