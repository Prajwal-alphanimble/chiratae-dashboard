"use client"

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import * as Recharts from "recharts";

interface TimeSeriesData {
  [key: string]: number | null;
}

interface ChartData {
  [key: string]: TimeSeriesData[];
}

interface TimeSeriesChartProps {
  data: ChartData;
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // Transform the data into a format that the chart can use
  const transformedData = React.useMemo(() => {
    const result: any[] = [];
    const allKeys = new Set<string>();

    // Get all unique time periods
    Object.values(data).forEach(series => {
      series.forEach(point => {
        Object.keys(point).forEach(key => allKeys.add(key));
      });
    });

    // Create data points for each time period
    Array.from(allKeys).sort((a, b) => {
      // Extract quarter and year from the time period string (format: "Q2 2018")
      const [quarterA, yearA] = a.split(' ');
      const [quarterB, yearB] = b.split(' ');
      
      // Compare years first
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      // If years are equal, compare quarters
      return parseInt(quarterA.substring(1)) - parseInt(quarterB.substring(1));
    }).forEach(timePeriod => {
      const dataPoint: any = { timePeriod };
      Object.entries(data).forEach(([metricName, series]) => {
        const value = series.find(point => point[timePeriod] !== undefined)?.[timePeriod];
        dataPoint[metricName] = value;
      });
      result.push(dataPoint);
    });

    return result;
  }, [data]);

  // Create chart config for colors
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { color: string }> = {};
    Object.keys(data).forEach((metricName, index) => {
      config[metricName] = {
        color: `hsl(${index * 40}, 70%, 50%)`,
      };
    });
    return config;
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Time Series Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <Recharts.LineChart data={transformedData}>
            <Recharts.CartesianGrid strokeDasharray="3 3" />
            <Recharts.XAxis 
              dataKey="timePeriod" 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <Recharts.YAxis />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={payload[0].payload.timePeriod}
                  />
                );
              }}
            />
            <Recharts.Legend />
            {Object.keys(data).map((metricName,index) => (
              <Recharts.Line
                key={metricName}
                dataKey={metricName}
                name={metricName}
                stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                activeDot={{ r: 4 }}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </Recharts.LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 