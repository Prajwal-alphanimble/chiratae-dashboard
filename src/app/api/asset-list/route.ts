import { getAssetList } from '@/app/services/assetListService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const Sector_ID = parseInt(request.nextUrl.searchParams.get('sid')??"0");
  try {
    const data = await getAssetList(Sector_ID);
    const assetNames = data.asset_details.map((asset: { Asset_Name: string }) => asset.Asset_Name);
    return NextResponse.json({ assetList: assetNames });
  } catch (error: unknown) {
    console.error('Error fetching asset details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
