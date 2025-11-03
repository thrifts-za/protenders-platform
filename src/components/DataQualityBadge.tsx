"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DataQualityBadgeProps {
  score: number;
  showLabel?: boolean;
}

export const DataQualityBadge = ({ score, showLabel = true }: DataQualityBadgeProps) => {
  const getVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  const getTooltipText = (score: number) => {
    const factors = [];
    if (score < 100) factors.push("Missing some key information");
    if (score >= 80) return "High quality: All essential fields present";
    if (score >= 60) return `Moderate quality: ${factors.join(", ")}`;
    return "Low quality: Several fields missing";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={getVariant(score)} className="gap-1 cursor-help">
          <Info className="h-3 w-3" />
          {showLabel && `Data: ${score}%`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{getTooltipText(score)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on: title, buyer, closing date, documents, category
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
