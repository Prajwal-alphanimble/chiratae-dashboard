import { dataCount, getCount } from '@/app/services/dashboardDetailsService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getCount();
    
    return NextResponse.json(data );
  } catch (error: unknown) {
    console.error('Error fetching count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch count';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
