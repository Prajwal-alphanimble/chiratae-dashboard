import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CustomCardProps {
  title: string;
  description: string;
  value: number | string;
}

function CustomCard({ title, description, value }: CustomCardProps) {
  return (
    <Card className="m-4 mb-0 p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className="font-bold text-3xl">{value}</h1>
      </CardContent>
    </Card>
  );
}

export default CustomCard;
