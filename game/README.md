# 🎭 Charades Party - Multiplayer Real-Time Game

A mobile-first, real-time multiplayer charades game built with React, Firebase, and Stripe.

## ✨ Features

### Core Gameplay
- 📱 **Mobile-First Design** - Optimized for phone screens
- ⚡ **Real-Time Sync** - Firebase real-time database for instant updates
- 👥 **Team-Based Play** - Random team assignment with individual tracking
- 🎯 **Word Selection System** - Vote on words or submit custom ones
- ⏱️ **Customizable Timer** - Set game duration (30s-120s)
- 🏆 **Score Tracking** - Real-time scoreboard

### Monetization
- 🆓 **Free Tier** - 3 games per month
- 💎 **Premium** - $4.99/year unlimited access
- 💳 **Stripe Integration** - Secure payment processing

### Progression System
- 📊 **Levels & XP** - Level up from "Novice Mime" to "Drama Legend"
- 🏅 **Achievements** - 15+ unlockable achievements
- 📈 **Leaderboards** - Global and friends rankings
- 📜 **Game History** - Track all past games and stats

### Word Packs
- 🎨 **Classic Pack** - 100 funny charades words (FREE)
- 🎬 **Movies & TV** - Premium pack
- 🐾 **Animals & Nature** - Premium pack
- 🔥 **Pop Culture 2024** - Premium pack
- 🔞 **18+ Mature Pack** - Premium pack
- ✍️ **Custom Packs** - Create and share your own (Premium)

### Social Features
- 🔗 **Shareable Links** - Invite friends with a game code
- 📱 **Share Highlights** - Share epic moments
- 🎁 **Referral System** - Invite friends, earn rewards
- 👫 **Friend System** - Add players and see when they're online

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier works)
- Stripe account (for payments)

### Installation

1. **Install dependencies:**
```bash
cd game
npm install
```

2. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google & Email/Password)
   - Enable Firestore Database
   - Enable Hosting
   - Copy your config and update `src/services/firebase.js`

3. **Set up Stripe:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Get your publishable key
   - Create a product for the $4.99/year subscription
   - Update Stripe keys in environment

4. **Configure Firebase (Important!):**

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

5. **Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
game/
├── src/
│   ├── components/          # React components
│   │   ├── LoadingScreen.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CreateGamePage.jsx
│   │   ├── GameLobbyPage.jsx
│   │   ├── GamePlayPage.jsx
│   │   └── ...
│   ├── services/           # External services
│   │   └── firebase.js
│   ├── stores/             # Zustand state management
│   │   ├── authStore.js
│   │   └── gameStore.js
│   ├── data/               # Static data
│   │   ├── wordPacks.js    # 100 funny words
│   │   └── achievements.js
│   ├── styles/             # CSS files
│   │   └── global.css
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── functions/              # Firebase Cloud Functions
├── package.json
├── vite.config.js
└── README.md
```

## 🎮 How to Play

### For Hosts:
1. Sign in and click "Create Game"
2. Configure settings (timer, word packs)
3. Share the game code/link with friends
4. Wait for players to join
5. Start the game when ready

### For Players:
1. Click the shared link or enter game code
2. Enter your name
3. Wait in lobby for host to start
4. Get assigned to a team
5. Take turns selecting words and performing!

### Game Flow:
1. **Word Selection** (Team A) + **Performer Selection** (Team B) happen in parallel
2. Performer gets ready (3-2-1 countdown)
3. Word reveals on performer's screen
4. Timer starts (visible to all)
5. Team guesses the word
6. **Quick-score** - First team member taps Yes/No (3-sec undo window)
7. Teams swap roles
8. Repeat until game ends

## 🛠️ Development

### Build for production:
```bash
npm run build
```

### Deploy to Firebase:
```bash
npm run deploy
```

### Environment Variables

Create a `.env` file in the `/game` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 🔧 Configuration

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
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
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
        resource.data.hostId == request.auth.uid;
    }

    // Word Packs
    match /wordPacks/{packId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Firebase Cloud Functions

Set up cloud functions for:
- Stripe checkout session creation
- Subscription verification
- Monthly free games reset
- Leaderboard calculations

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  level: number,
  xp: number,
  gamesPlayed: number,
  gamesWon: number,
  totalPoints: number,
  achievements: string[],
  isPremium: boolean,
  freeGamesRemaining: number,
  freeGamesResetDate: timestamp,
  subscriptionStatus: 'free' | 'premium',
  subscriptionEndDate: timestamp,
  referralCode: string,
  customWordPacks: string[]
}
```

### Games Collection
```javascript
{
  gameId: string,
  hostId: string,
  status: 'lobby' | 'playing' | 'finished',
  settings: {
    timer: number,
    wordPacks: string[],
    allowCustomWords: boolean,
    maxPlayers: number,
    rounds: number | 'unlimited'
  },
  players: {
    [userId]: {
      userId: string,
      name: string,
      team: 'teamA' | 'teamB',
      isActive: boolean
    }
  },
  teams: {
    teamA: string[],
    teamB: string[]
  },
  currentRound: number,
  scores: {
    teamA: number,
    teamB: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎯 TODO - Remaining Features to Implement

The foundation is built! Here's what still needs to be completed:

### High Priority Pages:
- [ ] DashboardPage.jsx - User dashboard with stats
- [ ] CreateGamePage.jsx - Game creation form
- [ ] JoinGamePage.jsx - Join via code/link
- [ ] GameLobbyPage.jsx - Pre-game lobby
- [ ] GamePlayPage.jsx - Main game interface (CRITICAL!)
- [ ] ProfilePage.jsx - User profile & settings
- [ ] LeaderboardPage.jsx - Global rankings
- [ ] SubscriptionPage.jsx - Stripe checkout
- [ ] AdminPage.jsx - Word pack management

### Game Components:
- [ ] WordSelectionPhase.jsx - Voting interface
- [ ] PerformerPhase.jsx - Word reveal & timer
- [ ] ScoringPhase.jsx - Quick-score UI
- [ ] TeamDisplay.jsx - Team roster
- [ ] ScoreBoard.jsx - Live scores
- [ ] Timer.jsx - Countdown with screen wake lock

### Additional Components:
- [ ] AchievementToast.jsx - Achievement unlock popup
- [ ] LevelUpModal.jsx - Level up celebration
- [ ] ShareModal.jsx - Share game highlights
- [ ] FreeGamesWarning.jsx - Free tier limit warning

### Cloud Functions:
- [ ] Create Firebase Functions for Stripe integration
- [ ] Monthly free games reset cron job
- [ ] Leaderboard update triggers

## 🤝 Contributing

This is a closed-source project, but feedback is welcome!

## 📝 License

All rights reserved © 2024

## 🐛 Known Issues

- [ ] Screen wake lock may not work on all browsers
- [ ] iOS Safari may have audio delay for buzzer
- [ ] Need to test with 20+ simultaneous players

## 💡 Future Enhancements

- [ ] Daily challenges
- [ ] Tournament mode
- [ ] Picture charades (drawing)
- [ ] AI performance judge
- [ ] Video highlights
- [ ] More word packs (holidays, trending, etc.)

## 📞 Support

For issues or questions, contact: [your-email@example.com]

---

Built with ❤️ using React, Firebase, and Stripe
