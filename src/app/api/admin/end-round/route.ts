import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, isAdmin, endRound } from '@/lib/game-service';

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7).trim();
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

    const round = await endRound('Admin ended');

    if (!round) {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_ROUND', message: 'No active round to end' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      roundId: round.id,
      secretWord: round.secretWord,
      message: `Round ${round.id} ended. Secret word was: ${round.secretWord}`,
      stats: {
        totalGuesses: round.totalGuesses,
        participantCount: round.participantCount,
        jackpot: round.jackpot,
        winner: round.winnerId || 'None',
      },
    });
  } catch (error) {
    console.error('[API /admin/end-round] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
