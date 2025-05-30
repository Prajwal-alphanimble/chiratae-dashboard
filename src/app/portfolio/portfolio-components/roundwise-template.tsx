import React from "react";
import { DealListDetails } from "@/app/services/dealListService";
import DataTable from "@/components/custom/dataTable";
import { Card } from "@/components/ui/card";

type RoundwiseTemplateProps = {
  data: DealListDetails[];
  isLoading?: boolean;
};

export default function RoundwiseTemplate({
  data,
  isLoading,
}: RoundwiseTemplateProps) {
  return (
    <>
      <Card className="bg-background m-2 shadow-md shadow-foreground/40 hover:shadow-foreground/50">
        <div className="w-full">
          <DataTable data={data} isLoading={isLoading} defaultHiddenColumns={["Asset_Name"]} />
        </div>
      </Card>
    </>
  );
}
