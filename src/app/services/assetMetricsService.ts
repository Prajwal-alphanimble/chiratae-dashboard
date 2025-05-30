import { generateBasicQuery, fetchGraphQLData } from "@/lib/graphql-helpers";

export type AssetData = {
  [assetName: string]: {
    [assetMetric: string]: Array<{
      periodType: string;
      period: string;
      value: number;
      Currency_Code: string;
      Chart_Metric_Unit: string;
      Chart_Period_Title: string;
    }>;
  };
}

export async function getAssetMetrics(assetName: string, isPlan: boolean) {
  const fields = [
    "Asset_Name",
    "Chart_Metric_Name",
    "Chart_Period_ID",
    "Chart_Period_Type",
    "Chart_Period_Title",
    "Chart_Values",
    "Chart_Metric_Unit",
    "Currency_Code"
  ];

  // Choose the table based on the isPlan parameter
  const tableName = isPlan ? 'metrics_charts_plan' : 'metrics_charts_actuals';
  const query = generateBasicQuery(tableName, fields, 'Asset_Name');
  console.log(query);

  const response = await fetchGraphQLData(query, { Asset_Name: assetName });

  const assetData: AssetData = {};
  const dataSource = isPlan ? response.data.metrics_charts_plan : response.data.metrics_charts_actuals;

  if (dataSource) {
    dataSource.forEach((item: {
      Asset_Name: string;
      Chart_Metric_Name: string;
      Chart_Period_Type: string;
      Chart_Period_Title: string;
      Chart_Period_ID: string;
      Chart_Values: number;
      Currency_Code: string;
      Chart_Metric_Unit: string;
    }) => {
      if (!assetData[item.Asset_Name]) {
        assetData[item.Asset_Name] = {};
      }
      if (!assetData[item.Asset_Name][item.Chart_Metric_Name]) {
        assetData[item.Asset_Name][item.Chart_Metric_Name] = [];
      }
      assetData[item.Asset_Name][item.Chart_Metric_Name].push({
        periodType: item.Chart_Period_Type,
        Chart_Period_Title: item.Chart_Period_Title,
        period: item.Chart_Period_ID,
        value: item.Chart_Values,
        Currency_Code: item.Currency_Code,
        Chart_Metric_Unit: item.Chart_Metric_Unit
      });
    });
  }

  return assetData;
}

