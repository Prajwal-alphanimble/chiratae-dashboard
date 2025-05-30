"use client";
import { AssetListDropdown } from "@/components/custom/AssetListDropdown";
import OverviewTemplate from "./portfolio-components/overview-template";
import { AssetDetails } from "../services/assetDetailsService";
import RoundwiseTemplate from "@/app/portfolio/portfolio-components/roundwise-template";
import DealCashflowTemplate from "@/app/portfolio/portfolio-components/dealCashflow-template";
import { Button } from "@/components/ui/button";
import React from "react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DealListDetails } from "../services/dealListService";
import { DealByDealIRR } from "../services/dealCashflowServices";
import FundPerformanceTable from "@/components/custom/FundPerformanceTable";
import { Card } from "@/components/ui/card";
import FinancialsTemplate from "./portfolio-components/financials-template";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InternationalMetricsDetails } from "../services/internationalMetricsServices";
import InternationalMetricsTemplate from "./portfolio-components/internationalMetrics-template";

function Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const [asset, setAsset] = useState("Asset Name 1");
  const [assets, setAssets] = useState<string[]>();
  const [currentSector, setCurrentSector] = useState<number>(0);
  const [key, setKey] = useState(0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "roundwise", label: "Roundwise" },
    { id: "financials", label: "Financials" },
    { id: "dealCashflow", label: "Deal Cashflow" },
    { id: "internationalMetrics", label: "International Metrics" },
  ];

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [currentSector]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["assetDetails", asset] });
    queryClient.invalidateQueries({ queryKey: ["dealListDetails", asset] });
    queryClient.invalidateQueries({ queryKey: ["dealCashflowDetails", asset] });
    queryClient.invalidateQueries({
      queryKey: ["dealInternationalMetrics", asset],
    });
  }, [asset]);

  const queryClient = useQueryClient();

  async function fetchData<T>(endpoint: string, assetName: string): Promise<T> {
    const response = await fetch(
      `/api/${encodeURIComponent(
        endpoint,
      )}?asset-name=${encodeURIComponent(assetName)}`,
      { cache: "force-cache" },
    );
    const data = await response.json();
    return data;
  }

  async function fetchOverviewData(assetName: string): Promise<AssetDetails> {
    return fetchData<AssetDetails>("asset-details", assetName);
  }

  async function fetchDealListData(
    assetName: string,
  ): Promise<DealListDetails[]> {
    return fetchData<DealListDetails[]>("deal-list-details", assetName);
  }

  async function fetchDealCashflowData(
    assetName: string,
  ): Promise<DealByDealIRR[]> {
    return fetchData<DealByDealIRR[]>("deal-cashflow-details", assetName);
  }

  async function fetchInternationalMetrics(
    assetName: string,
  ): Promise<InternationalMetricsDetails[]> {
    return fetchData<InternationalMetricsDetails[]>(
      "international-metrics",
      assetName,
    );
  }

  const {
    data: assetDetails,
    isLoading: isAssetDetailsLoading,
    isError: isAssetDetailsError,
  } = useQuery({
    queryKey: ["assetDetails", asset],
    queryFn: () => fetchOverviewData(asset),
  });

  const {
    data: dealList,
    isLoading: isDealListLoading,
    isError: isDealListError,
  } = useQuery({
    queryKey: ["dealListDetails", asset],
    queryFn: () => fetchDealListData(asset),
  });

  const {
    data: dealCashflow,
    isLoading: isDealCashflowLoading,
    isError: isDealCashflowError,
  } = useQuery({
    queryKey: ["dealCashflowDetails", asset],
    queryFn: () => fetchDealCashflowData(asset),
  });

  const {
    data: internationalMetrics,
    isLoading: isInternationalMetricsLoading,
    isError: isInternationalMetricsError,
  } = useQuery({
    queryKey: ["dealInternationalMetrics", asset],
    queryFn: () => fetchInternationalMetrics(asset),
  });

  if (isDealListError) return <h1>Error loading deal list...</h1>;
  if (isAssetDetailsError) return <h1>Error loading Asset Details...</h1>;
  if (isDealCashflowError) return <h1>Loading Deal Cashflow...</h1>;
  if (isInternationalMetricsError)
    return <h1>Error loading International Metrics...</h1>;
  if (isInternationalMetricsLoading)
    return <h1>Loading International Metrics...</h1>;

  return (
    <div className="w-full overflow-x-auto">
      <section className="flex justify-center items-center mx-auto p-4">
        <div className="flex justify-center space-x-0 bg-foreground/10 p-2 rounded-lg gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              className={`${activeTab === tab.id
                ? "bg-background text-foreground hover:bg-background drop-shadow-lg"
                : "bg-transparent text-foreground/50 hover:bg-transparent drop-shadow-none"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </section>
      {activeTab !== "financials" ? (
        <div className="max-w-sm pl-6">
          <AssetListDropdown
            key={key}
            setterFunc={setAsset}
            selectedAsset={asset}
            assetArrayFunc={setAssets}
            Sector_ID={currentSector}
            onSectorChange={setCurrentSector}
          />
        </div>
      ) : null}
      <section className="">
        <section>
          <div className="p-5">
            {activeTab === "overview" && assetDetails ? (
              <OverviewTemplate
                {...assetDetails}
                isLoading={isAssetDetailsLoading}
              />
            ) : null}
          </div>
        </section>
        <section>
          {activeTab === "roundwise" && (
            <RoundwiseTemplate
              data={dealList || []}
              isLoading={isDealListLoading}
            />
          )}
        </section>
        <section>
          {activeTab === "dealCashflow" && (
            <DealCashflowTemplate
              data={dealCashflow || []}
              isLoading={isDealCashflowLoading}
            />
          )}
        </section>
        <section className="p-2 m-1">
          {activeTab === "financials" && <FinancialsTemplate />}
        </section>
        <section>
          {activeTab === "internationalMetrics" && (
            <InternationalMetricsTemplate
              data={internationalMetrics || []}
              isLoading={isInternationalMetricsLoading}
            />
          )}
        </section>
      </section>
    </div>
  );
}

export default Page;
