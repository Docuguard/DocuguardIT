# AI Context Prompt - Charades Party Game

> **Purpose:** Use this document to give an AI assistant complete context about the Charades Party project in a new conversation.

---

## Project Overview

**Name:** Charades Party - Multiplayer Real-Time Game
**Type:** Mobile-first web application
**Tech Stack:** React 18 + Vite + Firebase (Auth & Firestore) + Stripe (planned)
**Current Status:** Core gameplay fully functional, monetization not yet implemented
**Repository:** `/home/user/DocuguardIT/game` or standalone at `https://github.com/Docuguard/charade`

---

## Quick Context for AI

This is a real-time multiplayer charades game where:
- Players join a game using a 6-character code
- Get split into 2 teams (Team A & Team B)
- Take turns selecting words and performing them
- Guessing team types their guesses
- Individual player points are tracked alongside team scores
- Host manually controls round progression

---

## Architecture

### Frontend Stack
- **Framework:** React 18 with functional components and hooks
- **Build Tool:** Vite
- **State Management:** Zustand (authStore, gameStore)
- **Routing:** React Router v6
- **Styling:** Vanilla CSS with CSS variables
- **Animations:** Framer Motion
- **Special Effects:** React Confetti (game end celebration)

### Backend/Services
- **Authentication:** Firebase Auth (Email/Password + Google Sign-In)
- **Database:** Firebase Firestore (real-time sync)
- **Hosting:** Firebase Hosting (planned)
- **Payments:** Stripe (not yet implemented)

### Key Technical Features
- Real-time synchronization using Firestore listeners
- Screen wake lock API to prevent sleep during gameplay
- Web Audio API for buzzer sound
- PWA configuration (manifest.json)
- Mobile-first responsive design
- Anti-cheat measures on performer view

---

## File Structure

```
game/
├── src/
│   ├── components/
│   │   ├── WordSelectionPhase.jsx      # Word voting + custom submission
│   │   ├── PerformerSelectionPhase.jsx # Performer selection with rotation
│   │   ├── WordRevealPhase.jsx         # Performer view + guess input
│   │   ├── QuickScorePhase.jsx         # Scoring with auto-detect + undo
│   │   ├── ScoreBoard.jsx              # Team + individual scores
│   │   ├── Timer.jsx                   # Countdown with wake lock
│   │   ├── LoadingScreen.jsx           # Loading states
│   │   └── ProtectedRoute.jsx          # Auth guard
│   ├── pages/
│   │   ├── HomePage.jsx                # Landing page
│   │   ├── AuthPage.jsx                # Sign in/up
│   │   ├── DashboardPage.jsx           # User stats
│   │   ├── CreateGamePage.jsx          # Game creation
│   │   ├── JoinGamePage.jsx            # Join with code
│   │   ├── GameLobbyPage.jsx           # Pre-game lobby
│   │   └── GamePlayPage.jsx            # Main game orchestrator
│   ├── services/
│   │   └── firebase.js                 # All Firebase operations
│   ├── stores/
│   │   ├── authStore.js                # User authentication state
│   │   └── gameStore.js                # Current game state
│   ├── data/
│   │   ├── wordPacks.js                # 100 charades words
│   │   └── achievements.js             # Achievement definitions
│   └── styles/
│       └── global.css                  # Global styles + CSS variables
```

---

## Game Flow (Step-by-Step)

### 1. Authentication
- Users sign in with Email/Password or Google
- Creates user profile in `/users/{userId}` if first time
- Tracks: gamesPlayed, gamesWon, totalPoints

### 2. Game Creation/Joining
- **Host creates game:**
  - Sets timer duration (30-120s)
  - Selects word packs (Classic is free)
  - Toggles custom words on/off
  - Gets 6-character game code (e.g., "ABC123")

- **Players join:**
  - Enter game code
  - Enter display name
  - Wait in lobby

### 3. Game Start
- **Host clicks "Start Game"** (requires 4+ players)
- `GamePlayPage.jsx` assigns teams randomly (50/50 split)
- Sets initial game phase to `'wordSelection'`
- Round 1 begins

### 4. Round Flow

**Phase: `wordSelection` (Parallel)**
- **Team A:** Votes on words from word pack OR submits custom word
  - Component: `WordSelectionPhase.jsx`
  - Shows 5 random words from selected pack
  - "Add Custom Word" button if enabled
  - Most voted word becomes `selectedWord`

- **Team B:** Selects a performer
  - Component: `PerformerSelectionPhase.jsx`
  - Auto-suggests next performer for fair rotation
  - Tracks who has performed to ensure everyone gets a turn
  - Sets `performerId` when selected

**Phase: `performing`**
- Component: `WordRevealPhase.jsx`
- **Performer:**
  1. Sees "You're the Performer!" screen
  2. Clicks "I'm Ready! 🎯"
  3. 3-2-1 countdown (orange screen)
  4. Word appears fullscreen (green gradient)
  5. Timer in top-right corner
  6. **Anti-cheat protection:**
     - Text unselectable (userSelect: 'none')
     - Copy/paste blocked
     - Word hides when window loses focus
     - Watermark: "PERFORMER VIEW • [Name]"

- **Word-Selecting Team:**
  - Sees the selected word (they picked it)
  - Can tap "Tap to Reveal Word & Start Timer" if performer hasn't clicked ready

- **Guessing Team (non-performers):**
  - Sees "GUESS THE WORD!" screen
  - Text input field to type guesses
  - Submit button
  - Shows previous guesses below
  - When correct word typed:
    - Timer stops immediately
    - Game moves to `'scoring'` phase
    - Auto-scoring happens

**Phase: `scoring`**
- Component: `QuickScorePhase.jsx`
- **If word was typed correctly:**
  - Auto-scores (no confirmation needed)
  - Shows: "🎉 [Name] guessed it! Point to Team X!"
  - Awards individual point to guesser
  - Awards team point to guessing team
  - Moves to `'roundComplete'` after 2 seconds

- **If timer expired without typed guess:**
  - Word-selecting team sees YES/NO buttons
  - "Did they guess it?" (for verbal guesses)
  - 3-second undo window
  - If YES: Guessing team gets point
  - If NO: Word-selecting team gets point

**Phase: `roundComplete`**
- Component: Rendered in `GamePlayPage.jsx`
- Shows:
  - "Round X Complete!" celebration
  - Who guessed correctly (if applicable)
  - **THE WORD** in purple gradient box (visible to everyone)
  - Current team scores
  - **Host sees:** "Start Round X+1 →" button
  - **Non-host sees:** "Waiting for host..."

- Host clicks button → `handleRoundComplete()` is called:
  - Teams swap roles (word-selecting becomes guessing)
  - Increment `currentRound`
  - Clear all round data (votes, guesses, flags)
  - Set phase to `'wordSelection'`
  - Next round begins

**Phase: `finished`**
- Shows when host clicks "End Game"
- Displays:
  - Team winner (or tie)
  - Final team scores
  - **Individual player rankings** with medals (🥇🥈🥉)
  - Sorted by playerPoints (highest first)
  - Buttons: "Back to Dashboard" | "Play Again"

---

## Database Schema

### Games Collection: `/games/{gameId}`

```javascript
{
  gameId: "ABC123",              // 6-character code
  hostId: "user123",             // Host's user ID
  status: "playing",             // lobby | playing | finished
  gamePhase: "wordSelection",    // Current game phase
  currentRound: 2,               // Current round number

  settings: {
    timer: 60,                   // Timer duration in seconds
    wordPacks: ["classic"],      // Selected word packs
    allowCustomWords: true,      // Can players add custom words?
    maxPlayers: 20,
    rounds: "unlimited"
  },

  players: {
    "user123": {
      name: "John Doe",
      team: "teamA",             // teamA | teamB
      isActive: true,
      joinedAt: timestamp
    },
    "user456": { /* ... */ }
  },

  teams: {
    teamA: ["user123", "user789"],
    teamB: ["user456", "user101"]
  },

  scores: {
    teamA: 5,                    // Team A's score
    teamB: 3                     // Team B's score
  },

  playerPoints: {
    "user123": 2,                // Individual points for each player
    "user456": 1,
    "user789": 0,
    "user101": 2
  },

  currentRoundData: {
    wordSelectingTeam: "teamA",  // Which team selects word
    performingTeam: "teamB",     // Which team performs

    wordOptions: [               // Available words for voting
      "Robot Therapist",
      "Penguin Sliding on Ice",
      "Zombie Doing Taxes",
      // ...
    ],

    votes: {                     // Player votes
      "user123": "Robot Therapist",
      "user789": "Robot Therapist"
    },

    selectedWord: "Robot Therapist", // Final selected word
    performerId: "user456",          // Who is performing

    wordRevealed: true,          // Has word been shown?
    timerStartedAt: timestamp,   // When timer started

    correctlyGuessed: true,      // Was word typed correctly?
    guessedBy: "user101",        // Who guessed it
    guessedByName: "Jane Doe",   // Guesser's name
    guessedByTeam: "teamB",      // Guesser's team

    guesses: {                   // All submitted guesses
      "user101": [{
        guess: "robot therapist",
        timestamp: "2025-01-25T...",
        playerName: "Jane Doe"
      }]
    },

    scored: true,                // Final score decision
    scoredBy: "auto",            // Who confirmed (auto | userId)
    scoredByName: "Jane Doe"
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Users Collection: `/users/{userId}`

```javascript
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  gamesPlayed: 15,
  gamesWon: 7,
  totalPoints: 42,
  createdAt: timestamp
}
```

---

## Key Components Explained

### 1. `WordRevealPhase.jsx` (Most Complex Component)

**Purpose:** Handles the performance phase

**Views it renders:**
1. **Performer - Before Ready:** "I'm Ready!" button
2. **Performer - Countdown:** 3-2-1 countdown (orange)
3. **Performer - Word Display:** Fullscreen word + timer (green) ← Main view
4. **Word-Selecting Team - Before Reveal:** Can tap to reveal word
5. **Word-Selecting Team - Timer Running:** Shows the word they selected
6. **Guessing Team - Before Reveal:** "Get Ready to Guess!"
7. **Guessing Team - Timer Running:** Guess input field + submit button

**Anti-Cheat Features:**
```jsx
// Text unselectable
userSelect: 'none',
WebkitUserSelect: 'none',
MozUserSelect: 'none',
msUserSelect: 'none'

// Prevent copy/paste
document.addEventListener('copy', preventCopy);
document.addEventListener('cut', preventCopy);
document.addEventListener('contextmenu', preventCopy);

// Hide on focus loss
window.addEventListener('blur', () => setWindowFocused(false));
{!windowFocused && <div>⚠️ Return to app</div>}
```

**Guess Detection:**
```javascript
if (guess.toLowerCase() === selectedWord.toLowerCase()) {
  await updateGame(game.gameId, {
    'currentRoundData.correctlyGuessed': true,
    'currentRoundData.guessedBy': userId,
    'currentRoundData.guessedByName': userName,
    'currentRoundData.guessedByTeam': userTeam,
    gamePhase: 'scoring' // Stops timer, moves to scoring
  });
}
```

### 2. `QuickScorePhase.jsx`

**Purpose:** Handles scoring after performance

**Auto-Scoring Logic:**
```javascript
if (wasGuessedCorrectly && scored === null) {
  // Word was typed correctly - auto-award point
  await updateGame(game.gameId, {
    'currentRoundData.scored': true,
    'currentRoundData.scoredBy': 'auto'
  });

  setScored(true);
  setScoredBy('auto');

  // Award point to guessing team + individual player
  setTimeout(() => finalizeScoreWithValue(true), 2000);
}
```

**Manual Scoring (timer expired):**
- Word-selecting team clicks YES or NO
- 3-second undo window
- If undo clicked: Resets to YES/NO buttons
- After 3 seconds: `finalizeScoreWithValue(scored)` called

**Point Allocation:**
```javascript
if (scoreValue === true) {
  // Word was guessed → Guessing team gets point
  // Individual player who guessed gets point
} else {
  // Word NOT guessed → Word-selecting team gets point
}
```

### 3. `GamePlayPage.jsx` (Main Orchestrator)

**Purpose:** Manages overall game state and phase transitions

**Key Functions:**

```javascript
// Assign teams randomly (called on game start)
const assignTeams = async () => {
  const players = Object.keys(game.players);
  const shuffled = [...players].sort(() => 0.5 - Math.random());
  const midpoint = Math.ceil(shuffled.length / 2);

  const teamA = shuffled.slice(0, midpoint);
  const teamB = shuffled.slice(midpoint);

  // Update Firebase with teams + first round data
};

// Handle round completion (called by host button)
const handleRoundComplete = async () => {
  // Swap teams
  const nextWordSelectingTeam = current === 'teamA' ? 'teamB' : 'teamA';

  await updateGame(gameId, {
    currentRound: (game.currentRound || 1) + 1,
    gamePhase: 'wordSelection',
    'currentRoundData.wordSelectingTeam': nextWordSelectingTeam,
    'currentRoundData.performingTeam': nextPerformingTeam,
    // Clear all round-specific data
    'currentRoundData.correctlyGuessed': null,
    'currentRoundData.guesses': {},
    // ... etc
  });
};

// End game (called by host)
const handleEndGame = async () => {
  await updateGame(gameId, {
    status: 'finished',
    gamePhase: 'finished'
  });

  // Update user stats (gamesPlayed, gamesWon, totalPoints)
};
```

**Phase Rendering:**
```jsx
{gamePhase === 'wordSelection' && <WordSelectionPhase />}
{gamePhase === 'performing' && <WordRevealPhase />}
{gamePhase === 'scoring' && <QuickScorePhase />}
{gamePhase === 'roundComplete' && (
  /* Shows scores + "Start Next Round" button */
)}
{gamePhase === 'finished' && (
  /* Shows winner + individual rankings */
)}
```

---

## Recent Bug Fixes (Important!)

1. **Performer not seeing word** ✅ FIXED
   - Issue: Timer component had z-index 9999, covering word at z-index 9998
   - Fix: Embedded Timer inside word display container, positioned absolutely
   - File: `WordRevealPhase.jsx:255-268`

2. **Timer not counting down** ✅ FIXED
   - Issue: `timerStarted` state never set to true after performer countdown
   - Fix: Call `revealWordAndStartTimer()` after countdown, sets state + Firebase
   - File: `WordRevealPhase.jsx:38-56`

3. **Wrong team getting points** ✅ FIXED
   - Issue: Scoring logic was backwards
   - Fix: If `scored === true`, guessing team gets point; if `false`, word-selecting team gets point
   - File: `QuickScorePhase.jsx:126-170`

4. **Guess input disappearing after Round 1** ✅ FIXED
   - Issue: `correctlyGuessed` flag not cleared between rounds
   - Fix: Clear all guess-related flags in `handleRoundComplete()`
   - File: `GamePlayPage.jsx:125-129`

5. **Round number showing wrong value** ✅ FIXED
   - Issue: Button showed "Start Round 1" after Round 1
   - Fix: Display `currentRound + 1` in button text
   - File: `GamePlayPage.jsx:534`

6. **Performer could guess** ✅ FIXED
   - Issue: Performer saw guess input field
   - Fix: Added `!isPerformer` check to guessing view condition
   - File: `WordRevealPhase.jsx:320`

7. **Custom words not syncing** ✅ FIXED
   - Issue: Custom words only in local state
   - Fix: Store in `currentRoundData.wordOptions` in Firebase
   - File: `WordSelectionPhase.jsx`

8. **No "Start Next Round" button** ✅ FIXED
   - Issue: Game auto-advanced to next round
   - Fix: Added `roundComplete` phase with manual button for host
   - File: `GamePlayPage.jsx:481-547`

9. **Word not shown after round ends** ✅ FIXED
   - Issue: Guessing team never saw the word
   - Fix: Display word in purple box during round complete phase
   - File: `GamePlayPage.jsx:515-539`

---

## Common Operations

### Creating a New Game
```javascript
// services/firebase.js
const gameId = generateGameId(); // 6-character code
await setDoc(doc(db, 'games', gameId), {
  gameId,
  hostId,
  status: 'lobby',
  settings: { ... },
  players: {},
  teams: { teamA: [], teamB: [] },
  currentRound: 0,
  scores: { teamA: 0, teamB: 0 },
  playerPoints: {},
  createdAt: serverTimestamp()
});
```

### Joining a Game
```javascript
await updateGame(gameId, {
  [`players.${userId}`]: {
    name: playerName,
    isActive: true,
    joinedAt: new Date().toISOString()
  }
});
```

### Subscribing to Game Updates
```javascript
const unsubscribe = onSnapshot(
  doc(db, 'games', gameId),
  (doc) => {
    const gameData = doc.data();
    setCurrentGame(gameData); // Update Zustand store
  }
);

return () => unsubscribe(); // Cleanup
```

### Updating Game State
```javascript
await updateGame(gameId, {
  'currentRoundData.selectedWord': 'Robot Therapist',
  'currentRoundData.performerId': 'user456',
  gamePhase: 'performing'
});
```

---

## Important Technical Notes

### Real-Time Sync
- All game state changes go through Firebase Firestore
- Every client subscribes to the game document
- When one player updates → all players see changes instantly
- Use dot notation for nested updates: `'currentRoundData.votes'`

### State Management
- **Zustand stores:**
  - `authStore`: User authentication (user, userProfile, loading)
  - `gameStore`: Current game (currentGame, gameId, isHost, myTeam)
- **Why Zustand?** Simple, no boilerplate, works with hooks

### Timer & Wake Lock
```javascript
// Request wake lock to prevent screen sleep
const wakeLock = await navigator.wakeLock.request('screen');

// Timer countdown
useEffect(() => {
  if (isActive && timeLeft > 0) {
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isActive, timeLeft]);
```

### Screen Wake Lock
- Keeps screen on during gameplay
- Activated when timer starts
- Released when timer completes
- Browser support: Chrome, Edge, Safari (limited)

---

## Testing Tips

1. **Multi-Device Testing:**
   - Open multiple browser windows/tabs
   - Use incognito mode for different users
   - Test on actual mobile devices

2. **Game Flow Testing:**
   - Need minimum 4 players to start
   - Test with even (4, 6) and odd (5, 7) player counts
   - Ensure teams split evenly

3. **Edge Cases:**
   - What if host leaves?
   - What if performer's device loses connection?
   - What if two players guess at same time?

4. **Console Debugging:**
   - Check for `🎭 PERFORMER STATE:` logs
   - Check for `✓ Team X gets point!` logs
   - Check for `🚫 Copying is disabled` on copy attempts

---

## Known Limitations

1. **Screenshots can't be fully prevented** - OS-level limitation on web
2. **Google Sign-In CORS issues in dev** - Use Email/Password instead
3. **Screen wake lock not universal** - Some browsers don't support it
4. **Max 20 players** - Firebase real-time listener limit
5. **No host migration** - If host leaves, game is orphaned

---

## Next Steps / TODO

### Immediate Priorities:
1. Stripe integration for payments
2. Free games limit enforcement
3. Profile page with settings
4. Game history tracking

### Future Enhancements:
1. Premium word packs (Movies, Animals, etc.)
2. Achievements system activation
3. Leaderboard implementation
4. Friend system
5. Tournament mode

---

## How to Use This Context

**To start a new conversation with an AI about this project, paste this:**

```
I'm working on a React multiplayer charades game with Firebase. Please read the AI_CONTEXT.md file in the game/ directory to understand the project architecture, current implementation status, and recent bug fixes. The core gameplay is fully functional - team play, individual scoring, word selection, performer view with anti-cheat, and manual round control all work. I need help with [YOUR SPECIFIC QUESTION/TASK].
```

**Example specific prompts:**
- "I need to add a feature that..."
- "There's a bug where..."
- "How do I deploy this to..."
- "Can you explain how the scoring logic works?"
- "I want to add a new game mode..."

---

## File Locations

**Key files to understand:**
- `game/src/pages/GamePlayPage.jsx` - Main orchestrator
- `game/src/components/WordRevealPhase.jsx` - Most complex component
- `game/src/components/QuickScorePhase.jsx` - Scoring logic
- `game/src/services/firebase.js` - All Firebase operations
- `game/src/data/wordPacks.js` - Word database
- `game/README.md` - Complete documentation

---

**Last Updated:** January 2025
**Version:** Beta 1.0
**Status:** Core gameplay complete ✅ | Monetization pending ⏳
