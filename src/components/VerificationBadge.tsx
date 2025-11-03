"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { CheckCircle2, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationBadgeProps {
  status: "verified" | "synced" | "unknown";
  publisher?: string;
  lastSeenAt?: string;
  sourceHash?: string;
  className?: string;
  compact?: boolean;
}

export default function VerificationBadge({
  status,
  publisher = "protenders.co.za",
  lastSeenAt,
  sourceHash,
  className = "",
  compact = false,
}: VerificationBadgeProps) {
  if (status === "unknown") return null;

  const isVerified = status === "verified";
  const hashTail = sourceHash ? sourceHash.slice(-8) : "";
  const timeAgo = lastSeenAt ? formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true }) : null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={isVerified ? "default" : "secondary"} className={`gap-1 text-xs ${className}`}>
              {isVerified ? <CheckCircle2 className="h-3 w-3" /> : <Database className="h-3 w-3" />}
              {isVerified ? "Verified" : "Synced"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-semibold">{isVerified ? "Verified from live feed" : "Synced from local database"}</p>
              <p>Publisher: {publisher}</p>
            {timeAgo && <p suppressHydrationWarning>Last seen: {timeAgo}</p>}
              {hashTail && <p className="text-muted-foreground font-mono">Hash: ...{hashTail}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={isVerified ? "default" : "secondary"} className={`gap-1.5 ${className}`}>
            {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
            <span className="font-medium">{isVerified ? "Verified" : "Historical"}</span>
            <span className="opacity-80">•</span>
            <span className="text-xs opacity-90">{publisher}</span>
            {timeAgo && (
              <>
                <span className="opacity-80">•</span>
                <span className="text-xs opacity-90" suppressHydrationWarning>{timeAgo}</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1 max-w-xs">
            <p className="font-semibold">{isVerified ? "✓ Verified from official source" : "Synced from local database"}</p>
            <p>
              This tender was {isVerified ? "fetched from" : "previously synced from"} the official {publisher} feed.
            </p>
            {timeAgo && <p className="text-muted-foreground">Last seen in live feed {timeAgo}</p>}
            {hashTail && <p className="text-muted-foreground font-mono">Integrity hash: ...{hashTail}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
