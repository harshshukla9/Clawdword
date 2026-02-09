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
  // Guess packs: 3 guesses = 1.5 USDC, 6 guesses = 3 USDC; 1 pack per 24h cooldown
  PACK_3_GUESSES: 3,
  PACK_3_PRICE: 1.5,
  PACK_6_GUESSES: 6,
  PACK_6_PRICE: 3,
  PACK_COOLDOWN_MS: 24 * 60 * 60 * 1000,
  // Bonus words: admin sets 10 per round; first discovered = 3 USDC, then decreasing
  BONUS_WORDS_COUNT: 10,
  BONUS_FIRST_REWARD: 3,
  BONUS_REWARD_DECREASE: 0.3,
} as const;

export const BONUS_REWARDS = (() => {
  const arr: number[] = [];
  for (let i = 0; i < GAME_CONSTANTS.BONUS_WORDS_COUNT; i++) {
    arr.push(Math.max(0, GAME_CONSTANTS.BONUS_FIRST_REWARD - i * GAME_CONSTANTS.BONUS_REWARD_DECREASE));
  }
  return arr;
})();

/** Check if word is a bonus word for this round (admin-defined list only; not exposed to agents). */
export function isBonusWordForRound(round: { bonusWords?: string[] }, word: string): boolean {
  const list = round.bonusWords;
  if (!list || list.length === 0) return false;
  return list.includes(word.toUpperCase().trim());
}

export function getBonusRewardForOrder(orderIndex: number): number {
  return BONUS_REWARDS[orderIndex] ?? 0;
}

export const GUESS_PACK_OPTIONS = [
  { size: 3, price: GAME_CONSTANTS.PACK_3_PRICE },
  { size: 6, price: GAME_CONSTANTS.PACK_6_PRICE },
] as const;

export function getPackPrice(packSize: number): number | null {
  if (packSize === GAME_CONSTANTS.PACK_3_GUESSES) return GAME_CONSTANTS.PACK_3_PRICE;
  if (packSize === GAME_CONSTANTS.PACK_6_GUESSES) return GAME_CONSTANTS.PACK_6_PRICE;
  return null;
}

export function isValidPackSize(packSize: number): packSize is 3 | 6 {
  return packSize === 3 || packSize === 6;
}

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
  /** Admin-defined 10 bonus words for this round (server-only; never sent to clients to prevent cheating). */
  bonusWords?: string[];
  bonusDiscoveries?: BonusDiscovery[];
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
  usedFromPack?: boolean;
  packSize?: number;      // e.g. 3 or 6 when usedFromPack
  packGuessIndex?: number; // 1-based: 1/3, 2/3, 3/3 when usedFromPack
  timestamp: number;
}

// Guess pack purchase (3 or 6 guesses, 24h cooldown per agent)
export interface GuessPackPurchase {
  id: string;
  agentId: string;
  roundId: number;
  packSize: 3 | 6;
  amount: number;
  txHash: string;
  purchasedAt: number;
  guessesRemaining: number;
}

// Bonus word discovery (first agent to guess a bonus word gets decreasing USDC)
export interface BonusDiscovery {
  word: string;
  agentId: string;
  agentName?: string;
  amount: number;
  order: number;
  timestamp: number;
}

// Agent's state in a round
export interface AgentRoundState {
  agentId: string;
  roundId: number;
  guessCount: number;
  /** Count of guesses on the pay ladder (free + pay-per-guess only; pack guesses do not advance the ladder) */
  paidLadderCount: number;
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
  usePackGuess?: boolean; // use one guess from purchased pack (no payment)
}

export interface PurchasePackRequest {
  packSize: 3 | 6;
  txHash: string;
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
    guessPackOptions: { size: number; price: number }[];
    packCooldownHours: number;
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
