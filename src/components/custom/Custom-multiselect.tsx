"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X as RemoveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface MultiSelectParamProps {
  options: string[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?: (value: string[]) => void;
  className?: string;
}

export const MultiSelectParam: React.FC<MultiSelectParamProps> = ({
  options,
  defaultValue = [],
  onChange,
  placeholder,
  className,
}) => {
  const safeOptions = Array.isArray(options) ? options : [];
  const [selectedValues, setSelectedValues] =
    React.useState<string[]>(defaultValue);
  const [fieldData, setfieldData] = useState<string[]>([]);

  const {
    isLoading,
    data: assetList,
    isError,
  } = useQuery({
    queryKey: ["assetList"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/asset-list");
      if (!res.ok) {
        throw new Error("failed to fetch asset list");
      }
      const data = await res.json();
      setfieldData(data.assetList);
      return data.assetList;
    },
  });

  const handleValueChange = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const removeValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter((v) => v !== valueToRemove);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  return (
    <Select onValueChange={handleValueChange}>
      <div className="flex flex-wrap gap-1 overflow-x-hidden overflow-y-auto max-h-10">
        {selectedValues.map((value) => (
          <Badge
            key={value}
            className="rounded-xl flex items-center gap-1"
            variant="secondary"
          >
            <span className="text-xs">{value}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeValue(value);
              }}
              className="focus:outline-none"
            >
              <RemoveIcon className="h-3 w-3 hover:stroke-destructive" />
            </button>
          </Badge>
        ))}
      </div>
      <SelectTrigger
        className={cn(
          "w-full min-w-[12rem] flex flex-wrap gap-1 min-h-[2.5rem] border-1 bg-background",
          className
        )}
      >
        {selectedValues.length === 0 ? (
          <SelectValue placeholder={placeholder} />
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SelectTrigger>
      <SelectContent className="min-w-[12rem] border-foreground/10">
        {safeOptions.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className={selectedValues.includes(option) ? "bg-accent" : ""}
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
