import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetDetails } from "@/app/services/assetDetailsService";
import { Card } from "@/components/ui/card";
type OverviewTemplateProps = AssetDetails & {
  isLoading: boolean;
};

export default function OverviewTemplate({
  Support_Provided,
  Latest_Developments,
  Status,
  Asset_Name,
  Description,
  Website,
  Base_Currency,
  Deal_Support,
  Deal_Lead,
  isLoading,
}: OverviewTemplateProps) {
  return (
    <>
      <div className="flex justify-center item-center w-full">
        <Card className="bg-background w-fit p-6 shadow-md shadow-foreground/40 hover:shadow-foreground/50">
          <section>
            <h1 className="flex justify-center text-6xl font-bold mb-6">
              {Asset_Name}
            </h1>
            <div className="flex justify-center items-center border-2 border-b-4 border-l-4 border-foreground rounded-lg max-w-5xl p-5">
              <Table>
                <TableHeader></TableHeader>
                <TableBody className="text-xl">
                  <TableRow className=" border-b-0">
                    <TableCell className="">Support Provided</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Support_Provided}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Latest Development</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Latest_Developments}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Status</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Status}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Asset Name</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Asset_Name}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Description</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Description}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Website</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      <a href={Website}>
                        {Website}
                      </a>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Base Currency</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Base_Currency}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Deal Support</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Deal_Support}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="">Deal Lead</TableCell>
                    <TableCell className="whitespace-normal border-l border-foreground">
                      {Deal_Lead}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>
        </Card>
      </div>
    </>
  );
}
