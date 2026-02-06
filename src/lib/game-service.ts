import { connectToDatabase, COLLECTIONS } from './mongodb';
import {
  Agent,
  Round,
  Guess,
  AgentRoundState,
  PrizeDistribution,
  GAME_CONSTANTS,
  calculateGuessCost,
  generateApiKey,
  generateAgentId,
  hashWord,
} from './game-types';
import { WORD_DICTIONARY } from './words';

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

export async function registerAgent(walletAddress: string, name: string): Promise<{ agent: Agent; apiKey: string }> {
  const { db } = await connectToDatabase();
  
  // Check if wallet already registered
  const existing = await db.collection(COLLECTIONS.AGENTS).findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });
  
  if (existing) {
    return { 
      agent: existing as unknown as Agent, 
      apiKey: existing.apiKey 
    };
  }

  const apiKey = generateApiKey();
  const agent: Agent = {
    id: generateAgentId(),
    walletAddress: walletAddress.toLowerCase(),
    name,
    apiKey,
    createdAt: Date.now(),
    totalGuesses: 0,
    totalWins: 0,
    totalEarnings: 0,
    lastActiveAt: Date.now(),
  };

  await db.collection(COLLECTIONS.AGENTS).insertOne(agent);
  return { agent, apiKey };
}

export async function getAgentByApiKey(apiKey: string): Promise<Agent | null> {
  const { db } = await connectToDatabase();
  const agent = await db.collection(COLLECTIONS.AGENTS).findOne({ apiKey });
  return agent as Agent | null;
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  const { db } = await connectToDatabase();
  const agent = await db.collection(COLLECTIONS.AGENTS).findOne({ id: agentId });
  return agent as Agent | null;
}

export async function getAgentCount(): Promise<number> {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTIONS.AGENTS).countDocuments();
}

export async function isAdmin(walletAddress: string): Promise<boolean> {
  return walletAddress.toLowerCase() === GAME_CONSTANTS.ADMIN_WALLET.toLowerCase();
}

// ============================================================================
// ROUND OPERATIONS
// ============================================================================

export async function getCurrentRound(): Promise<Round | null> {
  const { db } = await connectToDatabase();
  const round = await db.collection(COLLECTIONS.ROUNDS).findOne(
    { phase: { $in: ['active', 'pending'] } },
    { sort: { id: -1 } }
  );
  return round as Round | null;
}

export async function getLastCompletedRound(): Promise<Round | null> {
  const { db } = await connectToDatabase();
  const round = await db.collection(COLLECTIONS.ROUNDS).findOne(
    { phase: 'completed' },
    { sort: { endedAt: -1 } }
  );
  return round as Round | null;
}

export async function getLatestRound(): Promise<Round | null> {
  const { db } = await connectToDatabase();
  const round = await db.collection(COLLECTIONS.ROUNDS).findOne(
    {},
    { sort: { id: -1 } }
  );
  return round as Round | null;
}

export async function getRound(roundId: number): Promise<Round | null> {
  const { db } = await connectToDatabase();
  const round = await db.collection(COLLECTIONS.ROUNDS).findOne({ id: roundId });
  return round as Round | null;
}

export async function getTotalRoundsPlayed(): Promise<number> {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTIONS.ROUNDS).countDocuments();
}

export async function startNewRound(secretWord: string, initialJackpot: number = 0): Promise<Round | null> {
  const { db } = await connectToDatabase();
  
  // Validate word
  const normalizedWord = secretWord.toUpperCase().trim();
  if (!WORD_DICTIONARY.includes(normalizedWord)) {
    return null;
  }

  // End any existing active round
  await db.collection(COLLECTIONS.ROUNDS).updateMany(
    { phase: 'active' },
    { $set: { phase: 'completed', endedAt: Date.now() } }
  );

  // Get next round ID
  const lastRound = await db.collection(COLLECTIONS.ROUNDS).findOne(
    {},
    { sort: { id: -1 } }
  );
  const nextId = (lastRound?.id || 0) + 1;

  const round: Round = {
    id: nextId,
    secretWord: normalizedWord,
    secretWordHash: hashWord(normalizedWord),
    phase: 'active',
    jackpot: initialJackpot,
    initialJackpot,
    startedAt: Date.now(),
    participantCount: 0,
    totalGuesses: 0,
    guessedWords: [],
  };

  await db.collection(COLLECTIONS.ROUNDS).insertOne(round);
  return round;
}

export async function endRound(reason?: string): Promise<Round | null> {
  const { db } = await connectToDatabase();
  const round = await getCurrentRound();
  
  if (!round) return null;

  await db.collection(COLLECTIONS.ROUNDS).updateOne(
    { id: round.id },
    { 
      $set: { 
        phase: 'completed', 
        endedAt: Date.now() 
      } 
    }
  );

  return { ...round, phase: 'completed', endedAt: Date.now() };
}

// ============================================================================
// GUESS OPERATIONS
// ============================================================================

export async function getAgentRoundState(agentId: string, roundId: number): Promise<AgentRoundState | null> {
  const { db } = await connectToDatabase();
  
  const guesses = await db.collection(COLLECTIONS.GUESSES)
    .find({ roundId, agentId })
    .sort({ timestamp: 1 })
    .toArray();

  if (guesses.length === 0) return null;

  // Get participation order
  const allGuesses = await db.collection(COLLECTIONS.GUESSES)
    .find({ roundId })
    .sort({ timestamp: 1 })
    .toArray();
  
  const uniqueAgents: string[] = [];
  for (const g of allGuesses) {
    if (!uniqueAgents.includes(g.agentId)) {
      uniqueAgents.push(g.agentId);
    }
  }
  const participationOrder = uniqueAgents.indexOf(agentId) + 1;

  return {
    agentId,
    roundId,
    guessCount: guesses.length,
    freeGuessUsed: guesses.length >= GAME_CONSTANTS.FREE_GUESS_COUNT,
    guesses: guesses.map(g => g.word),
    totalPaid: guesses.reduce((sum, g) => sum + (g.costPaid || 0), 0),
    participationOrder,
  };
}

export async function submitGuess(
  agentId: string, 
  word: string, 
  txHash?: string
): Promise<{ success: boolean; guess?: Guess; error?: string }> {
  const { db } = await connectToDatabase();
  
  const round = await getCurrentRound();
  if (!round || round.phase !== 'active') {
    return { success: false, error: 'No active round' };
  }

  const normalizedWord = word.toUpperCase().trim();
  
  // Validate word
  if (normalizedWord.length !== 5) {
    return { success: false, error: 'Word must be 5 letters' };
  }
  
  if (!WORD_DICTIONARY.includes(normalizedWord)) {
    return { success: false, error: 'Word not in dictionary' };
  }

  // Check if word already guessed this round
  if (round.guessedWords.includes(normalizedWord)) {
    return { success: false, error: 'Word already guessed this round' };
  }

  // Get agent's current state
  const state = await getAgentRoundState(agentId, round.id);
  const guessNumber = (state?.guessCount || 0) + 1;
  const cost = calculateGuessCost(guessNumber);

  // Check if payment required
  if (cost > 0 && !txHash) {
    return { 
      success: false, 
      error: `Payment of ${cost} USDC required. Provide txHash.` 
    };
  }

  // Check if correct
  const isCorrect = normalizedWord === round.secretWord;

  // Create guess record
  const guess: Guess = {
    id: `guess_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    roundId: round.id,
    agentId,
    word: normalizedWord,
    isCorrect,
    guessNumber,
    costPaid: cost,
    txHash,
    timestamp: Date.now(),
  };

  await db.collection(COLLECTIONS.GUESSES).insertOne(guess);

  // Update round
  const isNewParticipant = !state;
  await db.collection(COLLECTIONS.ROUNDS).updateOne(
    { id: round.id },
    {
      $inc: { 
        totalGuesses: 1, 
        jackpot: cost,
        participantCount: isNewParticipant ? 1 : 0 
      },
      $push: { guessedWords: normalizedWord } as any,
    }
  );

  // Update agent stats
  await db.collection(COLLECTIONS.AGENTS).updateOne(
    { id: agentId },
    { 
      $inc: { totalGuesses: 1 },
      $set: { lastActiveAt: Date.now() }
    }
  );

  // Handle win
  if (isCorrect) {
    await handleWin(round.id, agentId);
  }

  return { success: true, guess };
}

async function handleWin(roundId: number, winnerId: string): Promise<void> {
  const { db } = await connectToDatabase();
  
  const round = await getRound(roundId);
  const winner = await getAgentById(winnerId);
  
  if (!round || !winner) return;

  // Calculate prize distribution
  const jackpot = round.jackpot;
  const winnerAmount = jackpot * GAME_CONSTANTS.WINNER_PERCENTAGE;
  const participantsAmount = jackpot * GAME_CONSTANTS.PARTICIPANTS_PERCENTAGE;
  const treasuryAmount = jackpot * GAME_CONSTANTS.TREASURY_PERCENTAGE;

  // Get first 15 participants
  const allGuesses = await db.collection(COLLECTIONS.GUESSES)
    .find({ roundId })
    .sort({ timestamp: 1 })
    .toArray();
  
  const uniqueAgentIds: string[] = [];
  for (const g of allGuesses) {
    if (!uniqueAgentIds.includes(g.agentId) && uniqueAgentIds.length < GAME_CONSTANTS.MAX_PARTICIPANTS_FOR_REWARD) {
      uniqueAgentIds.push(g.agentId);
    }
  }

  const participantsShare = uniqueAgentIds.length > 0 ? participantsAmount / uniqueAgentIds.length : 0;
  const participants: { agentId: string; walletAddress: string; share: number }[] = [];

  for (const agentId of uniqueAgentIds) {
    const agent = await getAgentById(agentId);
    if (agent) {
      participants.push({
        agentId,
        walletAddress: agent.walletAddress,
        share: participantsShare,
      });
      
      // Update agent earnings
      await db.collection(COLLECTIONS.AGENTS).updateOne(
        { id: agentId },
        { $inc: { totalEarnings: participantsShare } }
      );
    }
  }

  // Update winner
  await db.collection(COLLECTIONS.AGENTS).updateOne(
    { id: winnerId },
    { 
      $inc: { 
        totalWins: 1, 
        totalEarnings: winnerAmount 
      } 
    }
  );

  const prizeDistribution: PrizeDistribution = {
    winnerAmount,
    participantsAmount,
    participantsShare,
    treasuryAmount,
    participants,
  };

  // End round
  await db.collection(COLLECTIONS.ROUNDS).updateOne(
    { id: roundId },
    {
      $set: {
        phase: 'completed',
        endedAt: Date.now(),
        winnerId,
        winnerWallet: winner.walletAddress,
        prizeDistribution,
      },
    }
  );
}

// ============================================================================
// WORD OPERATIONS
// ============================================================================

export async function getAvailableWords(roundId: number): Promise<string[]> {
  const round = await getRound(roundId);
  if (!round) return WORD_DICTIONARY;
  
  return WORD_DICTIONARY.filter(w => !round.guessedWords.includes(w));
}

export async function getGuessedWords(roundId: number): Promise<string[]> {
  const round = await getRound(roundId);
  return round?.guessedWords || [];
}

export function getWordCount(): number {
  return WORD_DICTIONARY.length;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export async function getLeaderboard(): Promise<{
  topWinners: { agentId: string; name: string; wins: number; earnings: number }[];
  recentWinners: { roundId: number; agentId: string; name: string; word: string; prize: number; timestamp: number }[];
}> {
  const { db } = await connectToDatabase();

  // Top winners by earnings
  const topAgents = await db.collection(COLLECTIONS.AGENTS)
    .find({ totalWins: { $gt: 0 } })
    .sort({ totalEarnings: -1 })
    .limit(10)
    .toArray();

  const topWinners = topAgents.map(a => ({
    agentId: a.id,
    name: a.name,
    wins: a.totalWins,
    earnings: a.totalEarnings,
  }));

  // Recent winners
  const recentRounds = await db.collection(COLLECTIONS.ROUNDS)
    .find({ phase: 'completed', winnerId: { $exists: true } })
    .sort({ endedAt: -1 })
    .limit(10)
    .toArray();

  const recentWinners: { roundId: number; agentId: string; name: string; word: string; prize: number; timestamp: number }[] = [];
  
  for (const round of recentRounds) {
    const agent = await getAgentById(round.winnerId);
    if (agent) {
      recentWinners.push({
        roundId: round.id,
        agentId: round.winnerId,
        name: agent.name,
        word: round.secretWord,
        prize: round.prizeDistribution?.winnerAmount || 0,
        timestamp: round.endedAt,
      });
    }
  }

  return { topWinners, recentWinners };
}

// ============================================================================
// ROUND GUESSES (for admin)
// ============================================================================

export async function getRoundGuesses(roundId: number): Promise<Guess[]> {
  const { db } = await connectToDatabase();
  const guesses = await db.collection(COLLECTIONS.GUESSES)
    .find({ roundId })
    .sort({ timestamp: 1 })
    .toArray();
  return guesses as unknown as Guess[];
}
