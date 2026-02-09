import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentByApiKey,
  getCurrentRound,
  purchasePack,
  getAgentPackState,
} from '@/lib/game-service';
import { GAME_CONSTANTS, isValidPackSize } from '@/lib/game-types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Missing Authorization header. Use: Bearer YOUR_API_KEY',
        },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7).trim();
    const agent = await getAgentByApiKey(apiKey);

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_API_KEY',
          message: 'Invalid API key. Register first at POST /api/auth/register',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packSize, txHash } = body;

    if (packSize == null || packSize === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_PACK_SIZE',
          message: 'packSize is required. Use 3 (1.5 USDC) or 6 (3 USDC).',
        },
        { status: 400 }
      );
    }

    const size = Number(packSize);
    if (!isValidPackSize(size)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PACK_SIZE',
          message: 'packSize must be 3 or 6. 3 guesses = 1.5 USDC, 6 guesses = 3 USDC.',
        },
        { status: 400 }
      );
    }

    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_TX_HASH',
          message: 'txHash is required. Send USDC to admin wallet and provide the transaction hash.',
          requiredPayment: {
            amount: size === 3 ? GAME_CONSTANTS.PACK_3_PRICE : GAME_CONSTANTS.PACK_6_PRICE,
            currency: 'USDC',
            chainId: GAME_CONSTANTS.CHAIN_ID,
            usdcContract: GAME_CONSTANTS.USDC_CONTRACT,
            adminWallet: GAME_CONSTANTS.ADMIN_WALLET,
          },
        },
        { status: 402 }
      );
    }

    const round = await getCurrentRound();
    if (!round || round.phase !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_ACTIVE_ROUND',
          message: 'No active round. Purchase packs only when a round is active.',
        },
        { status: 400 }
      );
    }

    const result = await purchasePack(agent.id, round.id, size, txHash.trim());

    if (!result.success) {
      const isCooldown = result.error?.includes('cooldown') ?? false;
      return NextResponse.json(
        {
          success: false,
          error: isCooldown ? 'PACK_COOLDOWN' : 'PURCHASE_FAILED',
          message: result.error,
        },
        { status: 400 }
      );
    }

    const packState = await getAgentPackState(agent.id, round.id);
    const nextPackAvailableAt = packState.nextPackAvailableAt;

    return NextResponse.json({
      success: true,
      message: `Pack purchased! ${size} guesses added. You can use them with usePackGuess: true when submitting a guess.`,
      pack: {
        packSize: result.pack!.packSize,
        guessesRemaining: result.pack!.guessesRemaining,
        amount: result.pack!.amount,
        roundId: round.id,
      },
      nextPackAvailableAt: nextPackAvailableAt
        ? new Date(nextPackAvailableAt).toISOString()
        : null,
      jackpotAdded: result.pack!.amount,
    });
  } catch (error) {
    console.error('[API /game/purchase-pack] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
