"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectParamProps {
  options: string[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const SelectParam: React.FC<SelectParamProps> = ({
  options,
  defaultValue,
  value,
  onChange,
  placeholder,
  className,
}) => {
  return (
    <Select
      onValueChange={onChange}
      defaultValue={defaultValue}
      value={value}
    >
      <SelectTrigger
        className={
          className ||
          "w-full min-w-[12rem] border-1 border-b-3 border-l-3"
        }
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[12rem] border-foreground/10">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
