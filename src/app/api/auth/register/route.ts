import { NextRequest, NextResponse } from 'next/server';
import { registerAgent } from '@/lib/game-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'MISSING_WALLET', message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'MISSING_NAME', message: 'name is required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_WALLET', message: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const { agent, apiKey } = await registerAgent(walletAddress, name);

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      apiKey,
      message: 'Registration successful. Save your API key securely!',
      walletAddress: agent.walletAddress,
      name: agent.name,
    });
  } catch (error) {
    console.error('[API /auth/register] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
