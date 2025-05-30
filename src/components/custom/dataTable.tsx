"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
  ColumnPinningState,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heading1, MoreHorizontal, Pin, PinOff, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flexRender } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, EllipsisVertical, Copy, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelectParam } from "./Custom-multiselect";

// Add number format type
type NumberFormat = 'US' | 'INR';

// Add number formatting utility function
const formatNumber = (value: any, format: NumberFormat = 'US'): string => {
  if (value === null || value === undefined || value === '') return '';

  // Try to convert to number
  const num = Number(value);
  if (isNaN(num)) return value.toString();

  // Format based on style
  if (format === 'US') {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  } else {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }
};

interface DataTableProps<TData> {
  data: TData[];
  columns?: ColumnDef<TData, any>[];
  isLoading?: boolean;
  enableColumnPinning?: boolean;
  enableColumnFilters?: boolean;
  enableColumnSorting?: boolean;
  baseCurrency?: string;
  defaultHiddenColumns?: string[];
}

type MultiSelectFilterValue = {
  value: string[];
};

export default function DataTable<TData extends Record<string, any>>({
  data,
  columns: definedColumns,
  isLoading,
  enableColumnPinning = true,
  enableColumnFilters = true,
  enableColumnSorting = true,
  baseCurrency = "INR",
  defaultHiddenColumns,
}: DataTableProps<TData>) {
  const [ready, setReady] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [convertedCurrency, setConvertedCurrency] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedData, setConvertedData] = useState<TData[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Function to convert currency
  const convertCurrency = async (
    amount: number,
    isINRtoUSD: boolean,
    date: string = "latest",
    isQuarterly: boolean = false,
    isAnnual: boolean = false
  ): Promise<number> => {
    const response = await fetch(
      `/api/currency-converter?isINRtoUSD=${isINRtoUSD}&date=${date}&amount=${amount}&isQuarterly=${isQuarterly}&isAnnual=${isAnnual}`
    );
    const data = await response.json();
    return isINRtoUSD ? data.USD : data.INR;
  };

  // Function to handle currency conversion
  const handleCurrencyConversion = async (shouldConvert: boolean) => {
    setConvertedCurrency(shouldConvert);

    if (!shouldConvert || !data.length) {
      setConvertedData([]);
      return;
    }

    setIsConverting(true);

    try {
      const isINRtoUSD = baseCurrency === "INR";
      const targetCurrency = isINRtoUSD ? "USD" : "INR";

      const converted = await Promise.all(
        data.map(async (record: any) => {
          const value = parseFloat(record.value);
          if (isNaN(value)) return { ...record };

          try {
            const convertedValue = await convertCurrency(
              value,
              isINRtoUSD,
              record.period,
              record.periodType === "Quarterly",
              record.periodType === "Annual"
            );

            if (convertedValue !== undefined && convertedValue !== null) {
              return {
                ...record,
                value: convertedValue.toFixed(2),
                original_value: record.value,
                Currency_Code: targetCurrency,
              };
            } else {
              console.warn(`Currency conversion failed for value: ${value}`);
              return {
                ...record,
                original_value: record.value,
                Currency_Code: baseCurrency,
              };
            }
          } catch (convError) {
            console.warn(`Error converting value ${value}: ${convError}`);
            return {
              ...record,
              original_value: record.value,
              Currency_Code: baseCurrency,
            };
          }
        })
      );

      setConvertedData(converted);
    } catch (error) {
      console.error("Error converting currency:", error);
      setConvertedCurrency(false);
    } finally {
      setIsConverting(false);
    }
  };

  // Calculate display data
  const displayData = convertedCurrency && convertedData.length > 0 ? convertedData : data;

  // Use the definedColumns if provided, otherwise generate from data
  const columns: ColumnDef<TData, any>[] = React.useMemo(() => {
    if (definedColumns) {
      return definedColumns;
    }

    if (!data || data.length === 0) return [];

    // Check if Currency_Code exists in the data
    const hasCurrencyCode = data[0] && 'Currency_Code' in data[0];

    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      cell: ({ row }) => {
        const value = row.getValue(key);
        // Check if value is numeric
        if (!isNaN(Number(value)) && value !== null && value !== undefined && value !== '') {
          // Get the Currency_Code if available, otherwise use the baseCurrency
          let format: NumberFormat = baseCurrency === "INR" ? "INR" : "US";

          // Only try to access Currency_Code if it exists
          if (hasCurrencyCode) {
            try {
              const currencyCode = row.getValue('Currency_Code');
              if (currencyCode) {
                format = currencyCode === 'USD' ? 'US' : 'INR';
              }
            } catch (error) {
              // Fallback to baseCurrency if there's an error
              console.log("Falling back to base currency format");
            }
          }

          return formatNumber(value, format);
        }
        return value?.toString() ?? "";
      },
      filterFn: (row, columnId, filterValue: MultiSelectFilterValue) => {
        if (!filterValue.value || filterValue.value.length === 0) return true;
        const cellValue = row.getValue(columnId)?.toString() ?? "";
        return filterValue.value.includes(cellValue);
      },
    }));
  }, [data, definedColumns, baseCurrency]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });

  // Initialize columnVisibility after data is loaded
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Initialize visibility state when columns are ready
  useEffect(() => {
    if (!data || data.length === 0 || columns.length === 0) return;

    const initialVisibility: VisibilityState = {};

    // Get all column IDs from the columns
    const columnIds = columns.map(col => {
      const colAny = col as any;
      return colAny.accessorKey || col.id || '';
    }).filter(id => id !== '');

    // Default to showing all columns
    columnIds.forEach(id => {
      initialVisibility[id] = true;
    });

    // Then hide specifically mentioned columns
    if (defaultHiddenColumns && defaultHiddenColumns.length > 0) {
      const hiddenCols = defaultHiddenColumns.map(col => col.toLowerCase());

      columnIds.forEach(id => {
        if (hiddenCols.includes(id.toLowerCase())) {
          initialVisibility[id] = false;
        }
      });
    }

    setColumnVisibility(initialVisibility);
    setReady(true);
  }, [data, columns, defaultHiddenColumns]);

  const handleColumnPinning = (columnId: string) => {
    const isPinned = columnPinning.left?.includes(columnId) || false;
    setColumnPinning({
      ...columnPinning,
      left: isPinned
        ? columnPinning.left?.filter((id: string) => id !== columnId) || []
        : [...(columnPinning.left || []), columnId],
    });
  };

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    state: {
      columnVisibility,
      columnFilters,
      sorting,
      columnPinning,
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: enableColumnSorting,
    enablePinning: enableColumnPinning,
    enableFilters: enableColumnFilters,
  });

  // Conditional rendering for loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Conditional rendering for empty data
  if (!data || data.length === 0) {
    return <div>No data to display.</div>;
  }

  // Conditional rendering for invalid data format
  if (!data[0]) {
    return <div>Invalid data format.{typeof data[0]}</div>;
  }

  // Wait until we've calculated the visibility state
  if (!ready) {
    return <div className="flex justify-center items-center">Preparing table...</div>;
  }

  const getUniqueColumnValues = (columnId: string) => {
    const uniqueValues = new Set<string>();
    data.forEach((row) => {
      const value = row[columnId]?.toString();
      if (value) uniqueValues.add(value);
    });
    return Array.from(uniqueValues);
  };

  const toggleColumn = (headerId: string) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(headerId)) {
        newSet.delete(headerId);
      } else {
        newSet.add(headerId);
      }
      return newSet;
    });
  };

  // Function to get total number of active filters
  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, values) => count + values.length, 0);
  };

  const EMPTY_FILTER_ARRAY: string[] = []; // Define a stable empty array

  // Function to get filter badges for a column
  const getFilterBadges = (columnId: string) => {
    return selectedFilters[columnId] || EMPTY_FILTER_ARRAY; // Use stable empty array
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-end mr-5 gap-2">
        {enableColumnFilters ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-1 border-l-2 border-b-2 border-foreground rounded-lg">
                <Filter className="h-4 w-4" />
                Filter
                {getActiveFilterCount() > 0 && (
                  <span className="ml-1 bg-foreground text-background rounded-full px-2 py-0.5 text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-foreground/10">
              <DropdownMenuLabel>Filter Columns</DropdownMenuLabel>
              {table.getAllColumns()
                .filter(column => table.getState().columnVisibility[column.id])
                .map((column) => (
                  <DropdownMenu key={column.id}>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span>{column.columnDef.header as string}</span>
                            <span className="ml-auto">▶</span>
                          </div>
                          {getFilterBadges(column.id).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getFilterBadges(column.id).map((value) => (
                                <span
                                  key={value}
                                  className="bg-foreground/10 text-xs px-1.5 py-0.5 rounded"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-60 mr-1 border-foreground/10">
                      <div className="">
                        <MultiSelectParam
                          options={getUniqueColumnValues(column.id)}
                          defaultValue={selectedFilters[column.id] || []}
                          placeholder={`Filter ${column.columnDef.header as string}`}
                          onChange={(selectedValues: string[]) => {
                            column.setFilterValue({
                              value: selectedValues,
                            } as MultiSelectFilterValue);
                            setSelectedFilters(prev => ({
                              ...prev,
                              [column.id]: selectedValues
                            }));
                            if (!selectedColumns.has(column.id)) {
                              toggleColumn(column.id);
                            }
                          }}
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <section className="pt-2 p-6">
        <div className="w-full border-1 border-l-4 border-b-4 border-foreground rounded-lg p-2">
          <Table className="min-w-max font-medium">
            <TableHeader className="border-b-2 border-foreground rounded-lg">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers
                    .filter(header => {
                      // Show all columns that are visible according to column visibility state
                      return table.getState().columnVisibility[header.id];
                    })
                    .map((header) => (
                      <TableCell
                        key={header.id}
                        className={`cursor-pointer rounded-xl p-1${(columnPinning.left || []).includes(header.id)
                          ? " sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                          : ""
                          }`}
                      >
                        <div className="flex items-center justify-center">
                          <div className="flex">
                            <div
                              className="flex items-center gap-2"
                              onClick={() =>
                                enableColumnSorting
                                  ? header.column.toggleSorting(
                                    header.column.getIsSorted() === "asc"
                                  )
                                  : null
                              }
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              {header.column.getIsSorted() === "asc" ? (
                                null
                              ) : <ArrowUpDown className="h-4 w-4" />}
                            </div>
                          </div>
                          {enableColumnPinning ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-foreground/10 border-0"
                              onClick={() =>
                                handleColumnPinning(header.id)
                              }
                            >
                              {(columnPinning.left || []).includes(header.id) ? (
                                <PinOff className="h-4 w-4" />
                              ) : (
                                <Pin className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-foreground/10 border-b-1 border-dotted border-foreground/20"
                >
                  {row.getVisibleCells()
                    .filter(cell => {
                      // Show all cells that are visible according to column visibility state
                      return true;
                    })
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          (columnPinning.left || []).includes(cell.column.id)
                            ? "sticky left-0 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <section className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-foreground/10 p-5 border-1 border-foreground/20"
              onClick={() => {
                // Clear all filters
                table.getAllColumns().forEach((column) => {
                  column.setFilterValue("");
                });
                // Unpin all columns
                setColumnPinning({
                  left: [],
                  right: [],
                });
                // Clear all selected columns
                setSelectedColumns(new Set());
                // Make all columns visible
                const allColumns = table.getAllColumns();
                const visibilityState: VisibilityState = {};
                allColumns.forEach((column) => {
                  visibilityState[column.id] = true;
                });
                setColumnVisibility(visibilityState);
              }}
            >
              <Trash2 />
              Clear All
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-foreground text-background hover:bg-foreground/80 hover:text-background"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="overflow-y-auto no-scrollbar max-h-96"
              >
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.id !== "actions")
                  .map((column) => {
                    // Check if this column is in defaultHiddenColumns
                    const isDefaultHidden = defaultHiddenColumns?.some(
                      hiddenCol => hiddenCol.toLowerCase() === column.id.toLowerCase() ||
                        hiddenCol.toLowerCase() === (column.columnDef as any).accessorKey?.toLowerCase()
                    );

                    return (
                      <DropdownMenuItem
                        key={column.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          column.toggleVisibility();
                        }}
                      >
                        {column.getIsVisible() ? "✓ " : "  "}
                        {column.columnDef.header as string}
                        {isDefaultHidden && " (Hidden by default)"}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-foreground text-background hover:bg-foreground/80 hover:text-background"
            >
              Previous
            </Button>
            <input
              defaultValue={table.getState().pagination.pageIndex + 1}
              key={table.getState().pagination.pageIndex}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = Number(e.currentTarget.value);
                  let page = value ? value - 1 : 0;

                  if (page >= table.getPageCount()) {
                    table.setPageIndex(table.getPageCount() - 1);
                  } else if (page < 0) {
                    table.setPageIndex(0);
                  } else {
                    table.setPageIndex(page);
                  }
                }
              }}
              onBlur={(e) => {
                const value = Number(e.currentTarget.value);
                let page = value ? value - 1 : 0;

                if (page >= table.getPageCount()) {
                  table.setPageIndex(table.getPageCount() - 1);
                } else if (page < 0) {
                  table.setPageIndex(0);
                } else {
                  table.setPageIndex(page);
                }
              }}
              className="border-1 p-1 border-foreground/20 rounded max-w-10 text-center"
              max={table.getPageCount()}
            />
            of {table.getPageCount()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-foreground text-background hover:bg-foreground/80 hover:text-background"
            >
              Next
            </Button>
          </div>
        </section>
      </section>
    </div>
  );
}