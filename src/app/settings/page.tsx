"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CreditCard,
  Layers,
  RefreshCw,
} from "lucide-react";

import CustomAssetCard from "@/components/custom/custom-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState<boolean>(false);
  const [isScopesLoading, setIsScopesLoading] = useState<boolean>(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState<boolean>(false);
  const [isDealListLoading, setIsDealListLoading] = useState<boolean>(false);
  const [isDealCashflowLoading, setIsDealCashflowLoading] =
    useState<boolean>(false);
  const [progress, setProgress] = useState<{
    [key: string]: {
      current: number;
      total: number;
      currentAsset?: string;
    };
  }>({});
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxAttempts = 5;
  const [lastUpdated, setLastUpdated] = useState<{
    [key: string]: string;
  }>({});

  // Initialize with 0 first
  const [assetCount, setAssetCount] = useState(0);
  const [scopeCount, setScopeCount] = useState(0);

  // Load values from localStorage after component mounts
  useEffect(() => {
    // Load initial values from localStorage
    const savedAssetCount = localStorage.getItem("assetCount");
    const savedScopeCount = localStorage.getItem("scopeCount");

    if (savedAssetCount) {
      setAssetCount(Number(savedAssetCount));
    }
    if (savedScopeCount) {
      setScopeCount(Number(savedScopeCount));
    }
  }, []); // Empty dependency array means this runs once on mount

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem("assetCount", assetCount.toString());
  }, [assetCount]);

  useEffect(() => {
    localStorage.setItem("scopeCount", scopeCount.toString());
  }, [scopeCount]);

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");
  const [socket, setSocket] = useState<any>(null);
  const [reconnectTimer, setReconnectTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const initializeSocket = () => {
      const backendUrl = "http://localhost:8000";

      const newSocket = io(backendUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        path: "/socket.io/",
        reconnection: true,
        reconnectionAttempts: Infinity, // Keep trying to reconnect
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
      });

      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server");
        setConnectionStatus("connected");
        setConnectionAttempts(0);

        // Request latest progress data on reconnection
        newSocket.emit("request_latest_progress");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Disconnected from Socket.IO server:", reason);
        setConnectionStatus("disconnected");

        // Clear any existing reconnect timer
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        // Set a new reconnect timer
        const timer = setTimeout(() => {
          console.log("Attempting to reconnect...");
          setConnectionStatus("connecting");
          newSocket.connect();
        }, 5000);

        setReconnectTimer(timer);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        setConnectionStatus("disconnected");
      });

      newSocket.on("processing_progress", (data) => {
        console.log("Received progress:", data);
        setProgress((prev) => ({
          ...prev,
          [data.endpoint]: {
            current: data.current,
            total: data.total,
            currentAsset: data.asset_name,
          },
        }));

        // Update lastUpdated timestamp
        setLastUpdated((prev) => ({
          ...prev,
          [data.endpoint]: new Date().toLocaleString(),
        }));
      });

      newSocket.on("latest_progress", (data) => {
        console.log("Received latest progress data:", data);
        setProgress(data.progress);
        setLastUpdated(data.lastUpdated);
      });

      setSocket(newSocket);

      return () => {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }
        newSocket.disconnect();
      };
    };

    const cleanup = initializeSocket();
    return cleanup;
  }, []);

  // Add connection status indicator
  const ConnectionStatus = () => (
    <div
      className={`fixed bottom-4 right-4 px-3 py-1 rounded-full text-sm ${connectionStatus === "connected"
        ? "bg-green-500"
        : connectionStatus === "connecting"
          ? "bg-yellow-500"
          : "bg-red-500"
        } text-white`}
    >
      {connectionStatus === "connected"
        ? "Connected"
        : connectionStatus === "connecting"
          ? "Connecting..."
          : "Disconnected"}
    </div>
  );

  const handleRefreshData = () => {
    setIsRefreshing(true);

    // Execute all API calls
    fetchEndpoint(setIsAssetLoading, "assets", setAssetCount);
    fetchEndpoint(setIsScopesLoading, "scopes", setScopeCount);
    fetchEndpoint(setIsMetricsLoading, "metrics");
    fetchEndpoint(setIsDealListLoading, "deal-list");
    fetchEndpoint(setIsDealCashflowLoading, "deal-cashflow");

    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  async function fetchEndpoint(
    loader: (loading: boolean) => void,
    endpoint: string,
    setCount?: (count: number) => void
  ) {
    loader(true);
    setProgress((prev) => ({
      ...prev,
      [endpoint]: { current: 0, total: 0 },
    }));

    try {
      const response = await fetch(
        `${"http://localhost:8000/api/"}${endpoint}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "force-cache",
        }
      );
      const data = await response.json();
      // Log the return message from backend
      console.log(`${endpoint} Response Message:`, data);
      console.log(`${endpoint} Response Data:`, data.last_updated);
      setProgress((prev) => ({
        ...prev,
        [endpoint]: {
          current: data.mongodb_result?.total_count || 0,
          total:
            data.mongodb_result?.total_assets ||
            data.mongodb_result?.total_count ||
            0,
        },
      }));

      // Store last updated timestamp with actual time
      const currentTime = new Date().toLocaleString();
      setLastUpdated((prev) => ({
        ...prev,
        [endpoint]: currentTime,
      }));

      // Only call setCount if it's provided (for static data sources)
      if (setCount) {
        setCount(data.mongodb_result.total_count);
        // Save to localStorage right after updating
        if (endpoint === "assets") {
          localStorage.setItem(
            "assetCount",
            data.mongodb_result.total_count.toString()
          );
        } else if (endpoint === "scopes") {
          localStorage.setItem(
            "scopeCount",
            data.mongodb_result.total_count.toString()
          );
        }
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
    } finally {
      loader(false);
    }
  }

  // Add helper function to calculate progress percentage
  const calculateProgress = (current: number, total: number): number => {
    if (total === 0) return 0;
    return (current / total) * 100;
  };

  return (
    <>
      <div className="min-h-screen p-6 md:p-8 lg:p-10 w-full grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr))">
        <ConnectionStatus />
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage your assets and data sources
              </p>
            </div>
            <Button
              onClick={handleRefreshData}
              variant="outline"
              className="w-full md:w-auto"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </header>
        <Card className="px-6 py-1 bg-background mb-2 shadow-md shadow-black/10">
          <section className="mb-10 m-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Static Data Sources
              </h2>
              {/* <Button variant="ghost" size="sm" className="text-sm gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button> */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-6">
              <CustomAssetCard
                headerName="Assets Overview"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                buttonComponent={
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() =>
                      fetchEndpoint(setIsAssetLoading, "assets", setAssetCount)
                    }
                  >
                    {isAssetLoading ? "Updating..." : "Update Assets"}
                  </Button>
                }
                totalAssets={assetCount}
                label="Total Asset Count"
                lastUpdated={lastUpdated["assets"]}
              />
              <CustomAssetCard
                headerName="Scopes"
                icon={<Briefcase className="h-5 w-5 text-foreground" />}
                // dark={true}
                buttonComponent={
                  <Button
                    size="sm"
                    className="bg-foreground text-background"
                    onClick={() =>
                      fetchEndpoint(setIsScopesLoading, "scopes", setScopeCount)
                    }
                  >
                    {isScopesLoading ? "Updating..." : "Update Scopes"}
                  </Button>
                }
                totalAssets={scopeCount}
                label="Total Scopes Count"
                lastUpdated={lastUpdated["scopes"]}
              />
            </div>
          </section>
        </Card>
        <Card className="px-6 py-1 shadow-md shadow-black/10">
          <section className="mb-10 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex itemsCenter gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Dynamic Data Sources
              </h2>
              {/* <Button variant="ghost" size="sm" className="text-sm gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button> */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr gap-6">
              <CustomAssetCard
                headerName="Metrics"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                buttonComponent={
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() =>
                      fetchEndpoint(setIsMetricsLoading, "metrics")
                    }
                  >
                    {isMetricsLoading ? "Processing..." : "Update Metrics"}
                  </Button>
                }
                totalAssets={`${progress.metrics?.current || 0}/${progress.metrics?.total || 0
                  }`}
                label="Total Metrics Count"
                currentAsset={
                  isMetricsLoading ? progress.metrics?.currentAsset : undefined
                }
                progressValue={calculateProgress(
                  progress.metrics?.current || 0,
                  progress.metrics?.total || 0
                )}
                lastUpdated={lastUpdated["metrics"]}
              />
              <CustomAssetCard
                headerName="Deal List"
                icon={<Briefcase className="h-5 w-5 text-primar" />}
                buttonComponent={
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() =>
                      fetchEndpoint(setIsDealListLoading, "deal-list")
                    }
                  >
                    {isDealListLoading ? "Processing..." : "Update Deal List"}
                  </Button>
                }
                totalAssets={`${progress["deal-list"]?.current || 0}/${progress["deal-list"]?.total || 0
                  }`}
                label="Total Deals Count"
                currentAsset={
                  isDealListLoading
                    ? progress["deal-list"]?.currentAsset
                    : undefined
                }
                progressValue={calculateProgress(
                  progress["deal-list"]?.current || 0,
                  progress["deal-list"]?.total || 0
                )}
                lastUpdated={lastUpdated["deal-list"]}
              />
              <CustomAssetCard
                headerName="Deal Cashflow"
                icon={<CreditCard className="h-5 w-5 text-primary" />}
                buttonComponent={
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() =>
                      fetchEndpoint(setIsDealCashflowLoading, "deal-cashflow")
                    }
                  >
                    {isDealCashflowLoading
                      ? "Processing..."
                      : "Update Deal Cashflow"}
                  </Button>
                }
                totalAssets={`${progress["deal-cashflow"]?.current || 0}/${progress["deal-cashflow"]?.total || 0
                  }`}
                label="Total Deal Cashflows Count"
                currentAsset={
                  isDealCashflowLoading
                    ? progress["deal-cashflow"]?.currentAsset
                    : undefined
                }
                progressValue={calculateProgress(
                  progress["deal-cashflow"]?.current || 0,
                  progress["deal-cashflow"]?.total || 0
                )}
                lastUpdated={lastUpdated["deal-cashflow"]}
              />
            </div>
          </section>
        </Card>
      </div>
    </>
  );
}