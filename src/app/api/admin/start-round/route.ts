import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, isAdmin, startNewRound } from '@/lib/game-service';

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    const agent = await getAgentByApiKey(apiKey);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'INVALID_API_KEY', message: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check admin status
    const adminCheck = await isAdmin(agent.walletAddress);
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { secretWord, initialJackpot } = body;

    if (!secretWord) {
      return NextResponse.json(
        { success: false, error: 'MISSING_SECRET_WORD', message: 'secretWord is required' },
        { status: 400 }
      );
    }

    const round = await startNewRound(secretWord, initialJackpot || 0);

    if (!round) {
      return NextResponse.json(
        { success: false, error: 'INVALID_WORD', message: 'Secret word must be a valid 5-letter word from the dictionary' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      roundId: round.id,
      message: `Round ${round.id} started! Secret word hash: ${round.secretWordHash.slice(0, 16)}...`,
      jackpot: round.jackpot,
    });
  } catch (error) {
    console.error('[API /admin/start-round] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
