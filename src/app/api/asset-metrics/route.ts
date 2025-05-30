import { NextResponse, NextRequest } from 'next/server';
import { getAssetMetrics } from '@/app/services/assetMetricsService';

export async function GET(request: NextRequest) {
  const assetName = request.nextUrl.searchParams.get('asset-name');
  const isPlan = request.nextUrl.searchParams.get('isPlan');

  if (!assetName) {
    return NextResponse.json({ error: 'Asset name is required' }, { status: 400 });
  }

  try {
    const data = await getAssetMetrics(assetName, isPlan?.toLowerCase() === 'true');
    console.log(data);

    if (!data[assetName] || Object.keys(data[assetName]).length === 0) {
      return NextResponse.json({ error: 'Asset not found or has no data' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching asset details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
