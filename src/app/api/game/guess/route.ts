import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentByApiKey,
  getCurrentRound,
  getAgentRoundState,
  getAgentPackState,
  submitGuess,
  getAvailableWords,
  getRound,
} from '@/lib/game-service';
import { calculateGuessCost, GAME_CONSTANTS } from '@/lib/game-types';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { word, txHash, usePackGuess } = body;

    if (!word) {
      return NextResponse.json(
        { success: false, error: 'MISSING_WORD', message: 'word is required' },
        { status: 400 }
      );
    }

    const round = await getCurrentRound();
    if (!round || round.phase !== 'active') {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_ROUND', message: 'No active round to guess in' },
        { status: 400 }
      );
    }

    const state = await getAgentRoundState(agent.id, round.id);
    const guessNumber = (state?.guessCount || 0) + 1;
    const cost = calculateGuessCost(guessNumber);

    // After 1st (free) guess: either pay per guess (txHash) or use a pack guess (usePackGuess: true)
    if (cost > 0 && !txHash && !usePackGuess) {
      return NextResponse.json(
        {
          success: false,
          error: 'PAYMENT_OR_PACK_REQUIRED',
          message: `This guess costs ${cost} USDC. Either send ${cost} USDC and provide txHash, or use a pack guess (usePackGuess: true) if you have pack guesses remaining.`,
          requiredPayment: {
            amount: cost,
            currency: 'USDC',
            chainId: GAME_CONSTANTS.CHAIN_ID,
            usdcContract: GAME_CONSTANTS.USDC_CONTRACT,
            adminWallet: GAME_CONSTANTS.ADMIN_WALLET,
          },
          hint: 'Or purchase a guess pack (POST /api/game/purchase-pack) and use usePackGuess: true.',
        },
        { status: 402 }
      );
    }

    const result = await submitGuess(agent.id, word, txHash, usePackGuess === true);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'GUESS_FAILED', message: result.error },
        { status: 400 }
      );
    }

    const guess = result.guess!;
    const updatedState = await getAgentRoundState(agent.id, round.id);
    const packState = await getAgentPackState(agent.id, round.id);
    const nextCost = calculateGuessCost((updatedState?.guessCount || 0) + 1);

    const response: any = {
      success: true,
      roundId: round.id,
      word: guess.word,
      isCorrect: guess.isCorrect,
      guessNumber: guess.guessNumber,
      costPaid: guess.costPaid,
      usedFromPack: guess.usedFromPack ?? false,
      message: guess.isCorrect
        ? '🎉 CORRECT! You won the jackpot!'
        : `Wrong! "${guess.word}" is not the secret word.`,
    };
    if (result.bonusReward != null) {
      response.bonusWordReward = result.bonusReward;
      response.message += ` Bonus word! +${result.bonusReward.toFixed(1)} USDC.`;
    }

    if (guess.isCorrect) {
      const updatedRound = await getRound(round.id);
      response.prize = {
        winnerAmount: updatedRound!.jackpot * GAME_CONSTANTS.WINNER_PERCENTAGE,
        jackpot: updatedRound!.jackpot,
      };
      response.secretWord = updatedRound!.secretWord;
    } else {
      response.nextGuessCost = nextCost;
      response.packGuessesRemaining = packState.packGuessesRemaining;
      response.remainingWords = (await getAvailableWords(round.id)).length;
      if (nextCost > 0) {
        response.hint =
          packState.packGuessesRemaining > 0
            ? `Next: pay ${nextCost} USDC (txHash) or use pack (usePackGuess: true). ${packState.packGuessesRemaining} pack guess(es) left.`
            : `Next guess costs ${nextCost} USDC (or purchase a pack: POST /api/game/purchase-pack).`;
      } else {
        response.hint = 'Your next guess is free!';
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /game/guess] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
