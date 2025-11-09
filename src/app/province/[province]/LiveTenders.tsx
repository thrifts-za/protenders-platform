"use client";

import { useEffect, useState } from "react";
import { TenderCard } from "@/components/TenderCard";

export function LiveTenders({ province }: { province: string }) {
  const [tenders, setTenders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('province', province);
        params.append('page', '1');
        params.append('pageSize', '10');
        params.append('sort', 'latest');
        const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
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
  }, [province]);

  if (loading) return <div className="p-6 bg-card border rounded-lg text-muted-foreground">Loading live tenders…</div>;
  if (!tenders || tenders.length === 0) return <div className="p-6 bg-card border rounded-lg text-muted-foreground">No live tenders found right now. Try the search page for more results.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {tenders.map((t: any) => (
        <TenderCard key={t.ocid} tender={t} />
      ))}
    </div>
  );
}

