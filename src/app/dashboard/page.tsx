"use client";

import React, { useState, useEffect } from "react";
import { getViewsFromUserId } from "@/app/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import TimeSeriesChart from "@/components/custom/TimeSeriesChart";
import MarkdownTable from "@/app/chat/chatComponents/chatDataTable";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";

const ReactGridLayout = WidthProvider(RGL);

interface ViewData {
  id: string;
  type: "CHART" | "TABLE";
  source: "AI" | "QUANTIUM";
  title: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface DashboardView extends ViewData {
  gridId: string;
}

function Dashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedView, setSelectedView] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [layout, setLayout] = useState<Layout[]>([]);
  const [dashboardViews, setDashboardViews] = useState<DashboardView[]>([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const authResponse = await fetch("/api/auth");
      if (!authResponse.ok) {
        if (authResponse.status === 401) {
          throw new Error("User not authenticated");
        }
        throw new Error("Failed to authenticate user");
      }
      const { userId } = await authResponse.json();
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  const { data: views, isLoading } = useQuery({
    queryKey: ["userViews"],
    queryFn: async () => {
      const userViews = await getViewsFromUserId(userId);
      if (!userViews) {
        throw new Error("Failed to fetch user views");
      }
      return userViews;
    },
  });

  useEffect(() => {
    if (views?.userViews) {
      const savedLayout = localStorage.getItem('dashboardLayout');
      const savedViews = localStorage.getItem('dashboardViews');

      if (savedLayout && savedViews) {
        setLayout(JSON.parse(savedLayout));
        setDashboardViews(JSON.parse(savedViews));
      }
    }
  }, [views?.userViews]);

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  };

  const addViewToDashboard = () => {
    if (!selectedView) return;

    const selectedViewData = views?.userViews?.find((view: ViewData) => view.id === selectedView);
    if (!selectedViewData) return;

    const gridId = `${selectedViewData.id}-${Date.now()}`;
    const newView: DashboardView = {
      ...selectedViewData,
      gridId,
    } as DashboardView;

    const newLayout = {
      i: gridId,
      x: 0,
      y: dashboardViews.length * 3,
      w: 24,
      h: 20,
      minW: 24,
      minH: 20,
    };

    const updatedViews = [...dashboardViews, newView];
    const updatedLayout = [...layout, newLayout];

    setDashboardViews(updatedViews);
    setLayout(updatedLayout);
    setSelectedView("");

    localStorage.setItem('dashboardViews', JSON.stringify(updatedViews));
    localStorage.setItem('dashboardLayout', JSON.stringify(updatedLayout));
  };

  const renderViewContent = (view: DashboardView) => {
    if (view.type === "CHART") {
      return (
        <TimeSeriesChart
          data={view.data}
        />
      );
    } else if (view.type === "TABLE") {
      const markdownTable = view.data.table || "";
      return (
        <div className="h-full">
          <h3 className="text-lg font-semibold mb-4">{view.title}</h3>
          <div className="h-[calc(100%-3rem)]">
            <MarkdownTable markdownContent={markdownTable} />
          </div>
        </div>
      );
    }
    return null;
  };

  const handleReset = () => {
    setLayout([]);
    setDashboardViews([]);
    localStorage.removeItem('dashboardLayout');
    localStorage.removeItem('dashboardViews');
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pt-4 px-10">
        <div className="flex items-center gap-4">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading views...
                </SelectItem>
              ) : (
                views?.userViews?.map((view: ViewData) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={addViewToDashboard}
            disabled={!selectedView}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              id="edit-mode"
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
            <Label htmlFor="edit-mode">Edit Layout</Label>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Dashboard
          </Button>
        </div>
      </div>

      <div className="p-4" style={{ width: '100%', height: 'calc(100vh)' }}>
        <ReactGridLayout
          className="layout"
          layout={layout}
          cols={64}
          rowHeight={2}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
          margin={[20, 20]}
          containerPadding={[20, 20]}
          isResizable={isEditMode}
          isDraggable={isEditMode}
          preventCollision={false}
          compactType="vertical"
          useCSSTransforms={true}
        >
          {dashboardViews.map((view) => (
            <div
              key={view.gridId}
              className={`bg-white ${isEditMode ? 'drag-handle' : ''} rounded shadow`}
              style={{ border: '1px solid #ccc' }}
            >
              <div className="p-4 h-full">
                {renderViewContent(view)}
              </div>
            </div>
          ))}
        </ReactGridLayout>
      </div>
    </div>
  );
}

export default Dashboard;
