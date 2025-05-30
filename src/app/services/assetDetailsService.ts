import { generateBasicQuery, fetchGraphQLData } from "@/lib/graphql-helpers";

export type AssetDetails = {
  Asset_Name: string;
  Support_Provided: string;
  Latest_Developments: string;
  Status: string;
  Description: string;
  Website: string;
  Base_Currency: string;
  Deal_Support: string;
  Deal_Lead: string;
  Sector_ID: number;
  Sector_Name: string;
};

export async function getAssetDetails(
  assetName: string
): Promise<{ asset_details: AssetDetails[] }> {
  const fields = [
    "Asset_Name",
    "Support_Provided",
    "Latest_Developments",
    "Status",
    "Description",
    "Website",
    "Base_Currency",
    "Deal_Support",
    "Deal_Lead",
    "Sector_ID",
    "Sector_Name",
  ];

  const query = generateBasicQuery("asset_details", fields, "Asset_Name");
  console.log(query);

  const response = await fetchGraphQLData(query, { Asset_Name: assetName });

  return {
    asset_details: response.data?.asset_details || [],
  };
}
