"use client"

import type React from "react"
import { useState } from "react"
import { Send, BarChart2, Table, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChartData {
  [key: string]: Array<{ [key: string]: number | null }>;
}

interface TableData {
  table: string;
}

interface ChatInputProps {
  onChartData: (data: ChartData) => void;
  onTableData: (data: TableData) => void;
  isChartView: boolean;
  onViewToggle: (isChart: boolean) => void;
  onQueryChange: (query: string) => void;
  onSave: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

export default function ChatInput({ 
  onChartData, 
  onTableData, 
  isChartView, 
  onViewToggle,
  onQueryChange,
  onSave,
  setIsLoading
}: ChatInputProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const endpoint = isChartView ? '/chart-agent' : '/table-agent';
      const response = await fetch(`http://localhost:6969${endpoint}?query=${encodeURIComponent(prompt)}`)
      const data = await response.json()
      
      if (isChartView) {
        onChartData(data)
      } else {
        onTableData(data)
      }
      onQueryChange(prompt)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
    setPrompt("")
  }

  return (
    <div className="w-full max-w-2xl mt-6">
      <div className="flex justify-center mb-4">
        <Button
          variant={isChartView ? "default" : "outline"}
          onClick={() => onViewToggle(true)}
          className="rounded-r-none"
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Chart
        </Button>
        <Button
          variant={!isChartView ? "default" : "outline"}
          onClick={() => onViewToggle(false)}
          className="rounded-l-none"
        >
          <Table className="h-4 w-4 mr-2" />
          Table
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask anything now..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" aria-label="Send prompt">
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="outline"
            onClick={onSave}
            aria-label="Save view"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

