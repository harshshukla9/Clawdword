import { connectToDatabase, COLLECTIONS } from './mongodb';
import {
  Agent,
  Round,
  Guess,
  GuessPackPurchase,
  AgentRoundState,
  PrizeDistribution,
  BonusDiscovery,
  GAME_CONSTANTS,
  getPackPrice,
  isValidPackSize,
  calculateGuessCost,
  getBonusRewardForOrder,
  isBonusWordForRound,
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

export async function startNewRound(
  secretWord: string,
  initialJackpot: number = 0,
  bonusWords?: string[]
): Promise<Round | null> {
  const { db } = await connectToDatabase();

  const normalizedWord = secretWord.toUpperCase().trim();
  if (!WORD_DICTIONARY.includes(normalizedWord)) {
    return null;
  }

  let normalizedBonusWords: string[] = [];
  if (bonusWords && Array.isArray(bonusWords)) {
    const seen = new Set<string>();
    for (const w of bonusWords) {
      const u = (w || '').toUpperCase().trim();
      if (u.length !== 5 || !WORD_DICTIONARY.includes(u) || seen.has(u)) continue;
      seen.add(u);
      normalizedBonusWords.push(u);
    }
    if (normalizedBonusWords.length !== GAME_CONSTANTS.BONUS_WORDS_COUNT) {
      return null;
    }
  }

  await db.collection(COLLECTIONS.ROUNDS).updateMany(
    { phase: 'active' },
    { $set: { phase: 'completed', endedAt: Date.now() } }
  );

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
    bonusWords: normalizedBonusWords.length > 0 ? normalizedBonusWords : undefined,
    bonusDiscoveries: [],
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
// GUESS PACK OPERATIONS
// ============================================================================

export async function getAgentPackState(
  agentId: string,
  roundId: number
): Promise<{
  packGuessesRemaining: number;
  lastPackPurchasedAt: number | null;
  canPurchasePack: boolean;
  nextPackAvailableAt: number | null;
  packSize?: number; // when active pack exists (3 or 6)
}> {
  const { db } = await connectToDatabase();
  const now = Date.now();
  const cooldownEnd = now - GAME_CONSTANTS.PACK_COOLDOWN_MS;

  // Active pack for this round (guesses remaining)
  const activePack = await db.collection(COLLECTIONS.GUESS_PACKS).findOne(
    { agentId, roundId, guessesRemaining: { $gt: 0 } },
    { sort: { purchasedAt: -1 } }
  ) as GuessPackPurchase | null;

  // Last pack purchase by this agent (any round) for cooldown
  const lastPurchase = await db.collection(COLLECTIONS.GUESS_PACKS).findOne(
    { agentId },
    { sort: { purchasedAt: -1 } }
  ) as GuessPackPurchase | null;

  const packGuessesRemaining = activePack?.guessesRemaining ?? 0;
  const lastPackPurchasedAt = lastPurchase?.purchasedAt ?? null;
  const nextPackAvailableAt =
    lastPackPurchasedAt != null && lastPackPurchasedAt > cooldownEnd
      ? lastPackPurchasedAt + GAME_CONSTANTS.PACK_COOLDOWN_MS
      : null;
  const canPurchasePack = nextPackAvailableAt == null || now >= nextPackAvailableAt;

  return {
    packGuessesRemaining,
    packSize: activePack?.packSize,
    lastPackPurchasedAt,
    canPurchasePack,
    nextPackAvailableAt,
  };
}

function generatePackId(): string {
  return `pack_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export async function purchasePack(
  agentId: string,
  roundId: number,
  packSize: 3 | 6,
  txHash: string
): Promise<{ success: boolean; error?: string; pack?: GuessPackPurchase }> {
  const { db } = await connectToDatabase();

  if (!isValidPackSize(packSize)) {
    return { success: false, error: 'Invalid pack size. Use 3 or 6.' };
  }

  const amount = getPackPrice(packSize)!;
  const round = await getCurrentRound();
  if (!round || round.phase !== 'active' || round.id !== roundId) {
    return { success: false, error: 'No active round or round mismatch.' };
  }

  const packState = await getAgentPackState(agentId, roundId);
  if (!packState.canPurchasePack) {
    return {
      success: false,
      error: `Pack cooldown active. Next pack available at ${new Date(packState.nextPackAvailableAt!).toISOString()}.`,
    };
  }

  const pack: GuessPackPurchase = {
    id: generatePackId(),
    agentId,
    roundId,
    packSize,
    amount,
    txHash,
    purchasedAt: Date.now(),
    guessesRemaining: packSize,
  };

  await db.collection(COLLECTIONS.GUESS_PACKS).insertOne(pack);

  // Add pack amount to round jackpot
  await db.collection(COLLECTIONS.ROUNDS).updateOne(
    { id: roundId },
    { $inc: { jackpot: amount } }
  );

  return { success: true, pack };
}

/** Decrement pack guesses for this agent/round; returns true if a guess was consumed. */
export async function useOnePackGuess(agentId: string, roundId: number): Promise<boolean> {
  const { db } = await connectToDatabase();
  const result = await db.collection(COLLECTIONS.GUESS_PACKS).findOneAndUpdate(
    { agentId, roundId, guessesRemaining: { $gt: 0 } },
    { $inc: { guessesRemaining: -1 } },
    { sort: { purchasedAt: -1 } }
  );
  return result != null;
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

  // Paid ladder: only free guess + pay-per-guess (txHash); pack guesses do not advance cost
  const paidLadderCount = guesses.filter((g: { usedFromPack?: boolean }) => !g.usedFromPack).length;

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
    paidLadderCount,
    freeGuessUsed: guesses.length >= GAME_CONSTANTS.FREE_GUESS_COUNT,
    guesses: guesses.map(g => g.word),
    totalPaid: guesses.reduce((sum, g) => sum + (g.costPaid || 0), 0),
    participationOrder,
  };
}

export async function submitGuess(
  agentId: string,
  word: string,
  txHash?: string,
  usePackGuess?: boolean
): Promise<{ success: boolean; guess?: Guess; error?: string; bonusReward?: number }> {
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

  // Get agent's current state (paidLadderCount = free + pay-per-guess only; pack is separate)
  const state = await getAgentRoundState(agentId, round.id);
  const guessNumber = (state?.guessCount || 0) + 1;
  const paidLadderCount = state?.paidLadderCount ?? 0;
  const cost = calculateGuessCost(paidLadderCount + 1);

  let costPaid = 0;
  let usedFromPack = false;
  let packSize: number | undefined;
  let packGuessIndex: number | undefined;

  if (guessNumber <= GAME_CONSTANTS.FREE_GUESS_COUNT) {
    costPaid = 0;
  } else if (usePackGuess) {
    const packState = await getAgentPackState(agentId, round.id);
    if (packState.packGuessesRemaining <= 0) {
      return {
        success: false,
        error: 'No pack guesses remaining. Purchase a pack or pay per guess with txHash.',
      };
    }
    packSize = packState.packSize ?? 3;
    packGuessIndex = packSize - packState.packGuessesRemaining + 1;
    const consumed = await useOnePackGuess(agentId, round.id);
    if (!consumed) {
      return { success: false, error: 'Failed to use pack guess.' };
    }
    costPaid = 0;
    usedFromPack = true;
  } else if (cost > 0 && !txHash) {
    return {
      success: false,
      error: `Payment of ${cost} USDC required. Send USDC and provide txHash, or use a pack guess (usePackGuess: true) if you have pack guesses remaining.`,
    };
  } else if (cost > 0 && txHash) {
    costPaid = cost;
  }

  // Check if correct
  const isCorrect = normalizedWord === round.secretWord;

  // Create guess record (packGuessIndex/packSize for "1/3", "2/3", "3/3" display when usedFromPack)
  const guess: Guess = {
    id: `guess_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    roundId: round.id,
    agentId,
    word: normalizedWord,
    isCorrect,
    guessNumber,
    costPaid,
    txHash: txHash || undefined,
    usedFromPack: usedFromPack || undefined,
    ...(usedFromPack && packSize != null && packGuessIndex != null
      ? { packSize, packGuessIndex }
      : {}),
    timestamp: Date.now(),
  };

  await db.collection(COLLECTIONS.GUESSES).insertOne(guess);

  // Update round: only add to jackpot if paid (not free, not pack — pack already added on purchase)
  const jackpotIncrement = costPaid;
  const isNewParticipant = !state;
  await db.collection(COLLECTIONS.ROUNDS).updateOne(
    { id: round.id },
    {
      $inc: {
        totalGuesses: 1,
        jackpot: jackpotIncrement,
        participantCount: isNewParticipant ? 1 : 0,
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

  let bonusReward: number | undefined;
  if (!isCorrect && isBonusWordForRound(round, normalizedWord)) {
    const updatedRound = await getRound(round.id) as (Round & { bonusDiscoveries?: BonusDiscovery[] }) | null;
    const discoveries = updatedRound?.bonusDiscoveries ?? [];
    const alreadyDiscovered = discoveries.some((b) => b.word === normalizedWord);
    if (!alreadyDiscovered && discoveries.length < 10) {
      const order = discoveries.length;
      const amount = getBonusRewardForOrder(order);
      const agent = await getAgentById(agentId);
      const discovery: BonusDiscovery = {
        word: normalizedWord,
        agentId,
        agentName: agent?.name,
        amount,
        order,
        timestamp: Date.now(),
      };
      await db.collection(COLLECTIONS.ROUNDS).updateOne(
        { id: round.id },
        { $push: { bonusDiscoveries: discovery } as any }
      );
      await db.collection(COLLECTIONS.AGENTS).updateOne(
        { id: agentId },
        { $inc: { totalEarnings: amount } }
      );
      bonusReward = amount;
    }
  }

  return { success: true, guess, bonusReward };
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
