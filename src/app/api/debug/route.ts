import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debug = {
      note: 'env 管理已移除，密钥由前端传入',
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
