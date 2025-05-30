"use client";

import React from 'react';
import GeneralLineChart from '@/app/chat/chatComponents/GeneralLineChart';
import LineChartDemo from '@/app/chat/chatComponents/LineChartDemo';

// Define the types to match the GeneralLineChart component
interface DataPoint {
    [period: string]: number;
}

interface LineChartData {
    [companyName: string]: DataPoint[];
}

// Full example data in the specified format
const exampleData: LineChartData = {
    "Curefit": [
        { "Q2 2019": 1294430780.96 },
        { "Q3 2019": 1727493396.55 },
        { "Q4 2019": 2044849043.96 },
        { "Q1 2020": 1693735100.0 },
        { "Q2 2020": 262290000.0 },
        { "Q3 2020": 233805000.0 },
        { "Q4 2020": 353260000.0 },
        { "Q1 2021": 578360000.0 },
        { "Q2 2021": 269080000.0 },
        { "Q3 2021": 743700000.0 },
        { "Q4 2021": 1044500000.0 },
        { "Q1 2022": 1376600000.0 },
        { "Q2 2022": 1709800000.0 },
        { "Q3 2022": 2280000000.0 },
        { "Q4 2022": 2469500000.0 },
        { "Q1 2023": 2438000000.0 },
        { "Q2 2023": 2615000000.0 },
        { "Q3 2023": 3085000000.0 },
        { "Q4 2023": 3021000000.0 },
        { "Q1 2024": 3017100000.0 },
        { "Q2 2024": 3304300000.0 },
        { "Q3 2024": 4066100000.0 },
        { "Q4 2024": 4063700000.0 },
        { "Q1 2025": 3430000000.0 }
    ],
    "Lenskart": [
        { "Q2 2018": 1551450470.25 },
        { "Q3 2018": 1677259231.44 },
        { "Q4 2018": 1780641082.49 },
        { "Q1 2019": 1991145495.76 },
        { "Q2 2019": 2046500000.0 },
        { "Q3 2019": 2186700000.0 },
        { "Q4 2019": 2352520000.0 },
        { "Q1 2020": 2279000000.0 }
    ]
};

export default function ChartExamplePage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Company Revenue Chart</h1>

            <div className="mb-8">
                <GeneralLineChart
                    data={exampleData}
                    title="Company Quarterly Revenue"
                    height={500}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">About This Chart</h2>
                    <p className="mb-3">
                        This chart displays quarterly revenue data for companies over time. Each line represents a different company,
                        showing how their revenue has changed across various quarters.
                    </p>
                    <p>
                        The data is displayed in the original order from the dataset, preserving the chronological sequence of quarters.
                        The y-axis values are formatted to show in thousands (K), millions (M), or billions (B) for better readability.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Using the Chart Component</h2>
                    <p className="mb-3">
                        The <code className="bg-gray-100 px-1 py-0.5 rounded">GeneralLineChart</code> component accepts the following props:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>data</strong>: Company data in the specified nested format</li>
                        <li><strong>title</strong>: Chart title (optional)</li>
                        <li><strong>height</strong>: Chart height in pixels or as a percentage (optional)</li>
                        <li><strong>className</strong>: Additional CSS classes for styling (optional)</li>
                    </ul>
                </div>
            </div>
            <div>
                <LineChartDemo />
            </div>
        </div>
    );
} 