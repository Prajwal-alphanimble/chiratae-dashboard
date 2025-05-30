"use client";

import React from "react";
import GeneralLineChart from "./GeneralLineChart";

// Define the DataPoint type to match the one in GeneralLineChart
interface DataPoint {
    [period: string]: number;
}

// Define the LineChartData type to match the one in GeneralLineChart
interface LineChartData {
    [companyName: string]: DataPoint[];
}

// Sample data with the correct type
const sampleData: LineChartData = {
    Curefit: [
        {
            "Q2 2019": 1294430780.96,
        },
        {
            "Q3 2019": 1727493396.55,
        },
        {
            "Q4 2019": 2044849043.96,
        },
        {
            "Q1 2020": 1693735100.0,
        },
        {
            "Q2 2020": 262290000.0,
        },
        {
            "Q3 2020": 233805000.0,
        },
        {
            "Q4 2020": 353260000.0,
        },
        {
            "Q1 2021": 578360000.0,
        },
    ],
    Lenskart: [
        {
            "Q2 2018": 1551450470.25,
        },
        {
            "Q3 2018": 1677259231.44,
        },
        {
            "Q4 2018": 1780641082.49,
        },
        {
            "Q1 2019": 1991145495.76,
        },
        {
            "Q2 2019": 2046500000.0,
        },
        {
            "Q3 2019": 2186700000.0,
        },
        {
            "Q4 2019": 2352520000.0,
        },
        {
            "Q1 2020": 2279000000.0,
        },
    ],
};

export default function LineChartDemo() {
    return (
        <div className="p-6">
            {/* <h1 className="text-2xl font-bold mb-4">Line Chart Demo</h1>
            <p className="mb-6">
                This demo shows how to use the GeneralLineChart component with data in the specified format.
            </p> */}

            <GeneralLineChart
                data={sampleData}
                title="Company Revenue Over Time"
                height={250}
            />

            {/* <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">How to Use</h2>
        <p className="mb-4">
          The GeneralLineChart component accepts data in the following format:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`{
  "CompanyName1": [
    { "Q1 2020": 1000000 },
    { "Q2 2020": 1500000 },
    // more periods...
  ],
  "CompanyName2": [
    { "Q1 2020": 2000000 },
    { "Q2 2020": 2500000 },
    // more periods...
  ]
}`}
        </pre>
      </div> */}
        </div>
    );
}
