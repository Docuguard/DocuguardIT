# 🚀 Charades Party - Complete Setup Guide

This guide will walk you through setting up the Charades Party multiplayer game from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed ([Download here](https://nodejs.org/))
- A Google account for Firebase
- A Stripe account for payments ([Sign up](https://dashboard.stripe.com/register))
- Git installed on your machine

## Step 1: Install Dependencies

Navigate to the game directory and install all required packages:

```bash
cd game
npm install
```

This will install:
- React 18
- Firebase SDK
- Stripe SDK
- Vite (build tool)
- React Router
- Zustand (state management)
- And other dependencies

## Step 2: Set Up Firebase

### 2.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `charades-party` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2.2 Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Google** - Click Enable, select support email, click Save
   - **Email/Password** - Click Enable, click Save

### 2.3 Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

### 2.4 Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to "Your apps"
3. Click the **Web icon** (</>)
4. Register app name: `Charades Party Web`
5. Click "Register app"
6. Copy the `firebaseConfig` object

### 2.5 Update Firebase Config in Code

Edit `/game/src/services/firebase.js` and replace the config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2.6 Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Games collection
    match /games/{gameId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
        resource.data.hostId == request.auth.uid;
    }

    // Word packs
    match /wordPacks/{packId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

Click "Publish" to save.

### 2.7 Initialize Firebase in Project

Install Firebase CLI globally:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

Initialize Firebase in your project:

```bash
cd /path/to/DocuguardIT/game
firebase init
```

Select:
- ✓ Firestore
- ✓ Functions
- ✓ Hosting

Follow prompts:
- Select your Firebase project
- Firestore rules file: `firestore.rules` (default)
- Firestore indexes file: `firestore.indexes.json` (default)
- Functions language: JavaScript
- Use ESLint: Yes
- Install dependencies: Yes
- Public directory: `dist`
- Single-page app: Yes
- Set up automatic builds: No

## Step 3: Set Up Stripe

### 3.1 Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or sign in
3. Complete account verification

### 3.2 Create a Product

1. Go to **Products** in Stripe Dashboard
2. Click "+ Add product"
3. Fill in:
   - Name: `Charades Party Premium`
   - Description: `Unlimited games and premium word packs`
   - Pricing model: Standard pricing
   - Price: $4.99
   - Billing period: Yearly
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_...`)

### 3.3 Get Stripe Keys

1. In Stripe Dashboard, go to **Developers → API keys**
2. Copy the following:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Keep this SECRET!

### 3.4 Set Up Stripe Webhook (Optional for now)

For testing, you can use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/webhook
```

## Step 4: Environment Variables

Create a `.env` file in `/game` directory:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
VITE_STRIPE_PRICE_ID=price_your_price_id
```

**Important:** Never commit `.env` to Git! It's already in `.gitignore`.

## Step 5: Initialize Firebase Data

### 5.1 Create Word Packs Collection

The word packs are currently hardcoded in `/game/src/data/wordPacks.js`. To add them to Firestore:

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `wordPacks`
4. Add documents manually or use Firebase Functions to seed data

Or run this script (create `/game/scripts/seedWordPacks.js`):

```javascript
// TODO: Create seed script to upload word packs to Firestore
```

## Step 6: Run the Development Server

Start the Vite development server:

```bash
cd game
npm run dev
```

The app should open at `http://localhost:3000`

## Step 7: Test the App

### Test Authentication:
1. Go to `http://localhost:3000/auth`
2. Try signing up with email/password
3. Try signing in with Google
4. Check Firebase Console → Authentication to see users

### Test Game Creation:
1. Sign in
2. Go to Dashboard
3. Click "Create Game"
4. Configure settings
5. Create game
6. Check Firebase Console → Firestore → games collection

### Test Game Joining:
1. Open game in another browser/incognito window
2. Enter game code
3. Join game
4. Both browsers should see real-time updates

## Step 8: Build for Production

Build the optimized production bundle:

```bash
npm run build
```

This creates a `/dist` folder with optimized files.

## Step 9: Deploy to Firebase Hosting

Deploy to Firebase:

```bash
npm run deploy
```

Or manually:

```bash
firebase deploy
```

Your app will be live at: `https://YOUR_PROJECT.web.app`

## 🎯 What Works Now

✅ User authentication (Google + Email/Password)
✅ User profiles with levels and XP
✅ 100 funny charades words
✅ Game creation and lobby
✅ Player joining
✅ Real-time synchronization
✅ Achievement system (data structure)
✅ Freemium model (3 free games/month tracking)
✅ Responsive mobile-first design

## ⚠️ What Needs to Be Completed

The core gameplay loop still needs implementation:

### Critical - Game Play Page:
- [ ] Word selection voting interface
- [ ] Performer selection UI
- [ ] Word reveal with 3-2-1 countdown
- [ ] Timer with screen wake lock
- [ ] Quick-score interface with undo
- [ ] Team assignment logic
- [ ] Round management
- [ ] Score tracking
- [ ] Game end screen

### High Priority:
- [ ] Stripe payment integration
- [ ] Cloud Functions for subscriptions
- [ ] Leaderboard implementation
- [ ] Achievement unlock notifications
- [ ] Share game highlights
- [ ] Sound effects (timer buzzer)
- [ ] PWA offline support

### Medium Priority:
- [ ] Admin panel for word pack management
- [ ] Custom word pack creation
- [ ] Friend system
- [ ] Game history
- [ ] Profile editing
- [ ] Referral system

## 🐛 Troubleshooting

### "Firebase not configured" error
- Make sure you've updated `/game/src/services/firebase.js` with your actual config
- Restart the dev server after changing config

### "Permission denied" in Firestore
- Check your Firestore security rules
- Make sure you're signed in
- Check browser console for specific errors

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### App not loading
- Check browser console for errors
- Make sure dev server is running (`npm run dev`)
- Try clearing browser cache

### Authentication not working
- Check Firebase Console → Authentication is enabled
- Make sure Google sign-in is configured with your email
- Check Authorized domains in Firebase Console

## 📚 Next Steps

1. **Complete the GamePlayPage** - This is the heart of the app
2. **Add sound effects** - Timer buzzer, achievement unlocks
3. **Implement Stripe** - Set up Cloud Functions for webhooks
4. **Test with real users** - Get feedback on game flow
5. **Polish UI/UX** - Animations, transitions, loading states
6. **Add analytics** - Track user behavior, game stats
7. **Marketing** - Landing page, social media, app stores

## 🔐 Security Checklist

Before going live:

- [ ] Update Firestore rules to production mode
- [ ] Switch Stripe to live keys (not test keys)
- [ ] Set up proper environment variables on hosting
- [ ] Enable CORS for your domain
- [ ] Add rate limiting to prevent abuse
- [ ] Set up monitoring and alerts
- [ ] Review user data privacy
- [ ] Add terms of service and privacy policy

## 📞 Support

If you run into issues:
1. Check the browser console for errors
2. Check Firebase Console logs
3. Review this guide again
4. Check the README.md for additional info

## 🎉 Success!

Once everything is set up, you should have:
- A working authentication system
- User profiles with progression
- Game creation and joining
- Real-time synchronization
- A solid foundation to build the full game!

The next critical step is implementing the **GamePlayPage.jsx** with the actual charades gameplay loop.

---

Built with ❤️ for charades enthusiasts everywhere!
