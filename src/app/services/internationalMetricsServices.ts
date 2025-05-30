import { generateBasicQuery, fetchGraphQLData } from "@/lib/graphql-helpers";

export type InternationalMetricsDetails = {
  Asset_Name: string;
  Chart_Metric_Name: string;
  Chart_Values: number | null;
  Chart_Period_Type: string;
  Chart_Period_Title: string;
  Chart_Period_ID: string;
}

export const INTERNATIONAL_METRICS_FIELDS = [
  'Asset_Name',
  'Chart_Metric_Name',
  'Chart_Values',
  'Chart_Period_Type',
  'Chart_Period_Title',
  'Chart_Period_ID'
];

export async function getInternationalMetricsDetails(assetName: string): Promise<{ metrics_charts_international: InternationalMetricsDetails[] }> {
  const query = generateBasicQuery('metrics_charts_international', INTERNATIONAL_METRICS_FIELDS, 'Asset_Name');
  console.log(query);

  const response = await fetchGraphQLData(query, { Asset_Name: assetName });

  return {
    metrics_charts_international: response.data?.metrics_charts_international || []
  };
}
