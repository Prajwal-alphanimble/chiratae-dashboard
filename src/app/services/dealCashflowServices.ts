import { generateBasicQuery, fetchGraphQLData } from "@/lib/graphql-helpers";

export type DealByDealIRR = {
  Asset_Name: string;
  Transaction_Date: string;
  Total_Amount: string;
  Percent_Allocation: string;
  Net_IRR: string;
  Latest_Valuation_Date: string;
  Investor_Name: string;
  Investment_FMV_NAV: string;
  IRR_Date: string;
  Gross_IRR: string;
  Fund_Vehicle_Name: string;
  Deal_Name: string;
  Deal_ID: string;
  Fund_Vehicle_ID: string;
  As_of_Date: string;
  Amount: string;
  Allocation_Method: string;
}

export const DEAL_BY_DEAL_IRR_FIELDS = [
  'Asset_Name',
  'Transaction_Date',
  'Total_Amount',
  'Percent_Allocation',
  'Net_IRR',
  'Latest_Valuation_Date',
  'Investor_Name',
  'Investment_FMV_NAV',
  'IRR_Date',
  'Gross_IRR',
  'Fund_Vehicle_Name',
  'Deal_Name',
  'Deal_ID',
  'Fund_Vehicle_ID',
  'As_of_Date',
  'Amount',
  'Allocation_Method'
];
export async function getDealByDealIRR(assetName?: string): Promise<{ deal_by_deal_irr: DealByDealIRR[] }> {

  const query = generateBasicQuery('deal_by_deal_irr', DEAL_BY_DEAL_IRR_FIELDS, 'Asset_Name');
  console.log(query);
  
  const response = await fetchGraphQLData(query, assetName ? { Asset_Name: assetName } : {});
  
  return {
    deal_by_deal_irr: response.data?.deal_by_deal_irr || []
  };
}


