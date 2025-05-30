import { useState, useMemo } from "react";
import DataTable from "@/components/custom/dataTable";
import { Card } from "@/components/ui/card";
import { InternationalMetricsDetails } from "@/app/services/internationalMetricsServices";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

type internationalMetricsTemplateProps = {
    data: InternationalMetricsDetails[];
    isLoading?: boolean;
};

export default function internationalMetricsTemplate({
    data,
    isLoading,
}: internationalMetricsTemplateProps) {
    const [showChart, setShowChart] = useState(false);
    const [periodType, setPeriodType] = useState<"Annual" | "Quarterly">("Annual");

    const chartData = useMemo(() => {
        if (!data) return [];

        // Filter data based on period type
        const filteredData = data.filter(item => item.Chart_Period_Type === periodType);

        // Group data by period
        const groupedData = filteredData.reduce((acc, item) => {
            const period = item.Chart_Period_Title;
            if (!acc[period]) {
                acc[period] = {};
            }
            acc[period][item.Chart_Metric_Name] = item.Chart_Values;
            return acc;
        }, {} as Record<string, Record<string, number | null>>);

        // Transform to array format for chart
        return Object.entries(groupedData).map(([period, values]) => ({
            period,
            ...values
        }));
    }, [data, periodType]);

    const chartConfig = useMemo(() => {
        if (!data) return {};

        const uniqueCountries = Array.from(new Set(data.map(item => item.Chart_Metric_Name)));
        return uniqueCountries.reduce((acc, country) => ({
            ...acc,
            [country]: {
                label: country,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            }
        }), {});
    }, [data]);

    return (
        <div className="flex item-center justify-center">
            <Card className="bg-background mx-2 shadow-md shadow-foreground/40 hover:shadow-foreground/50 w-full">
                <div className="flex items-center justify-between p-2 pt-0 border-b">
                    <div className="flex justify-center items-center gap-20">
                        <div className="flex items-center gap-2 ml-6">
                            <Label htmlFor="view-toggle">Table View</Label>
                            <Switch
                                id="view-toggle"
                                checked={showChart}
                                onCheckedChange={setShowChart}
                            />
                            <Label htmlFor="view-toggle">Chart View</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="period-toggle">Annual</Label>
                            <Switch
                                id="period-toggle"
                                checked={periodType === "Quarterly"}
                                onCheckedChange={(checked) => setPeriodType(checked ? "Quarterly" : "Annual")}
                            />
                            <Label htmlFor="period-toggle">Quarterly</Label>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    {showChart ? (
                        <ChartContainer config={chartConfig} className="max-h-120 w-full p-6">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                {Object.keys(chartConfig).map((country) => (
                                    <Line
                                        key={country}
                                        type="monotone"
                                        dataKey={country}
                                        stroke={`var(--color-${country})`}
                                        strokeWidth={1}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <DataTable
                            data={data.filter(item => item.Chart_Period_Type === periodType)}
                            isLoading={isLoading}
                            defaultHiddenColumns={["Chart_Period_Type", "Chart_Period_ID"]}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}