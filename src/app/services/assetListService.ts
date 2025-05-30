import { fetchGraphQLData } from "@/lib/graphql-helpers";

export type AssetList = {
  Asset_Name: string;
}

export async function getAssetList(Sector_ID :number): Promise<{ asset_details: AssetList[] }> {
  const query = Sector_ID===0 ?`
      query MyQuery {
  asset_details(distinct_on: Asset_Name) {
    Asset_Name
  }
}
    `:`
      query MyQuery {
  asset_details(distinct_on: Asset_Name,where: {Sector_ID: {_eq: "${Sector_ID}"}}) {
    Asset_Name
  }
}
    `;
  const response = await fetchGraphQLData(query, {});


  return {
    asset_details: response.data?.asset_details || []
  };
}
