import { NextResponse, NextRequest } from 'next/server';
import { getInternationalMetricsDetails } from '@/app/services/internationalMetricsServices';

export async function GET(request: NextRequest) {
  const assetName = request.nextUrl.searchParams.get('asset-name');

  if (!assetName) {
    return NextResponse.json({ error: 'Asset name is required' }, { status: 400 });
  }

  try {
    const data = await getInternationalMetricsDetails(assetName);
    // if (!data.metrics_charts_international.length) {
    //   return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    // }
    return NextResponse.json(data.metrics_charts_international, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching international metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
