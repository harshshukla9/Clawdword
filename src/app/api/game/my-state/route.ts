import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, getCurrentRound, getAgentRoundState, getAgentPackState } from '@/lib/game-service';
import { calculateGuessCost, GUESS_PACK_OPTIONS } from '@/lib/game-types';

export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Missing Authorization header. Use: Bearer YOUR_API_KEY' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    const agent = await getAgentByApiKey(apiKey);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'INVALID_API_KEY', message: 'Invalid API key. Register first at POST /api/auth/register' },
        { status: 401 }
      );
    }

    const round = await getCurrentRound();

    let currentRoundState = null;
    if (round) {
      const state = await getAgentRoundState(agent.id, round.id);
      const packState = await getAgentPackState(agent.id, round.id);
      const guessCount = state?.guessCount || 0;
      const nextGuessCost = calculateGuessCost(guessCount + 1);

      currentRoundState = {
        roundId: round.id,
        phase: round.phase,
        jackpot: round.jackpot,
        guessCount,
        freeGuessUsed: state?.freeGuessUsed || false,
        nextGuessCost,
        myGuesses: state?.guesses || [],
        totalPaid: state?.totalPaid || 0,
        participationOrder: state?.participationOrder || 0,
        pack: {
          guessesRemaining: packState.packGuessesRemaining,
          canPurchasePack: packState.canPurchasePack,
          nextPackAvailableAt: packState.nextPackAvailableAt
            ? new Date(packState.nextPackAvailableAt).toISOString()
            : null,
          options: GUESS_PACK_OPTIONS,
        },
      };
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        walletAddress: agent.walletAddress,
        totalGuesses: agent.totalGuesses,
        totalWins: agent.totalWins,
        totalEarnings: agent.totalEarnings,
      },
      currentRound: currentRoundState,
    });
  } catch (error) {
    console.error('[API /game/my-state] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
