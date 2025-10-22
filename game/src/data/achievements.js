// Achievement definitions for the charades game

export const achievements = {
  speedDemon: {
    id: 'speedDemon',
    name: 'Speed Demon',
    description: 'Guessed a word in under 10 seconds',
    icon: '⚡',
    xpReward: 50,
    condition: (gameData) => {
      return gameData.guessTime && gameData.guessTime < 10;
    }
  },

  mindReader: {
    id: 'mindReader',
    name: 'Mind Reader',
    description: '5 correct guesses in a row',
    icon: '🧠',
    xpReward: 100,
    condition: (userStats) => {
      return userStats.currentStreak >= 5;
    }
  },

  partyAnimal: {
    id: 'partyAnimal',
    name: 'Party Animal',
    description: 'Hosted 10 games',
    icon: '🎉',
    xpReward: 150,
    condition: (userStats) => {
      return userStats.gamesHosted >= 10;
    }
  },

  wordsmith: {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: '20 custom words used by other players',
    icon: '✍️',
    xpReward: 200,
    condition: (userStats) => {
      return userStats.customWordsUsed >= 20;
    }
  },

  comebackKing: {
    id: 'comebackKing',
    name: 'Comeback King',
    description: 'Won after being down 5 points',
    icon: '👑',
    xpReward: 250,
    condition: (gameData) => {
      return gameData.largestComeback >= 5 && gameData.won;
    }
  },

  perfectRound: {
    id: 'perfectRound',
    name: 'Perfect Round',
    description: 'Your team guessed all words in a round',
    icon: '💯',
    xpReward: 100,
    condition: (roundData) => {
      return roundData.wordsGuessed === roundData.totalWords;
    }
  },

  socialButterfly: {
    id: 'socialButterfly',
    name: 'Social Butterfly',
    description: 'Played with 50 different people',
    icon: '🦋',
    xpReward: 300,
    condition: (userStats) => {
      return userStats.uniquePlayers >= 50;
    }
  },

  nightOwl: {
    id: 'nightOwl',
    name: 'Night Owl',
    description: 'Played a game after midnight',
    icon: '🦉',
    xpReward: 50,
    condition: (gameData) => {
      const hour = new Date(gameData.timestamp).getHours();
      return hour >= 0 && hour < 6;
    }
  },

  earlyBird: {
    id: 'earlyBird',
    name: 'Early Bird',
    description: 'Played a game before 7 AM',
    icon: '🐦',
    xpReward: 50,
    condition: (gameData) => {
      const hour = new Date(gameData.timestamp).getHours();
      return hour >= 5 && hour < 7;
    }
  },

  winStreak: {
    id: 'winStreak',
    name: 'On Fire',
    description: 'Won 3 games in a row',
    icon: '🔥',
    xpReward: 200,
    condition: (userStats) => {
      return userStats.winStreak >= 3;
    }
  },

  marathonPlayer: {
    id: 'marathonPlayer',
    name: 'Marathon Player',
    description: 'Played for over 2 hours straight',
    icon: '🏃',
    xpReward: 150,
    condition: (gameData) => {
      return gameData.sessionDuration >= 7200; // 2 hours in seconds
    }
  },

  firstBlood: {
    id: 'firstBlood',
    name: 'First Blood',
    description: 'Won your first game',
    icon: '🎯',
    xpReward: 100,
    condition: (userStats) => {
      return userStats.gamesWon === 1;
    }
  },

  veteran: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Played 100 games',
    icon: '🎖️',
    xpReward: 500,
    condition: (userStats) => {
      return userStats.gamesPlayed >= 100;
    }
  },

  expressionist: {
    id: 'expressionist',
    name: 'Expressionist',
    description: 'Performed 50 words successfully',
    icon: '🎭',
    xpReward: 200,
    condition: (userStats) => {
      return userStats.successfulPerformances >= 50;
    }
  },

  teamPlayer: {
    id: 'teamPlayer',
    name: 'Team Player',
    description: 'Your team won with a perfect score',
    icon: '🤝',
    xpReward: 300,
    condition: (gameData) => {
      return gameData.won && gameData.opponentScore === 0;
    }
  }
};

// XP levels and requirements
export const levels = [
  { level: 1, xpRequired: 0, title: 'Novice Mime' },
  { level: 2, xpRequired: 100, title: 'Novice Mime' },
  { level: 3, xpRequired: 250, title: 'Amateur Actor' },
  { level: 4, xpRequired: 500, title: 'Amateur Actor' },
  { level: 5, xpRequired: 1000, title: 'Amateur Actor' },
  { level: 6, xpRequired: 1500, title: 'Pro Performer' },
  { level: 7, xpRequired: 2200, title: 'Pro Performer' },
  { level: 8, xpRequired: 3000, title: 'Pro Performer' },
  { level: 9, xpRequired: 4000, title: 'Drama Legend' },
  { level: 10, xpRequired: 5500, title: 'Drama Legend' },
  { level: 11, xpRequired: 7500, title: 'Drama Legend' },
  { level: 12, xpRequired: 10000, title: 'Master Charades Champion' }
];

export const getLevelInfo = (xp) => {
  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
      break;
    }
  }

  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = nextLevel.xpRequired === currentLevel.xpRequired ? 1 : xpInCurrentLevel / xpNeededForNext;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xp,
    xpInCurrentLevel,
    xpNeededForNext: nextLevel.xpRequired - xp,
    progress,
    nextLevel: nextLevel.level,
    nextTitle: nextLevel.title
  };
};

export const checkAchievements = (userStats, gameData, roundData) => {
  const unlockedAchievements = [];

  Object.values(achievements).forEach(achievement => {
    // Check if already unlocked
    if (userStats.achievements?.includes(achievement.id)) {
      return;
    }

    // Check condition
    let conditionMet = false;
    try {
      if (achievement.id.includes('Round')) {
        conditionMet = achievement.condition(roundData);
      } else if (achievement.id.includes('Game') || achievement.id.includes('comeback') || achievement.id.includes('perfect')) {
        conditionMet = achievement.condition(gameData);
      } else {
        conditionMet = achievement.condition(userStats);
      }
    } catch (e) {
      conditionMet = false;
    }

    if (conditionMet) {
      unlockedAchievements.push(achievement);
    }
  });

  return unlockedAchievements;
};
