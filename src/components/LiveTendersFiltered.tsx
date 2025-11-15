"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TenderCard } from "@/components/TenderCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tender } from "@/types/tender";

interface LiveTendersFilteredProps {
  filters: Record<string, string | number>;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function LiveTendersFiltered({
  filters,
  emptyIcon,
  emptyTitle = "No Tenders Found",
  emptyDescription = "No tenders match the current criteria.",
  emptyAction,
}: LiveTendersFilteredProps) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTenders() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value.toString());
        });

        const res = await fetch(`/api/search?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to load tenders');
        }

        const json = await res.json();
        if (!cancelled) {
          setTenders(json.data || json.results || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tenders');
          setTenders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTenders();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{error}</p>
      </Card>
    );
  }

  if (tenders.length === 0) {
    return (
      <Card className="p-12 text-center">
        {emptyIcon && <div className="mx-auto mb-4">{emptyIcon}</div>}
        <h3 className="text-xl font-semibold mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground mb-6">{emptyDescription}</p>
        {emptyAction}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tenders.map((tender) => (
        <TenderCard key={tender.ocid} tender={tender} />
      ))}
    </div>
  );
}
