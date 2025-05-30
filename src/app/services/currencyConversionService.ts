export type INRtoUSD = {
  USD: number;
}

export type USDtoINR = {
  INR: number;
}

/**
 * Converts a quarterly date string (e.g., "1_2023") to ISO format (e.g., "2023-03-31")
 */
function convertQuarterlyDate(quarterlyDate: string): string {
  const [quarter, year] = quarterlyDate.split('_');
  
  switch (quarter) {
    case '1': return `${year}-03-31`;
    case '2': return `${year}-06-30`;
    case '3': return `${year}-09-30`;
    case '4': return `${year}-12-31`;
    default: throw new Error(`Invalid quarter format: ${quarterlyDate}`);
  }
}

/**
 * Converts a year string (e.g., "2023") to the last day of that year (e.g., "2023-12-31")
 */
function convertAnnualDate(year: string): string {
  return `${year}-12-31`;
}

export async function ConvertINRtoUSD(
  date: string, 
  amount: number, 
  isQuarterly: boolean = false, 
  isAnnual: boolean = false
): Promise<INRtoUSD> {
  try {
    let formattedDate = date;
    
    if (isQuarterly) {
      formattedDate = convertQuarterlyDate(date);
    } else if (isAnnual) {
      formattedDate = convertAnnualDate(date);
    }
    
    const response = await fetch(`http://exchange-rate-api:8080/v1/${formattedDate}?base=inr&symbols=usd&amount=${amount}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversion rate: ${response.statusText}`);
    }
    const data = await response.json();
    const exchangeValue = data.rates.USD;
    return {
      USD: exchangeValue,
    };
  } catch (error) {
    console.error('Error in ConvertINRtoUSD:', error);
    throw error;
  }
}

export async function ConvertUSDtoINR(
  date: string, 
  amount: number, 
  isQuarterly: boolean = false,
  isAnnual: boolean = false
): Promise<USDtoINR> {
  try {
    let formattedDate = date;
    
    if (isQuarterly) {
      formattedDate = convertQuarterlyDate(date);
    } else if (isAnnual) {
      formattedDate = convertAnnualDate(date);
    }
    
    const response = await fetch(`http://exchange-rate-api:8080/v1/${formattedDate}?base=usd&symbols=inr&amount=${amount}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversion rate: ${response.statusText}`);
    }
    const data = await response.json();
    const exchangeValue = data.rates.INR;
    return {
      INR: exchangeValue,
    };
  } catch (error) {
    console.error('Error in ConvertUSDtoINR:', error);
    throw error;
  }
}
