import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  try {
    const debug = {
      nodeEnv: env.NODE_ENV,
      hasGeminiKey: !!env.GEMINI_API_KEY,
      hasDeepSeekKey: !!env.DEEPSEEK_API_KEY,
      geminiKeyLength: env.GEMINI_API_KEY?.length || 0,
      deepseekKeyLength: env.DEEPSEEK_API_KEY?.length || 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debug);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
