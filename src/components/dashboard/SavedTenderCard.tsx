import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SavedTender } from "@/types/tender";
import { formatDate, formatRelativeDate } from "@/lib/date";
import { FileText, Calendar, Trash2, Tag } from "lucide-react";
import { useIntel } from "@/hooks/useIntel";
import { DataQualityBadge } from "@/components/DataQualityBadge";
import { createTenderUrlFromTitle } from "@/lib/utils/slug";

interface SavedTenderCardProps {
  saved: SavedTender;
  onRemove: (id: string) => void;
  onSetReminder: (id: string) => void;
}

export const SavedTenderCard = ({ saved, onRemove, onSetReminder }: SavedTenderCardProps) => {
  const { tender } = saved;
  const { data: intel } = useIntel(tender.id);
  const tenderUrl = createTenderUrlFromTitle(tender.title, tender.id);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <Link href={tenderUrl}>
            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer mb-2">
              {tender.title}
            </h3>
          </Link>
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
            {tender.buyerName && <span>{tender.buyerName}</span>}
            {tender.mainProcurementCategory && (
              <>
                <span>•</span>
                <span>{tender.mainProcurementCategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {tender.closingDate && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(tender.closingDate)} ({formatRelativeDate(tender.closingDate)})
              </Badge>
            )}
            {tender.status && (
              <Badge variant="secondary" className="capitalize">
                {tender.status}
              </Badge>
            )}
            {tender.submissionMethods?.map((method) => (
              <Badge key={method} variant="outline">
                {method}
              </Badge>
            ))}
          </div>

          {saved.tags && saved.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {saved.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {intel && (
            <div className="flex flex-wrap gap-2 text-xs mt-2">
              <span className="text-muted-foreground">
                Score: <span className="font-medium text-foreground">{intel.score}/100</span>
              </span>
              {intel.valueBand && (
                <span className="text-muted-foreground">
                  Value: <span className="font-medium text-foreground">{intel.valueBand}</span>
                </span>
              )}
              {intel.paymentReliability && (
                <span className="text-muted-foreground">
                  Payment: <span className="font-medium text-foreground">{intel.paymentReliability}%</span>
                </span>
              )}
            </div>
          )}
        </div>

        <DataQualityBadge score={tender.dataQualityScore} />
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/tender/${tender.id}`}>
            <FileText className="h-3 w-3 mr-1" />
            View Details
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSetReminder(tender.id)}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Reminder
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(saved.tenderId)}
          className="ml-auto"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};
