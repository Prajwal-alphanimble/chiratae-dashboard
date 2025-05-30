import { NextResponse, NextRequest } from 'next/server';
import { getDealListDetails } from '@/app/services/dealListService';

export async function GET(request: NextRequest) {
  const assetName = request.nextUrl.searchParams.get('asset-name');

  if (!assetName) {
    return NextResponse.json({ error: 'Asset name is required' }, { status: 400 });
  }

  try {
    const data = await getDealListDetails(assetName);
    if (!data.deal_list_details.length) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    return NextResponse.json(data.deal_list_details, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching deal list details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
