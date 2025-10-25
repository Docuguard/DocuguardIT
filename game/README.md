# 🎭 Charades Party - Multiplayer Real-Time Game

A mobile-first, real-time multiplayer charades game built with React, Firebase, and Stripe.

> **Current Status:** Core gameplay fully implemented and working! Team play, individual scoring, word selection, performer view, timer, and anti-cheat measures all functional.

## ✨ Implemented Features

### Core Gameplay ✅
- 📱 **Mobile-First Design** - Optimized for phone screens with fullscreen views
- ⚡ **Real-Time Sync** - Firebase Firestore for instant updates across all devices
- 👥 **Team-Based Play** - Automatic random team assignment (Team A & Team B)
- 🏆 **Individual Player Scoring** - Track points for each player who guesses correctly
- 🎯 **Word Selection System** - Team voting with custom word submission
- 🎭 **Performer View** - Fullscreen word display with timer and anti-cheat protection
- ⏱️ **Smart Timer** - Auto-stops when word is typed correctly
- 📊 **Real-Time Scoreboard** - Live team and individual scores
- 🎮 **Manual Round Control** - Host decides when to start next round
- 🔄 **Role Rotation** - Teams swap between word selection and guessing each round

### Anti-Cheat Protection 🛡️
- 🚫 **Text Selection Disabled** - Cannot highlight or copy the word
- 🔒 **Copy/Paste Blocked** - Keyboard shortcuts and right-click disabled
- 👁️ **Window Focus Detection** - Word hides when app loses focus (screenshot deterrent)
- 🏷️ **Player Watermark** - Shows "PERFORMER VIEW • [Name]" on screen
- 🔐 **Interaction Prevention** - Word text is unclickable/untouchable

### Game Flow 🎯
1. **Lobby** - Players join via game code, host starts when ready (4+ players required)
2. **Team Assignment** - Players randomly split into Team A and Team B
3. **Parallel Phase** - Team A selects word (voting) + Team B selects performer (simultaneously)
4. **Performance** - Performer sees word fullscreen, timer starts, guessing team types guesses
5. **Auto-Scoring** - If word typed correctly → timer stops, point awarded automatically
6. **Manual Scoring** - If timer runs out → word-selecting team confirms if guessed
7. **Round Complete** - Shows scores, reveals word to everyone, host starts next round
8. **Game End** - Shows team winners + individual player rankings with medals 🥇🥈🥉

### Monetization (Planned) 💎
- 🆓 **Free Tier** - 3 games per month
- 💎 **Premium** - $4.99/year unlimited access
- 💳 **Stripe Integration** - Payment processing (not yet implemented)

### Word Packs 📚
- 🎨 **Classic Pack** - 100 funny charades words (FREE)
  - Examples: "Robot Therapist", "Penguin Sliding on Ice", "T-Rex Trying to Clap"
- ✍️ **Custom Words** - Players can add custom words during word selection
- 🔜 Premium packs coming soon (Movies, Animals, Pop Culture, 18+)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier works)
- Git for version control

### Installation

1. **Clone and navigate:**
```bash
cd game
npm install
```

2. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password recommended, Google Sign-In optional)
   - Create Firestore Database (start in test mode, update rules later)
   - Copy your config and update `src/services/firebase.js`

3. **Configure Firebase:**

Edit `/game/src/services/firebase.js` and replace with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. **Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
game/
├── src/
│   ├── components/          # React components
│   │   ├── LoadingScreen.jsx       ✅ Implemented
│   │   ├── ProtectedRoute.jsx      ✅ Implemented
│   │   ├── WordSelectionPhase.jsx  ✅ Implemented (voting + custom words)
│   │   ├── PerformerSelectionPhase.jsx ✅ Implemented (auto-suggest rotation)
│   │   ├── WordRevealPhase.jsx     ✅ Implemented (performer + guess input)
│   │   ├── QuickScorePhase.jsx     ✅ Implemented (auto-score + manual confirm)
│   │   ├── ScoreBoard.jsx          ✅ Implemented (team + individual scores)
│   │   └── Timer.jsx               ✅ Implemented (countdown + wake lock)
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx            ✅ Implemented (landing page)
│   │   ├── AuthPage.jsx            ✅ Implemented (sign in/up)
│   │   ├── DashboardPage.jsx       ✅ Implemented (user stats)
│   │   ├── CreateGamePage.jsx      ✅ Implemented (game settings)
│   │   ├── JoinGamePage.jsx        ✅ Implemented (enter code)
│   │   ├── GameLobbyPage.jsx       ✅ Implemented (player list + start)
│   │   └── GamePlayPage.jsx        ✅ Implemented (main game orchestrator)
│   ├── services/           # External services
│   │   └── firebase.js             ✅ Implemented (auth, game, user functions)
│   ├── stores/             # Zustand state management
│   │   ├── authStore.js            ✅ Implemented
│   │   └── gameStore.js            ✅ Implemented
│   ├── data/               # Static data
│   │   ├── wordPacks.js            ✅ Implemented (100 words)
│   │   └── achievements.js         ✅ Implemented (15 achievements)
│   ├── styles/             # CSS files
│   │   └── global.css              ✅ Implemented
│   ├── App.jsx             ✅ Implemented (routing)
│   └── main.jsx            ✅ Implemented (entry point)
├── public/                 # Static assets
├── package.json
├── vite.config.js          ✅ Configured (PWA settings)
└── README.md
```

## 🎮 How to Play

### For Hosts:
1. Sign in (email/password or Google)
2. Click "Create Game"
3. Configure settings:
   - Timer duration (30-120 seconds)
   - Word packs (Classic is free)
   - Allow/disallow custom words
4. Share the 6-character game code with friends
5. Wait for at least 4 players to join
6. Click "Start Game" when ready
7. Click "Start Round X →" to begin each round
8. Click "End Game" when finished playing

### For Players:
1. Click "Join Game" or use the shared link
2. Enter the game code (e.g., ABC123)
3. Enter your name
4. Wait in lobby for host to start
5. Get assigned to Team A or Team B
6. Follow game flow:
   - **If your team selects the word:** Vote on words or add custom ones
   - **If you're the performer:** Click "I'm Ready", act out the word when it appears
   - **If you're guessing:** Type your guesses in the text field and submit

### Game Flow (Detailed):

**Round Start:**
- Team A selects a word (voting system)
- Team B selects a performer (auto-suggested for fair rotation)
- Both happen simultaneously

**Performance Phase:**
- Performer clicks "I'm Ready"
- 3-2-1 countdown
- Word appears fullscreen on performer's device (with anti-cheat protection)
- Timer starts counting down (visible to all)
- Guessing team members type guesses
- When correct word typed → timer stops, point awarded automatically

**Scoring Phase:**
- If word was typed: Shows "Point Scored!" with player's name
- If timer expired: Word-selecting team confirms if it was guessed verbally
- Undo window (3 seconds) for manual confirmations

**Round Complete:**
- Shows which team got the point
- Reveals the word to everyone
- Shows current team scores
- Host clicks "Start Round X →" to continue

**Game End:**
- Shows team winner
- Individual player rankings with medals (🥇🥈🥉)
- Total rounds played
- Option to play again or return to dashboard

## 🔧 Firebase Configuration

### Database Schema

**Games Collection** (`/games/{gameId}`):
```javascript
{
  gameId: string,               // 6-character code (e.g., "ABC123")
  hostId: string,               // User ID of host
  status: 'lobby' | 'playing' | 'finished',
  settings: {
    timer: number,              // Duration in seconds (30-120)
    wordPacks: string[],        // Array of pack IDs (e.g., ['classic'])
    allowCustomWords: boolean,  // Can players add custom words?
    maxPlayers: 20,
    rounds: number | 'unlimited'
  },
  players: {
    [userId]: {
      name: string,             // Player's display name
      team: 'teamA' | 'teamB',  // Assigned team
      isActive: boolean,
      joinedAt: timestamp
    }
  },
  teams: {
    teamA: string[],            // Array of user IDs
    teamB: string[]
  },
  currentRound: number,         // Current round number (starts at 1)
  scores: {
    teamA: number,              // Team A's score
    teamB: number               // Team B's score
  },
  playerPoints: {
    [userId]: number            // Individual player points
  },
  currentRoundData: {
    wordSelectingTeam: 'teamA' | 'teamB',
    performingTeam: 'teamA' | 'teamB',
    wordOptions: string[],      // Words available for voting
    votes: { [userId]: string }, // User votes
    selectedWord: string,       // Final word selected
    performerId: string,        // User ID of performer
    wordRevealed: boolean,      // Has word been shown?
    timerStartedAt: timestamp,  // When timer started
    correctlyGuessed: boolean,  // Was word typed correctly?
    guessedBy: string,          // User ID who guessed
    guessedByName: string,      // Name of person who guessed
    guessedByTeam: string,      // Team of person who guessed
    guesses: {                  // All guesses submitted
      [userId]: [{
        guess: string,
        timestamp: string,
        playerName: string
      }]
    },
    scored: boolean,            // Final score result
    scoredBy: string,           // Who confirmed the score
    scoredByName: string
  },
  gamePhase: 'setup' | 'wordSelection' | 'performing' | 'scoring' | 'roundComplete' | 'finished',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Users Collection** (`/users/{userId}`):
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  gamesPlayed: number,
  gamesWon: number,
  totalPoints: number,
  createdAt: timestamp
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Games
    match /games/{gameId} {
      allow read: if true;  // Everyone can read games they have the code for
      allow create: if request.auth != null;
      allow update: if request.auth != null;  // Any authenticated user can update
      allow delete: if request.auth != null &&
        resource.data.hostId == request.auth.uid;  // Only host can delete
    }
  }
}
```

## 🐛 Known Issues & Recent Fixes

### ✅ Fixed Issues:
1. ✅ **Performer not seeing word** - Timer was covering the word display (z-index conflict)
2. ✅ **Timer not counting down** - Timer wasn't starting after performer countdown
3. ✅ **Wrong team getting points** - Scoring logic was reversed
4. ✅ **Guess input disappearing after Round 1** - `correctlyGuessed` flag not cleared
5. ✅ **Round number showing wrong value** - Display logic fixed
6. ✅ **Performer could guess** - Added `!isPerformer` check to guess input
7. ✅ **Custom words not syncing** - Now stored in Firebase and synced to all players
8. ✅ **No "Start Next Round" button** - Added manual round control for host
9. ✅ **Word not shown after round ends** - Added word reveal in round complete screen

### 🚧 Current Limitations:
- Screenshots cannot be fully prevented (OS-level limitation on web apps)
- Google Sign-In may have CORS issues in development (use Email/Password instead)
- Screen wake lock may not work on all browsers
- Maximum 20 players per game (Firebase real-time limit)

## 🎯 TODO - Features Not Yet Implemented

### High Priority:
- [ ] Stripe payment integration
- [ ] Subscription management page
- [ ] Free games limit enforcement (currently no limit)
- [ ] Profile page with settings
- [ ] Leaderboard page
- [ ] Game history tracking

### Medium Priority:
- [ ] Achievements system (UI complete, logic not connected)
- [ ] Levels & XP progression
- [ ] Premium word packs (Movies, Animals, Pop Culture, 18+)
- [ ] Friend system
- [ ] Referral system

### Low Priority:
- [ ] Share game highlights
- [ ] Tournament mode
- [ ] Daily challenges
- [ ] Admin panel for word pack management
- [ ] Email notifications
- [ ] Push notifications (PWA)

### Cloud Functions Needed:
- [ ] Stripe webhook handler
- [ ] Monthly free games reset cron job
- [ ] User cleanup (delete inactive accounts)
- [ ] Leaderboard calculation

## 🛠️ Development

### Build for production:
```bash
npm run build
```

### Deploy to Firebase:
```bash
firebase deploy
```

### Development Tips:
- Use browser DevTools console to see debug logs
- Check Firebase console for database updates
- Test with multiple browser windows/devices
- Use incognito mode to test multiple players on same machine

## 💡 Future Enhancements

- Picture charades (drawing mode)
- Video recording of performances
- AI performance judge
- More word pack categories
- Custom game modes (speed rounds, sudden death, etc.)
- Team chat during gameplay
- Replay system
- Statistics dashboard with charts

## 📞 Support

For issues or questions, create an issue in the repository.

---

**Built with:**
- ⚛️ React 18
- 🔥 Firebase (Auth, Firestore, Hosting)
- 💳 Stripe (planned)
- ⚡ Vite
- 🎨 Framer Motion
- 🎊 React Confetti

**Current Version:** Beta 1.0
**Last Updated:** January 2025
**Status:** Core gameplay complete, monetization pending

---

🎭 **Ready to play charades like never before!** 🎉
