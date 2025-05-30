import { NextResponse, NextRequest } from 'next/server';
import { ConvertINRtoUSD, ConvertUSDtoINR, INRtoUSD, USDtoINR } from '@/app/services/currencyConversionService';

export async function GET(request: NextRequest) {
  const isINRtoUSD = request.nextUrl.searchParams.get('isINRtoUSD') === 'true';
  const date = request.nextUrl.searchParams.get('date') || "latest";
  const amount = parseInt(request.nextUrl.searchParams.get('amount') || "1");
  const isQuarterly = request.nextUrl.searchParams.get('isQuarterly') === 'true';
  const isAnnual = request.nextUrl.searchParams.get('isAnnual') === 'true';
  
  try {
    if (isINRtoUSD) {
      const data = await ConvertINRtoUSD(date, amount, isQuarterly, isAnnual);
      return NextResponse.json(data);
    }
    return NextResponse.json(await ConvertUSDtoINR(date, amount, isQuarterly, isAnnual));
  } catch (error) {
    console.error('Error in currency conversion:', error);
    return NextResponse.json({ 
      error: `Error in ${isINRtoUSD ? 'INR to USD' : 'USD to INR'} conversion` 
    }, { status: 500 });
  }
}

 