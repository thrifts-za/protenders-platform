"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, MapPin, Calendar, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface RelatedTender {
  id: string;
  ocid: string;
  slug: string | null;
  tenderDisplayTitle: string | null;
  buyerName: string | null;
  mainCategory: string | null;
  province: string | null;
  closingAt: Date | null;
  similarityScore: number;
  matchReason: string;
}

interface RelatedTendersProps {
  tenderId: string;
  limit?: number;
}

export default function RelatedTenders({ tenderId, limit = 6 }: RelatedTendersProps) {
  const [relatedTenders, setRelatedTenders] = useState<RelatedTender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedTenders();
  }, [tenderId]);

  const loadRelatedTenders = async () => {
    try {
      const res = await fetch(`/api/tenders/${tenderId}/related?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setRelatedTenders(data.relatedTenders || []);
      }
    } catch (error) {
      console.error("Failed to load related tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Related Tenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-primary border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedTenders.length === 0) {
    return null; // Don't show anything if no related tenders
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Related Tenders
        </CardTitle>
        <CardDescription>
          Tenders you might be interested in based on category, location, and keywords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedTenders.map((tender) => (
            <Link
              key={tender.id}
              href={`/tenders/${tender.slug || tender.ocid}`}
              className="block group"
            >
              <div className="border rounded-lg p-4 hover:border-primary hover:bg-accent/50 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Title */}
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {tender.tenderDisplayTitle || "Untitled Tender"}
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {tender.buyerName && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">{tender.buyerName}</span>
                        </div>
                      )}

                      {tender.province && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{tender.province}</span>
                        </div>
                      )}

                      {tender.closingAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Closes {dayjs(tender.closingAt).fromNow()}</span>
                        </div>
                      )}
                    </div>

                    {/* Match info */}
                    <div className="flex items-center gap-2">
                      {tender.mainCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {tender.mainCategory}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {tender.matchReason}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 pt-1">
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
