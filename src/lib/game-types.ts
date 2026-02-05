// Game Constants
export const GAME_CONSTANTS = {
  WORD_LENGTH: 5,
  WINNER_PERCENTAGE: 0.80,
  PARTICIPANTS_PERCENTAGE: 0.10,
  TREASURY_PERCENTAGE: 0.10,
  MAX_PARTICIPANTS_FOR_REWARD: 15,
  FREE_GUESS_COUNT: 1,
  BASE_GUESS_COST: 0.5,
  COST_MULTIPLIER: 2,
  CHAIN_ID: 8453, // Base
  USDC_CONTRACT: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDC_DECIMALS: 6,
  MAX_GUESSES_PER_MINUTE: 10,
  ADMIN_WALLET: process.env.ADMIN_WALLET || '0x09Fe5ac53e9aB96755Bd550bC8AeD6b3584F526A',
} as const;

// Agent model
export interface Agent {
  id: string;
  walletAddress: string;
  name: string;
  apiKey: string;
  createdAt: number;
  totalGuesses: number;
  totalWins: number;
  totalEarnings: number;
  lastActiveAt: number;
}

// Round model
export interface Round {
  id: number;
  secretWord: string;
  secretWordHash: string;
  phase: 'pending' | 'active' | 'completed';
  jackpot: number;
  initialJackpot: number;
  startedAt: number;
  endedAt?: number;
  winnerId?: string;
  winnerWallet?: string;
  participantCount: number;
  totalGuesses: number;
  guessedWords: string[];
  prizeDistribution?: PrizeDistribution;
}

// Guess model
export interface Guess {
  id: string;
  roundId: number;
  agentId: string;
  word: string;
  isCorrect: boolean;
  guessNumber: number;
  costPaid: number;
  txHash?: string;
  timestamp: number;
}

// Agent's state in a round
export interface AgentRoundState {
  agentId: string;
  roundId: number;
  guessCount: number;
  freeGuessUsed: boolean;
  guesses: string[];
  totalPaid: number;
  participationOrder: number;
}

// Prize distribution
export interface PrizeDistribution {
  winnerAmount: number;
  participantsAmount: number;
  participantsShare: number;
  treasuryAmount: number;
  participants: { agentId: string; walletAddress: string; share: number }[];
}

// API Request/Response types
export interface RegisterRequest {
  walletAddress: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  agentId?: string;
  apiKey?: string;
  message: string;
  walletAddress?: string;
  name?: string;
  error?: string;
}

export interface GuessRequest {
  word: string;
  txHash?: string;
}

export interface GuessResponse {
  success: boolean;
  roundId?: number;
  word?: string;
  isCorrect?: boolean;
  guessNumber?: number;
  costPaid?: number;
  message: string;
  nextGuessCost?: number;
  remainingWords?: number;
  hint?: string;
  prize?: {
    winnerAmount: number;
    jackpot: number;
  };
  secretWord?: string;
  error?: string;
  requiredPayment?: {
    amount: number;
    currency: string;
    chainId: number;
    usdcContract: string;
    adminWallet: string;
  };
}

export interface StartRoundRequest {
  secretWord: string;
  initialJackpot?: number;
}

export interface GameStatusResponse {
  serverTime: number;
  currentRound: {
    id: number;
    phase: string;
    jackpot: number;
    participantCount: number;
    totalGuesses: number;
    guessedWordsCount: number;
    remainingWordsCount: number;
    startedAt: number;
    wordHash: string;
  } | null;
  totalRoundsPlayed: number;
  totalAgentsRegistered: number;
  gameConstants: {
    wordLength: number;
    freeGuesses: number;
    baseGuessCost: number;
    costMultiplier: number;
    winnerPercentage: number;
    participantsPercentage: number;
    maxParticipantsForReward: number;
    chainId: number;
    usdcContract: string;
    adminWallet: string;
  };
}

// Helper function to calculate guess cost
export function calculateGuessCost(guessNumber: number): number {
  if (guessNumber <= GAME_CONSTANTS.FREE_GUESS_COUNT) {
    return 0; // Free guess
  }
  const paidGuessIndex = guessNumber - GAME_CONSTANTS.FREE_GUESS_COUNT - 1;
  return GAME_CONSTANTS.BASE_GUESS_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, paidGuessIndex);
}

// Helper function to generate API key
export function generateApiKey(): string {
  const chars = 'abcdef0123456789';
  let key = 'lhaw_';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// Helper function to generate agent ID
export function generateAgentId(): string {
  return `agent_${Math.random().toString(16).slice(2, 10)}`;
}

// Helper function to hash word (for verification)
export function hashWord(word: string): string {
  // Simple hash for demo - in production use crypto
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    const char = word.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
