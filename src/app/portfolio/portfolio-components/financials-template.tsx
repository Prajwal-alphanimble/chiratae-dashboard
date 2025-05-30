"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import FundPerformanceTable from "@/components/custom/FundPerformanceTable";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";

export default function FinanclialTemplate() {
  const [tables, setTables] = useState<number[]>([0]);

  const addTable = () => {
    setTables((prevTables) => [...prevTables, prevTables.length]);
  };

  const removeTable = () => {
    setTables((prevTables) => {
      if (prevTables.length > 1) {
        return prevTables.slice(0, prevTables.length - 1);
      }
      return prevTables; // Return the current state if there's only one table
    });
  };

  // Function to create rows of tables (max 2 per row)
  const getTableRows = () => {
    const rows = [];
    for (let i = 0; i < tables.length; i += 2) {
      const rowTables = tables.slice(i, i + 2);
      rows.push(rowTables);
    }
    return rows;
  };

  const tableRows = getTableRows();

  return (
    <>
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-5xl font-bold"></h1>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={addTable}
              variant="outline"
              size="icon"
              className="hover:bg-foreground/10 border-1 border-b-3 border-l-3 border-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              onClick={removeTable}
              variant="outline"
              size="icon"
              className="hover:bg-foreground/10 border-1 border-b-3 border-l-3 border-foreground"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-10">
          {tableRows.map((rowTables, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="rounded-base shadow-shadow"
            >
              {rowTables.length === 1 ? (
                // If there's only one table in this row
                <div className="h-96">
                  <FundPerformanceTable isLoading={false} />
                </div>
              ) : (
                // If there are two tables in this row, make them horizontally resizable
                <ResizablePanelGroup direction="horizontal" className="h-96">
                  <ResizablePanel defaultSize={50} minSize={40} maxSize={60}>
                    <div className="p-4 h-full overflow-auto">
                      <FundPerformanceTable isLoading={false} />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <div className="p-4 h-full overflow-auto">
                      <FundPerformanceTable isLoading={false} />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
