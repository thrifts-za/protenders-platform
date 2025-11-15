"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TenderCard } from "@/components/TenderCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tender } from "@/types/tender";

interface ValueFilteredTendersProps {
  minValue?: number;
  maxValue?: number;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  showStats?: boolean;
}

export function ValueFilteredTenders({
  minValue,
  maxValue,
  emptyIcon,
  emptyTitle = "No Tenders Found",
  emptyDescription = "No tenders match the current criteria.",
  emptyAction,
  showStats = false,
}: ValueFilteredTendersProps) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalValue: 0, avgValue: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadAndFilter() {
      setLoading(true);

      try {
        // Fetch all active tenders
        const params = new URLSearchParams({
          status: 'active',
          page: '1',
          pageSize: '200',
          sort: '-value',
        });

        const res = await fetch(`/api/search?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to load tenders');

        const json = await res.json();
        const allTenders = json.data || json.results || [];

        // Filter by value range client-side
        const filtered = allTenders.filter((tender: Tender) => {
          const value = tender.tender?.value?.amount || (tender as any).value?.amount || 0;

          if (minValue !== undefined && maxValue !== undefined) {
            return value >= minValue && value <= maxValue;
          } else if (minValue !== undefined) {
            return value >= minValue;
          } else if (maxValue !== undefined) {
            return value <= maxValue;
          }
          return true;
        });

        // Calculate stats
        const totalValue = filtered.reduce((sum: number, t: Tender) => {
          const value = t.tender?.value?.amount || (t as any).value?.amount || 0;
          return sum + value;
        }, 0);

        if (!cancelled) {
          setTenders(filtered);
          setStats({
            total: filtered.length,
            totalValue,
            avgValue: filtered.length > 0 ? totalValue / filtered.length : 0,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setTenders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAndFilter();

    return () => {
      cancelled = true;
    };
  }, [minValue, maxValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
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
    <>
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-dashed">
            <div className="text-sm text-muted-foreground mb-1">Total Tenders</div>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </Card>
          <Card className="p-4 border-dashed">
            <div className="text-sm text-muted-foreground mb-1">Total Value</div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(stats.totalValue)}
            </div>
          </Card>
          <Card className="p-4 border-dashed">
            <div className="text-sm text-muted-foreground mb-1">Average Value</div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(stats.avgValue)}
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {tenders.map((tender) => (
          <TenderCard key={tender.ocid} tender={tender} />
        ))}
      </div>
    </>
  );
}
