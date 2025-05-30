"use client"

import React, { useState, useEffect } from 'react';
import ChatInput from './chatComponents/chatInput';
import TimeSeriesChart from '@/components/custom/TimeSeriesChart';
import MarkdownTable from './chatComponents/chatDataTable';
import { saveView } from '../actions';
import { ViewType } from '@/generated/prisma';
import { toast } from 'sonner';

interface ChartData {
  [key: string]: Array<{ [key: string]: number | null }>;
}

interface TableData {
  table: string;
}

const chartLoadingMessages = [
  "Analyzing data patterns...",
  "Preparing visualization...",
  "Calculating metrics...",
  "Generating insights...",
  "Almost there..."
];

const tableLoadingMessages = [
  "Processing your query...",
  "Organizing data...",
  "Formatting results...",
  "Preparing table view...",
  "Almost there..."
];

export default function ChatPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isChartView, setIsChartView] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      const messages = isChartView ? chartLoadingMessages : tableLoadingMessages;
      let currentIndex = 0;
      setCurrentLoadingMessage(messages[0]);

      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % messages.length;
        setCurrentLoadingMessage(messages[currentIndex]);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isChartView]);

  const handleSave = async () => {
    if (!chartData && !tableData) return;

    const data = isChartView ? chartData : tableData;
    const viewType = isChartView ? ViewType.CHART : ViewType.TABLE;

    const result = await saveView(data, viewType, userQuery);
    
    if (result.success) {
      toast.success("View saved successfully");
    } else {
      toast.error("Failed to save view");
    }
  };

  return (
    <div className='relative w-screen h-screen'>
      {/* Chart/Table container - positioned higher up */}
      <div className='absolute top-4/9 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl px-8 mb-10'>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-lg text-gray-600">{currentLoadingMessage}</p>
          </div>
        ) : (
          <>
            {chartData && isChartView && (
              <TimeSeriesChart data={chartData} />
            )}
            {tableData && !isChartView && (
              <MarkdownTable markdownContent={tableData.table} />
            )}
          </>
        )}
      </div>

      {/* Input container - fixed at the bottom */}
      <div className='absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8'>
        <ChatInput 
          onChartData={setChartData} 
          onTableData={setTableData}
          isChartView={isChartView}
          onViewToggle={setIsChartView}
          onQueryChange={setUserQuery}
          onSave={handleSave}
          setIsLoading={setIsLoading}
        />
      </div>
    </div>
  );
}
