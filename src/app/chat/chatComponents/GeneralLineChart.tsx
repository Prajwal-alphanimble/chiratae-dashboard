"use client";

import React, { useMemo } from 'react';
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

// Define the type for each data point in the array - must have exactly one key
interface DataPoint {
    [period: string]: number;
}

// Define the type for the input data format
interface LineChartData {
    [companyName: string]: DataPoint[];
}

interface GeneralLineChartProps {
    data: LineChartData;
    title?: string;
    className?: string;
    height?: number | string;
}

export default function GeneralLineChart({
    data,
    title = "Line Chart",
    className = "",
    height = 400
}: GeneralLineChartProps) {
    // Transform the data into a format suitable for Recharts
    const chartData = useMemo(() => {
        // Collect all unique periods while preserving original order
        const periodsSet = new Set<string>();
        const allPeriods: string[] = [];

        // First get all periods from all companies
        Object.values(data).forEach(companyData => {
            companyData.forEach(dataPoint => {
                const period = Object.keys(dataPoint)[0];
                // Only add it if we haven't seen it before
                if (!periodsSet.has(period)) {
                    periodsSet.add(period);
                    allPeriods.push(period);
                }
            });
        });

        // Create data points for each period in the original order
        return allPeriods.map(period => {
            const dataPoint: Record<string, any> = { period };

            // Add values for each company if available for this period
            Object.entries(data).forEach(([companyName, companyData]) => {
                const matchingDataPoint = companyData.find(dp => Object.keys(dp)[0] === period);
                if (matchingDataPoint) {
                    dataPoint[companyName] = matchingDataPoint[period];
                } else {
                    dataPoint[companyName] = null; // No data for this period
                }
            });

            return dataPoint;
        });
    }, [data]);

    // Create chart config for colors
    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string, color: string }> = {};

        Object.keys(data).forEach((companyName, index) => {
            config[companyName] = {
                label: companyName,
                color: `hsl(${index * 137 % 360}, 70%, 50%)`,
            };
        });

        return config;
    }, [data]);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-full">
                    <Recharts.ResponsiveContainer width="100%" height={height}>
                        <Recharts.LineChart data={chartData}>
                            <Recharts.CartesianGrid strokeDasharray="3 3" />
                            <Recharts.XAxis
                                dataKey="period"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <Recharts.YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                                    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                                    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                                    return value.toString();
                                }}
                            />
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                        <ChartTooltipContent
                                            active={active}
                                            payload={payload}
                                            label={payload[0].payload.period}
                                            formatter={(value) => {
                                                return [`₹${value.toLocaleString()}`];
                                            }}
                                        />
                                    );
                                }}
                            />
                            <Recharts.Legend />

                            {Object.keys(data).map((companyName, index) => (
                                <Recharts.Line
                                    key={companyName}
                                    dataKey={companyName}
                                    name={companyName}
                                    stroke={`var(--color-${companyName})`}
                                    activeDot={{ r: 4 }}
                                    strokeWidth={2}
                                    connectNulls
                                />
                            ))}
                        </Recharts.LineChart>
                    </Recharts.ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
} 