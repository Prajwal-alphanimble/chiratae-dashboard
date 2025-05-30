import React from "react";
import DataTable from "@/components/custom/dataTable";
import { DealByDealIRR } from "@/app/services/dealCashflowServices";
import { Card } from "@/components/ui/card";

type DealCashflowTemplateProps = {
  data: DealByDealIRR[];
  isLoading?: boolean;
};

export default function DealCashflowTemplate({
  data,
  isLoading,
}: DealCashflowTemplateProps) {
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
