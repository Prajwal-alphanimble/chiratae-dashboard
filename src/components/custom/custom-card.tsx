import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CustomAssetCardProps {
  headerName: string;
  buttonComponent: ReactNode;
  totalAssets: number | string;
  icon?: ReactNode;
  label?: string; // Add new prop
  currentAsset?: string; // Add new prop
  progressValue?: number; // Add new prop for progress
  lastUpdated?: string; // Add new prop
  dark?: boolean; // New dark mode prop
}

export default function CustomAssetCard({
  headerName,
  buttonComponent,
  totalAssets,
  icon,
  label = "Total", // Default value
  currentAsset, // Add to destructuring
  progressValue = 100, // Default to 100 for static data sources
  lastUpdated, // Add to destructuring
  dark = false, // Default to light mode
}: CustomAssetCardProps) {
  return (
    <Card
      className={`overflow-hidden shadow-md shadow-black/20 dark:shadow-white/30 hover:shadow-sm transition-shadow duration-300 h-full flex flex-col ${dark
        ? "bg-foreground text-background "
        : "bg-background text-foreground "
        }`}
    >
      <CardHeader
        className={`p-4 flex flex-row items-center justify-center ${dark ? "bg-foreground" : "bg-card"
          }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-xl">{headerName}</h3>
        </div>
        {/* {buttonComponent} */}
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${dark ? "text-background" : "text-foreground"
                  }`}
              >
                {label}
              </span>
              <span
                className={`text-2xl font-bold ${dark ? "text-background" : "text-foreground"
                  }`}
              >
                {totalAssets}
              </span>
            </div>
            <Progress
              value={progressValue}
              className={dark ? "bg-background/20" : "bg-foreground/10"}
              indicatorClassName={dark ? "bg-background" : "bg-foreground"}
            />
            {currentAsset && (
              <p
                className={`text-sm mt-2 ${dark ? "text-background/80" : "text-muted-foreground"
                  }`}
              >
                Currently Processing: {currentAsset}
              </p>
            )}
          </div>
          {lastUpdated && (
            <p
              className={`text-sm font-semi-light ${dark ? "text-background/90" : "text-foreground"
                }`}
            >
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
