import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    const upper = status.toUpperCase();
    if (upper === "SUCCESS" || upper === "HEALTHY" || upper === "COMPLETED") {
      return "default"; // Green
    }
    if (upper === "FAILED" || upper === "ERROR") {
      return "destructive"; // Red
    }
    if (upper === "RUNNING" || upper === "PENDING" || upper === "PROCESSING") {
      return "secondary"; // Gray
    }
    return "outline";
  };

  return (
    <Badge variant={getVariant()} className="uppercase">
      {status}
    </Badge>
  );
}
