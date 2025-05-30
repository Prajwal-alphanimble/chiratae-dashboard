"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueries, QueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { AssetListDropdown } from "./AssetListDropdown";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { SelectParam } from "./custom-select";
import {
  MultiSelector,
  MultiSelectorInput,
  MultiSelectorTrigger,
  MultiSelectorItem,
  MultiSelectorContent,
  MultiSelectorList,
} from "./multiselector";
import { Button } from "../ui/button";
import { AssetData } from "@/app/services/assetMetricsService";
import DataTable from "@/components/custom/dataTable";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { CommandEmpty } from "@/components/ui/command";
import { useTheme } from "next-themes";

interface DefaultTableProps {
  assetName?: string;
  metricName?: string;
  onSelectedMetricChange?: (newMetric: string) => void;
  periodType?: string;
  currencyCode?: string;
  isShowChart?: boolean;
}

interface AssetsData {
  [key: string]: AssetData;
}

interface MetricRecord {
  period: string;
  periodType: string;
  value: string;
  [key: string]: any;
}

// Add this interface for asset details
interface AssetDetails {
  Asset_Name: string;
  Base_Currency: string;
  [key: string]: any;
}

// API client functions
const fetchAssetData = async (
  assetName: string,
  isPlan: boolean,
): Promise<AssetData> => {
  try {
    const response = await fetch(
      `/api/asset-metrics?asset-name=${encodeURIComponent(
        assetName,
      )}&isPlan=${isPlan}`,
    );

    if (!response.ok) {
      // If the response is not ok (e.g., 404), return an empty object
      console.warn(`No data found for asset: ${assetName}`);
      return {};
    }

    const data = await response.json();
    return data[assetName] || {};
  } catch (error) {
    console.error(`Error fetching data for asset ${assetName}:`, error);
    return {};
  }
};

// Add this function to fetch asset details
const fetchAssetDetails = async (assetName: string): Promise<AssetDetails> => {
  const response = await fetch(
    `/api/asset-details?asset-name=${encodeURIComponent(assetName)}`,
  );
  const data = await response.json();
  return (
    data.asset_details[0] || { Asset_Name: assetName, Base_Currency: "INR" }
  );
};

// Add this function to convert currency
const convertCurrency = async (
  amount: number,
  isINRtoUSD: boolean,
  date: string = "latest",
  isQuarterly: boolean = false,
  isAnnual: boolean = false,
): Promise<number> => {
  const response = await fetch(
    `/api/currency-converter?isINRtoUSD=${isINRtoUSD}&date=${date}&amount=${amount}&isQuarterly=${isQuarterly}&isAnnual=${isAnnual}`,
  );
  const data = await response.json();
  return isINRtoUSD ? data.USD : data.INR;
};

// Add this function to format currency values
const formatCurrencyValue = (
  value: string | number,
  currencyCode: string,
): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return String(value);

  // Format according to currency - always use en-US locale for USD and en-IN for INR
  if (currencyCode === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  } else {
    return new Intl.NumberFormat("en-IN", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }
};

const EMPTY_ASSET_DATA_OBJECT = {};
const EMPTY_FILTERED_DATA_ARRAY: any[] = [];

export default function FundPerformanceTable({
  assetName,
  metricName: metricNameProp,
  onSelectedMetricChange,
  periodType,
  currencyCode,
  isShowChart,
}: DefaultTableProps) {
  // State management
  const [showChart, setShowChart] = useState<boolean>(isShowChart ?? false);
  const [selectedAsset, setSelectedAsset] = useState<string>(
    assetName ?? "Active AI",
  );
  const [selectedMetric, setSelectedMetric] = useState<string>(
    metricNameProp ?? "Gross Revenue",
  );
  const [selectedPeriodType, setSelectedPeriodType] = useState<string>(
    periodType ?? "Quarterly",
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [isPlan, setIsPlan] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [showCurrencyToggle, setShowCurrencyToggle] = useState<boolean>(true);
  const [convertedCurrency, setConvertedCurrency] = useState<boolean>(false);
  const [baseCurrency, setBaseCurrency] = useState<string>(
    currencyCode ?? "INR",
  );
  const [convertedData, setConvertedData] = useState<MetricRecord[]>([]);
  // Add this state to track conversion in progress
  const [isConverting, setIsConverting] = useState<boolean>(false);
  // Add this state to prevent infinite loop in asset list fetching for chart
  const [assetListFetchAttempted, setAssetListFetchAttempted] =
    useState<boolean>(false);
  const { theme } = useTheme();

  // Helper function to generate a consistent hue from a string
  const metricToHue = (metricName: string | undefined): number => {
    if (!metricName) return 0;
    let hash = 0;
    for (let i = 0; i < metricName.length; i++) {
      const char = metricName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 360);
  };

  // Memoize the color for the single line chart
  const singleLineChartColor = useMemo(() => {
    const hue = metricToHue(selectedMetric);
    return `hsl(${hue}, 70%, 50%)`;
  }, [selectedMetric]);

  // Fetch assets list separately for MultiSelector
  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/asset-list");
        if (res.ok) {
          const data = await res.json();
          if (data.assetList && Array.isArray(data.assetList)) {
            setAssets(data.assetList);
          }
        }
      } catch (error) {
        console.error("Error fetching asset list:", error);
      }
    }

    fetchAssets();
  }, []);

  const {
    data: assetDataFromQuery,
    isLoading: assetDataLoading,
    error: assetDataError,
    refetch,
  } = useQuery({
    queryKey: ["assetData", selectedAsset, isPlan],
    queryFn: () => fetchAssetData(selectedAsset, isPlan),
    retry: 1,
    retryDelay: 1000,
  });

  // Memoize assetData to prevent new object reference on each render when assetDataFromQuery is undefined
  const assetData = useMemo(() => {
    return assetDataFromQuery || EMPTY_ASSET_DATA_OBJECT;
  }, [assetDataFromQuery]);

  // Add this query to fetch asset details
  const { data: assetDetails, isLoading: assetDetailsLoading } = useQuery({
    queryKey: ["assetDetails", selectedAsset],
    queryFn: () => fetchAssetDetails(selectedAsset),
    enabled: !!selectedAsset,
  });

  useEffect(() => {
    refetch();
  }, [isPlan, refetch]);

  useEffect(() => {
    if (assetDataLoading) {
      if (metrics.length > 0) {
        setMetrics([]);
      }
      return;
    }

    const availableMetrics = Object.keys(assetData);

    if (!_.isEqual(metrics, availableMetrics)) {
      setMetrics(availableMetrics);
    }

    if (metricNameProp !== undefined) {
      if (selectedMetric !== metricNameProp) {
        setSelectedMetric(metricNameProp);
      }
    } else {
      if (availableMetrics.length > 0) {
        if (!selectedMetric || !availableMetrics.includes(selectedMetric)) {
          setSelectedMetric(availableMetrics[0]);
        }
      } else {
        if (selectedMetric !== "") {
          setSelectedMetric("");
        }
      }
    }
  }, [
    assetData,
    assetDataLoading,
    metricNameProp,
    selectedMetric,
    metrics,
    setMetrics,
    setSelectedMetric,
  ]);

  useEffect(() => {
    if (assetDetails?.Base_Currency) {
      setBaseCurrency(assetDetails.Base_Currency);
      setShowCurrencyToggle(true);
    }
  }, [selectedPeriodType]);

  const multiAssetQueries = useQueries({
    queries: selectedOptions.map((assetName) => ({
      queryKey: ["assetData", assetName],
      queryFn: () => fetchAssetData(assetName, isPlan),
      enabled: showChart && selectedOptions.length > 0,
    })),
  });

  const multipleAssetsData = _.reduce(
    selectedOptions,
    (result, assetName, index) => {
      const query = multiAssetQueries[index];
      if (query.data) {
        result[assetName] = query.data;
      }
      return result;
    },
    {} as AssetsData,
  );

  const filteredData = useMemo(() => {
    const rawMetricData = assetData[selectedMetric as keyof typeof assetData];
    const selectedMetricDataArray = Array.isArray(rawMetricData)
      ? rawMetricData
      : EMPTY_FILTERED_DATA_ARRAY;

    if (
      selectedMetricDataArray.length === 0 &&
      !Object.keys(assetData).includes(selectedMetric as string)
    ) {
      return EMPTY_FILTERED_DATA_ARRAY;
    }

    if (
      selectedMetricDataArray.length === 0 &&
      Object.keys(assetData).includes(selectedMetric as string) &&
      assetData[selectedMetric as keyof typeof assetData] === undefined
    ) {
      return EMPTY_FILTERED_DATA_ARRAY;
    }

    const result = selectedMetricDataArray
      .filter(
        (record: { periodType: string }) =>
          record.periodType === selectedPeriodType,
      )
      .map((record) => ({
        ...record,
        Currency_Code: record.Currency_Code || baseCurrency,
      }));

    if (result.length === 0) {
      // Check if the selectedMetric actually exists in assetData and has no items,
      // or if selectedMetricDataArray was already empty.
      // This ensures we don't incorrectly return empty if the metric is valid but just has no data for the periodType.
      // However, if selectedMetricDataArray itself was determined to be empty (e.g. metric doesn't exist in assetData),
      // it's correct to return the stable empty array.
      if (selectedMetricDataArray === EMPTY_FILTERED_DATA_ARRAY) {
        return EMPTY_FILTERED_DATA_ARRAY;
      }
      // If result is empty due to filtering but original data was not EMPTY_FILTERED_DATA_ARRAY,
      // it's a genuinely empty filtered result, so return a new empty array or a stable one.
      // For now, returning stable one for safety.
      return EMPTY_FILTERED_DATA_ARRAY;
    }
    return result;
  }, [assetData, selectedMetric, selectedPeriodType, baseCurrency]);
  // Function to perform currency conversion
  const handleCurrencyConversion = async (shouldConvert: boolean) => {
    setConvertedCurrency(shouldConvert);

    if (!shouldConvert || !filteredData.length) {
      setConvertedData([]);
      return;
    }

    setIsConverting(true);

    try {
      const isINRtoUSD = baseCurrency === "INR";
      const targetCurrency = isINRtoUSD ? "USD" : "INR"; // Define target currency

      const converted = await Promise.all(
        filteredData.map(async (record) => {
          const value = parseFloat(record.value);
          if (isNaN(value)) return { ...record };

          try {
            const convertedValue = await convertCurrency(
              value,
              isINRtoUSD,
              record.period,
              record.periodType === "Quarterly",
              record.periodType === "Annual",
            );

            if (convertedValue !== undefined && convertedValue !== null) {
              // Return a clean record with only the converted value and currency code
              return {
                ...record,
                value: convertedValue.toString(), // Use number as string, let the DataTable format it
                Currency_Code: targetCurrency, // Update the currency code
              };
            } else {
              console.warn(`Currency conversion failed for value: ${value}`);
              return {
                ...record,
                Currency_Code: baseCurrency, // Keep original currency code
              };
            }
          } catch (convError) {
            console.warn(`Error converting value ${value}: ${convError}`);
            return {
              ...record,
              Currency_Code: baseCurrency, // Keep original currency code
            };
          }
        }),
      );

      setConvertedData(converted);
    } catch (error) {
      console.error("Error converting currency:", error);
      setConvertedCurrency(false);
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (convertedCurrency && filteredData.length > 0) {
      handleCurrencyConversion(true);
    }
  }, [filteredData, convertedCurrency]);
  // Calculate display data only when needed
  const displayData =
    convertedCurrency && convertedData.length > 0
      ? convertedData
      : filteredData;

  // Update chart data to use converted values if needed
  const chartData = _.map(displayData, (record) => ({
    period: record.period,
    [selectedMetric]: parseFloat(record.value) || 0,
  }));

  const getMultiAssetChartData = () => {
    if (!showChart || selectedOptions.length === 0) return [];

    const periodMap = _.reduce(
      selectedOptions,
      (result, assetName) => {
        const assetMetrics = multipleAssetsData[assetName];
        if (!assetMetrics || !assetMetrics[selectedMetric]) return result;

        const metricData = assetMetrics[selectedMetric];
        const filteredMetricData = Array.isArray(metricData)
          ? metricData.filter((item) => item.periodType === selectedPeriodType)
          : [];

        _.forEach(filteredMetricData, (record) => {
          const period = record.period;
          if (!result[period]) {
            result[period] = { period };
          }
          // Parse the value directly
          result[period][assetName] = parseFloat(record.value) || 0;
        });

        return result;
      },
      {} as Record<string, any>,
    );

    return _.values(periodMap);
  };

  const multiAssetChartData = getMultiAssetChartData();

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  // Effect to reset asset list fetch attempt when chart is hidden
  useEffect(() => {
    if (!showChart) {
      setAssetListFetchAttempted(false);
    }
  }, [showChart]);

  // Ensure chart mode has assets to display
  useEffect(() => {
    if (showChart && assets.length === 0 && !assetListFetchAttempted) {
      setAssetListFetchAttempted(true); // Mark that an attempt is being made/has been made
      // If chart is turned on and no assets are loaded, load them
      const fetchAssetsForChart = async () => {
        try {
          const res = await fetch("/api/asset-list");
          if (res.ok) {
            const data = await res.json();
            if (data.assetList && Array.isArray(data.assetList)) {
              setAssets(data.assetList);
              // If data.assetList is empty, assets.length will be 0.
              // assetListFetchAttempted is true, so next render won't re-fetch.
            } else {
              // Asset list not found, malformed, or explicitly empty from API
              console.warn(
                "Asset list not found or malformed in API response, or API returned empty list for chart.",
              );
              setAssets([]); // Explicitly set to empty to ensure assets.length is 0 and stop loop
            }
          } else {
            console.error(
              "Error fetching asset list for chart (res not ok):",
              res.status,
            );
            setAssets([]); // Set to empty on HTTP error to stop loop
          }
        } catch (error) {
          console.error("Error fetching asset list for chart (catch):", error);
          setAssets([]); // Set to empty on network/other error to stop loop
        }
      };

      fetchAssetsForChart();
    }
  }, [showChart, assets.length, assetListFetchAttempted, assets, setAssets]); // Added assetListFetchAttempted

  if (assetDataLoading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  if (assetDataError) {
    return <div className="text-red-500">Asset not found or has no data</div>;
  }
  return (
    <>
      <Card
        className={`bg-background p-4 shadow-lg shadow-foreground/40 hover:shadow-foreground/50 m-1 overflow-hidden`}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="max-w-xs">
              {!showChart ? (
                <AssetListDropdown
                  setterFunc={setSelectedAsset}
                  selectedAsset={selectedAsset}
                  assetArrayFunc={setAssets}
                />
              ) : (
                assets.length > 0 && (
                  <MultiSelector
                    values={selectedOptions}
                    onValuesChange={setSelectedOptions}
                  >
                    <MultiSelectorTrigger className="max-h-12 overflow-x-hidden no-scrollbar"></MultiSelectorTrigger>
                    <MultiSelectorInput placeholder={"Select assets"} />
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {assets.map((asset) => (
                          <MultiSelectorItem key={asset} value={asset}>
                            {asset}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                )
              )}
              {showChart && assets.length === 0 && (
                <div className="p-2 border border-foreground rounded-md">
                  Loading asset list...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between space-x-2   ">
              <Button
                className="bg-background text-foreground hover:bg-foreground/10 border-1 border-l-2 border-b-2 border-foreground"
                id="period-mode"
                onClick={() => {
                  if (selectedPeriodType === "Quarterly") {
                    setSelectedPeriodType("Annual");
                  } else {
                    setSelectedPeriodType("Quarterly");
                  }
                }}
              >
                {selectedPeriodType[0]}
              </Button>
            </div>

            {showCurrencyToggle && (
              <div className="flex items-center justify-between space-x-2  ">
                <Button
                  className="bg-background text-foreground hover:bg-foreground/10 border-1 border-l-2 border-b-2 border-foreground"
                  onClick={() => {
                    const shouldConvert = !convertedCurrency;
                    setConvertedCurrency(shouldConvert);
                    handleCurrencyConversion(shouldConvert);
                  }}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">⟳</span> Converting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="font-bold">
                        {convertedCurrency
                          ? baseCurrency === "INR"
                            ? "$"
                            : "₹"
                          : baseCurrency === "INR"
                            ? "₹"
                            : "$"}
                      </span>
                      <span className="text-xs">
                        {convertedCurrency
                          ? baseCurrency === "INR"
                            ? "USD"
                            : "INR"
                          : baseCurrency}
                      </span>
                    </span>
                  )}
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between space-x-2   ">
              <Button
                className="bg-background text-foreground hover:bg-foreground/10 border-1 border-l-2 border-b-2 border-foreground"
                id="period-mode"
                onClick={() => {
                  if (isPlan) {
                    setIsPlan(false);
                  } else {
                    setIsPlan(true);
                  }
                }}
              >
                {isPlan ? "Plan" : "actuals"}
              </Button>
              <div className="max-w-60">
                <SelectParam
                  options={metrics}
                  onChange={(value) => {
                    setSelectedMetric(value);
                    if (onSelectedMetricChange) {
                      onSelectedMetricChange(value);
                    }
                  }}
                  value={selectedMetric}
                  defaultValue={selectedMetric}
                  placeholder="select metric"
                  className="bg-background max-w-40 border-b-4 border-l-4 border-foreground overflow-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-start space-x-2  ">
              <Switch
                id="chart-mode"
                checked={showChart}
                onCheckedChange={setShowChart}
              />
              <Label htmlFor="chart-mode">Show Chart</Label>
            </div>
          </div>

          {showChart && selectedMetric ? (
            <div className="w-full overflow-x-auto  rounded-2xl p-0">
              <div className="min-h-100 h-130 min-w-150 ">
                <ChartContainer config={{}} className="h-full w-full">
                  <LineChart
                    data={
                      selectedOptions.length > 0
                        ? multiAssetChartData
                        : chartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={`${theme === "light" ? "black" : "white"}`}
                    />
                    <XAxis dataKey="period" tickMargin={8} />
                    <YAxis tickMargin={8} domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {selectedOptions.length > 0 ? (
                      // Render a line for each selected asset
                      selectedOptions.map((assetName, index) => (
                        <Line
                          key={assetName}
                          type="monotone"
                          dataKey={assetName}
                          name={assetName}
                          stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                          activeDot={{ r: 4 }}
                          strokeWidth={2}
                        />
                      ))
                    ) : (
                      // Render a single line for the selected metric
                      <Line
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={singleLineChartColor}
                        activeDot={{ r: 4 }}
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          ) : (
            <DataTable
              data={displayData}
              isLoading={false}
              enableColumnFilters={false}
              defaultHiddenColumns={[
                "periodType",
                "Chart_Period_Title",
                "Currency_Code",
                "Chart_Metric_Unit",
              ]}
            />
          )}
        </div>
      </Card>
    </>
  );
}
