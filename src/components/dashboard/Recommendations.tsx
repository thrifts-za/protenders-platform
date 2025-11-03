import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SavedTender, NormalizedTender } from "@/types/tender";
import { useQuery } from "@tanstack/react-query";
import { searchTenders } from "@/services/searchService";
import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Building2, Bookmark } from "lucide-react";
import { formatDate, formatRelativeDate } from "@/lib/date";

interface RecommendationsProps {
  savedTenders: SavedTender[];
  onSave: (tender: NormalizedTender) => void;
}

export const Recommendations = ({ savedTenders, onSave }: RecommendationsProps) => {
  // Fetch recent active tenders from the API
  const { data: tendersData } = useQuery({
    queryKey: ["recommendations", "recent"],
    queryFn: () => searchTenders({
      page: 1,
      pageSize: 20,
      status: "active",
      closingInDays: 60
    }),
  });

  const recommendations = useMemo(() => {
    const allTenders = tendersData?.data || [];

    if (allTenders.length === 0) {
      return [];
    }

    if (savedTenders.length === 0) {
      // Return first 3 active tenders if no saved tenders
      return allTenders.slice(0, 3);
    }

    // Get categories from saved tenders
    const savedCategories = new Set(
      savedTenders
        .map((t) => t.tender.mainProcurementCategory)
        .filter(Boolean)
    );

    // Find tenders with matching categories
    const matching = allTenders.filter((t: NormalizedTender) =>
      t.mainProcurementCategory && savedCategories.has(t.mainProcurementCategory)
    );

    // Exclude already saved
    const savedIds = new Set(savedTenders.map((t: SavedTender) => t.tenderId));
    const filtered = matching.filter((t: NormalizedTender) => !savedIds.has(t.id));

    // If we have matching tenders, return them, otherwise return recent tenders
    return filtered.length > 0 ? filtered.slice(0, 3) : allTenders.slice(0, 3).filter((t: NormalizedTender) => !savedIds.has(t.id));
  }, [savedTenders, tendersData]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((tender: NormalizedTender) => (
          <div key={tender.id} className="border rounded-lg p-4 space-y-3">
            <Link href={`/tender/${tender.id}`}>
              <h4 className="font-medium hover:text-primary cursor-pointer line-clamp-2">
                {tender.title}
              </h4>
            </Link>

            {tender.buyerName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{tender.buyerName}</span>
              </div>
            )}

            {tender.closingDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(tender.closingDate)}</span>
                <span>({formatRelativeDate(tender.closingDate)})</span>
              </div>
            )}

            {tender.mainProcurementCategory && (
              <Badge variant="secondary" className="text-xs">
                {tender.mainProcurementCategory}
              </Badge>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onSave(tender)}
            >
              <Bookmark className="h-3 w-3 mr-2" />
              Save
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
