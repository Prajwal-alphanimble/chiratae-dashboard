import { fetchGraphQLData } from "@/lib/graphql-helpers";

export type dataCount = {
  scopeCount: number;
  assetCount: number;
  dealByDealIRRCount: number;
  dealListCount: number;
  metricsCount: number;
};

export async function getCount(): Promise<dataCount> {
  const query = `
    query MyQuery {
      scope_details_aggregate(distinct_on: Scope_Name) {
        aggregate {
          count
        }
      }
      asset_details_aggregate(distinct_on: Asset_Name) {
        aggregate {
          count
        }
      }
      deal_by_deal_irr_aggregate(distinct_on: Asset_Name) {
        aggregate {
          count
        }
      }
      deal_list_details_aggregate(distinct_on: Asset_Name) {
        aggregate {
          count
        }
      }
      metrics_charts_actuals_aggregate(distinct_on: Asset_Name) {
        aggregate {
          count
        }
      }
    }
  `;
  const response = await fetchGraphQLData(query, {});
  const data = response.data;

  if (!data) {
    // Handle the case where data is undefined or null
    return {
      scopeCount: 0,
      assetCount: 0,
      dealByDealIRRCount: 0,
      dealListCount: 0,
      metricsCount: 0,
    };
  }

  return {
    scopeCount: data.scope_details_aggregate.aggregate.count,
    assetCount: data.asset_details_aggregate.aggregate.count,
    dealByDealIRRCount: data.deal_by_deal_irr_aggregate.aggregate.count,
    dealListCount: data.deal_list_details_aggregate.aggregate.count,
    metricsCount: data.metrics_charts_actuals_aggregate.aggregate.count,
  };
}