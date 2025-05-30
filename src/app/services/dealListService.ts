import { generateBasicQuery, fetchGraphQLData } from "@/lib/graphql-helpers";

export type DealListDetails = {
  Asset_Name: string;
  Currency: string;
  Deal_Expense: string;
  Deal_Gross_Multiple: string;
  Deal_Income: string;
  Deal_Serial_Numbers: string;
  Deal_Total_Value: string;
  Entity_Names: string;
  Fair_Market_Value: string;
  Fully_Diluted_Ownership_percent: string;
  Initial_Date: string;
  Initial_Investment_Cost: string;
  Investment_Rounds: string;
  Number_of_Units_Remaining: string;
  Proceeds: string;
  Realized_Amount: string;
  Realized_Gain_perLoss: string;
  Remaining_Investment_Cost: string;
  Unrealized_Gain_perLoss: string;
  Value_per_Unit: string;
}

export const DEAL_LIST_FIELDS = [
  'Asset_Name',
  'Currency',
  'Deal_Expense',
  'Deal_Gross_Multiple',
  'Deal_Income',
  'Deal_Serial_Numbers',
  'Deal_Total_Value',
  'Entity_Names',
  'Fair_Market_Value',
  'Fully_Diluted_Ownership_percent',
  'Initial_Date',
  'Initial_Investment_Cost',
  'Investment_Rounds',
  'Number_of_Units_Remaining',
  'Proceeds',
  'Realized_Amount',
  'Realized_Gain_perLoss',
  'Remaining_Investment_Cost',
  'Unrealized_Gain_perLoss',
  'Value_per_Unit',
];

export async function getDealListDetails(assetName: string): Promise<{ deal_list_details: DealListDetails[] }> {
  const query = generateBasicQuery('deal_list_details', DEAL_LIST_FIELDS, 'Asset_Name');
  console.log(query)

  const response = await fetchGraphQLData(query, { Asset_Name: assetName });

  return {
    deal_list_details: response.data?.deal_list_details || []
  };
}
