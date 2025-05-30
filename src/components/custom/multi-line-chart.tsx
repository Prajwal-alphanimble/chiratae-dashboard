"use client";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export type DataPoint = Record<string, string | number>;

export interface LineChartProps<T extends DataPoint = DataPoint> {
  data: T[];
  lines: Array<{
    dataKey: keyof T & string;
    name?: string;
    color?: string;
    strokeWidth?: number;
    type?:
      | "linear"
      | "monotone"
      | "step"
      | "stepBefore"
      | "stepAfter"
      | "natural"
      | "basis";
    dot?: boolean | object;
    activeDot?: boolean | object;
  }>;
  xAxisKey: keyof T & string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number | string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  tooltipIndicator?: "dot" | "line";
  className?: string;
}

export function MultiLineChart<T extends DataPoint = DataPoint>({
  data,
  lines,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  tooltipIndicator = "dot",
  className,
}: LineChartProps<T>) {
  // Create config for ChartContainer
  const chartConfig = lines.reduce((acc, line) => {
    const dataKey = line.dataKey;
    return {
      ...acc,
      [dataKey]: {
        label: line.name || dataKey,
        color: line.color || `hsl(var(--chart-${Object.keys(acc).length + 1}))`,
      },
    };
  }, {});

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: "insideBottom", offset: -5 }
                : undefined
            }
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft" }
                : undefined
            }
          />

          {showTooltip && (
            <Tooltip
              content={<ChartTooltipContent indicator={tooltipIndicator} />}
              cursor={{
                stroke: "var(--border)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              wrapperStyle={{ outline: "none" }}
            />
          )}

          {showLegend && <Legend />}

          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type={line.type || "monotone"}
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={`var(--color-${line.dataKey})`}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== undefined ? line.dot : { r: 3 }}
              activeDot={
                line.activeDot !== undefined
                  ? line.activeDot
                  : { r: 6, strokeWidth: 1, stroke: "var(--background)" }
              }
              isAnimationActive={true}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
