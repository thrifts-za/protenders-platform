"use client";

import { useEffect, useState } from "react";
import { TenderCard } from "@/components/TenderCard";

type NormalizedTender = {
  ocid: string;
  tender?: { title?: string; description?: string; tenderPeriod?: { endDate?: string } };
  buyer?: { name?: string };
  status?: string;
};

export function LiveTenders({ category }: { category: string }) {
  const [tenders, setTenders] = useState<NormalizedTender[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('categories', category);
        params.append('page', '1');
        params.append('pageSize', '10');
        const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        if (!cancelled) setTenders(json.data || []);
      } catch {
        if (!cancelled) setTenders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category]);

  if (loading) {
    return <div className="p-6 bg-card border rounded-lg text-muted-foreground">Loading live tenders…</div>;
  }

  if (!tenders || tenders.length === 0) {
    return (
      <div className="p-6 bg-card border rounded-lg text-muted-foreground">
        No live tenders found for this category right now. Try the search page to see more results.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {tenders.map((t: any) => (
        <TenderCard key={t.ocid} tender={t} />
      ))}
    </div>
  );
}

