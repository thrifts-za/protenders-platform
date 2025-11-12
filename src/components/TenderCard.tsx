import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import VerificationBadge from "@/components/VerificationBadge";
import { Calendar, Building2, Tag, Clock } from "lucide-react";
import { formatDate as fmtDate, formatRelativeDate, getDaysUntilClose } from "@/lib/date";
import { createTenderUrlFromTitleAndDescription } from "@/lib/utils/slug";
import { toSentenceCase } from "@/lib/utils";
import type { Tender } from "@/types/tender";
import { trackTenderView } from "@/lib/analytics";

interface TenderCardProps {
  tender: Tender;
}

export function TenderCard({ tender }: TenderCardProps) {
  // Use display title if available (human-readable), otherwise fall back to technical title
  const title = tender.displayTitle || tender.tender?.title || "Untitled Tender";
  const description = tender.tender?.description || "";
  const buyerName = tender.buyer?.name || "";
  const category = tender.tender?.mainProcurementCategory || "";
  const detailedCategory = tender.detailedCategory;
  const publishedAt = tender.publishedAt || tender.date;
  const updatedAt = tender.updatedAt;
  const closingDate = tender.tender?.tenderPeriod?.endDate;
  const status = tender.tender?.status || tender.status || "active";
  const submissionMethods = tender.tender?.submissionMethod || [];

  // Compute a simple quality score to mimic Vite UI; cap 100
  let dq = 70;
  if (closingDate) dq += 10;
  if (category) dq += 5;
  if (buyerName) dq += 5;
  if (tender.tender?.value?.amount) dq += 10;
  const dataQualityScore = Math.max(0, Math.min(100, dq));

  const daysUntilClose = getDaysUntilClose(closingDate);
  const isRed = daysUntilClose !== null && daysUntilClose <= 10 && daysUntilClose >= 0;
  const isOrange = daysUntilClose !== null && daysUntilClose > 10 && daysUntilClose <= 20;
  const isGreen = daysUntilClose !== null && daysUntilClose > 20;

  // Generate tender URL with description for better SEO (falls back to title if no description)
  const tenderUrl = createTenderUrlFromTitleAndDescription(title, description, tender.ocid);

  return (
    <Link
      href={tenderUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackTenderView(tender.ocid, 'search_results')}
    >
      <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer mb-3 ${
        isRed ? "bg-red-50/30" : isOrange ? "bg-orange-50/30" : isGreen ? "bg-green-50/30" : ""
      }`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {publishedAt && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" /> Advertised {fmtDate(publishedAt)}
                </Badge>
              )}
              {status && <Badge variant={status === "active" ? "default" : status === "planned" ? "secondary" : status === "complete" ? "outline" : "destructive"}>{status}</Badge>}
            </div>
          </div>

          {description && <p className="text-sm text-muted-foreground line-clamp-2">{toSentenceCase(description)}</p>}

          <div className="flex flex-wrap gap-2">
            {buyerName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{buyerName}</span>
              </div>
            )}
            {detailedCategory ? (
              <div className="flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs font-normal">
                  {detailedCategory}
                </Badge>
              </div>
            ) : category ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span className="capitalize">{category}</span>
              </div>
            ) : null}
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {publishedAt && (
              <>
                <span suppressHydrationWarning>Published {formatRelativeDate(publishedAt)}</span>
                {updatedAt && (() => {
                  const pub = new Date(publishedAt);
                  const upd = new Date(updatedAt);
                  if (upd.getTime() - pub.getTime() > 60 * 60 * 1000) {
                    return (
                      <>
                        <span className="opacity-60">•</span>
                        <span suppressHydrationWarning>Updated {formatRelativeDate(updatedAt)}</span>
                      </>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </div>

          {/* Verification Badge */}
          <div>
            <VerificationBadge status="synced" publisher="protenders.co.za" lastSeenAt={publishedAt} compact={true} />
          </div>

          {closingDate && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isRed ? "text-red-600 font-semibold" : isOrange ? "text-orange-600 font-medium" : isGreen ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{fmtDate(closingDate)}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span suppressHydrationWarning>({formatRelativeDate(closingDate)})</span>
            </div>
          )}

          {submissionMethods && submissionMethods.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {submissionMethods.map((method, idx) => (
                <Badge key={`${method}-${idx}`} variant="secondary" className="text-xs capitalize">
                  {method}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
