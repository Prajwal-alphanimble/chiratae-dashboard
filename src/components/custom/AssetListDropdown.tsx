"use client";
import * as React from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SelectParam } from "./custom-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface dropdownProps {
  setterFunc: (value: string) => void;
  selectedAsset: string;
  assetArrayFunc: (value: string[]) => void;
  className?: string;
  Sector_ID?: number;
  onSectorChange?: (value: number) => void;
}

export const AssetListDropdown: React.FC<dropdownProps> = ({
  setterFunc,
  assetArrayFunc,
  selectedAsset = "Asset Name 1",
  className,
  Sector_ID = 0,
  onSectorChange,
}) => {
  const [sector_ID, setSector_ID] = useState<number | string>(Sector_ID);
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: assetList,
    isError,
  } = useQuery({
    queryKey: ["assetList", sector_ID],
    queryFn: async () => {
      const res = await fetch(
        `/api/asset-list?sid=${encodeURIComponent(sector_ID)}`,
      );
      if (!res.ok) {
        throw new Error("failed to fetch asset list");
      }
      const data = await res.json();
      console.log(data.assetList);
      assetArrayFunc(data.assetList);
      return data.assetList;
    },
  });

  const handleSectorChange = (value: string) => {
    const sectorNames = [
      "All",
      "Software",
      "Health-tech",
      "Fintech",
      "Consumer media & technology",
      "B2B",
      "Deep-tech",
      "Others",
    ];
    const newSectorId = sectorNames.indexOf(value);
    setSector_ID(newSectorId);
    onSectorChange?.(newSectorId);
    queryClient.invalidateQueries({ queryKey: ["assetList", newSectorId] });
  };

  if (isLoading) {
    return <div>loading</div>;
  }
  if (isError) {
    return <div>Error Fetching Data</div>;
  }

  return (
    <div className="flex  w-full">
      <SelectParam
        options={assetList || []}
        placeholder="select Asset"
        defaultValue={selectedAsset}
        onChange={(value) => setterFunc(value)}
        className="bg-background border-b-4 border-l-4 border-foreground mr-6"
      />
      <SelectParam
        options={[
          "All",
          "Software",
          "Health-tech",
          "Fintech",
          "Consumer media & technology",
          "B2B",
          "Deep-tech",
          "Others",
        ]}
        placeholder="Select Sector"
        defaultValue={"All"}
        onChange={handleSectorChange}
        className="bg-background border-b-4 border-l-4 border-foreground"
      />
    </div>
  );
};

