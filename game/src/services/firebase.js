import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy, limit, increment, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user profile
    await createOrUpdateUserProfile(user);

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Create user profile
    await createOrUpdateUserProfile(user, displayName);

    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User profile functions
export const createOrUpdateUserProfile = async (user, displayName = null) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create new user profile
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || 'Anonymous',
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalPoints: 0,
      achievements: [],
      isPremium: false,
      freeGamesRemaining: 3,
      freeGamesResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      subscriptionStatus: 'free',
      subscriptionEndDate: null,
      referralCode: generateReferralCode(),
      referredBy: null,
      customWordPacks: []
    });
  } else {
    // Update existing user
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });
  }
};

export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUserProfile = async (uid, updates) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
};

// Game functions
export const createGame = async (hostId, settings) => {
  const gameId = generateGameId();
  const gameRef = doc(db, 'games', gameId);

  await setDoc(gameRef, {
    gameId,
    hostId,
    status: 'lobby',
    settings: {
      timer: settings.timer || 60,
      wordPacks: settings.wordPacks || ['classic'],
      allowCustomWords: settings.allowCustomWords !== false,
      maxPlayers: 20,
      rounds: settings.rounds || 'unlimited'
    },
    players: {},
    teams: { teamA: [], teamB: [] },
    currentRound: 0,
    scores: { teamA: 0, teamB: 0 },
    playerPoints: {}, // Track individual player points
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return gameId;
};

export const joinGame = async (gameId, userId, playerName) => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data();
  const playerCount = Object.keys(game.players).length;

  if (playerCount >= game.settings.maxPlayers) {
    throw new Error('Game is full');
  }

  await updateDoc(gameRef, {
    [`players.${userId}`]: {
      userId,
      name: playerName,
      joinedAt: serverTimestamp(),
      team: null,
      isActive: true
    },
    updatedAt: serverTimestamp()
  });

  return gameDoc.data();
};

export const subscribeToGame = (gameId, callback) => {
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
};

export const updateGame = async (gameId, updates) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Word pack functions
export const getWordPacks = async () => {
  const packsRef = collection(db, 'wordPacks');
  const snapshot = await getDocs(packsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Leaderboard functions
export const getGlobalLeaderboard = async (limitCount = 100) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('totalPoints', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, index) => ({
    rank: index + 1,
    ...doc.data()
  }));
};

// Achievement functions
export const unlockAchievement = async (userId, achievementId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const achievements = userDoc.data().achievements || [];

    if (!achievements.includes(achievementId)) {
      achievements.push(achievementId);

      await updateDoc(userRef, {
        achievements,
        updatedAt: serverTimestamp()
      });

      return true; // Achievement unlocked
    }
  }

  return false; // Achievement already unlocked
};

// Subscription functions
export const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
export const verifySubscription = httpsCallable(functions, 'verifySubscription');

// Utility functions
function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Free games tracking
export const checkFreeGamesRemaining = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const resetDate = new Date(userData.freeGamesResetDate);
    const now = new Date();

    // Reset free games if it's a new month
    if (now > resetDate) {
      const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await updateDoc(userRef, {
        freeGamesRemaining: 3,
        freeGamesResetDate: nextResetDate.toISOString()
      });
      return 3;
    }

    return userData.freeGamesRemaining;
  }

  return 0;
};

export const decrementFreeGames = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    freeGamesRemaining: increment(-1)
  });
};

// Export missing function
import { getDocs } from 'firebase/firestore';
