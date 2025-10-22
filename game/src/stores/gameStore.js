import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  currentGame: null,
  gameId: null,
  isHost: false,
  myTeam: null,
  gamePhase: 'lobby', // lobby, wordSelection, performing, scoring, finished

  setCurrentGame: (game) => set({ currentGame: game }),

  setGameId: (gameId) => set({ gameId }),

  setIsHost: (isHost) => set({ isHost }),

  setMyTeam: (team) => set({ myTeam: team }),

  setGamePhase: (phase) => set({ gamePhase: phase }),

  updateGame: (updates) => {
    const { currentGame } = get();
    if (currentGame) {
      set({ currentGame: { ...currentGame, ...updates } });
    }
  },

  resetGame: () => set({
    currentGame: null,
    gameId: null,
    isHost: false,
    myTeam: null,
    gamePhase: 'lobby'
  })
}));
