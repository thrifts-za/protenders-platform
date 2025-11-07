"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Summary = { supplierName: string; stats?: { wins6m?: number; winsPrev6m?: number; wins24m?: number; topBuyers?: string[]; lastComputed?: string } | null; recentTenders?: any[] };
type Metrics = { performance: { wins6m: number; winsPrev6m: number; wins24m: number; winRate6m: number }; financial: { totalAwardValue: number; averageAwardValue: number; totalAwards: number }; activity: { awardsByYear: Record<string, number>; categoriesServed: number; buyersWorkedWith: number; topBuyers: string[] } } | null;

export default function SupplierDetail() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [name]);

  async function load() {
    setLoading(true);
    const [sRes, mRes] = await Promise.all([
      fetch(`/api/suppliers/${encodeURIComponent(name)}/summary`),
      fetch(`/api/suppliers/${encodeURIComponent(name)}/metrics`),
    ]);
    if (sRes.ok) setSummary(await sRes.json());
    if (mRes.ok) setMetrics(await mRes.json());
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supplier: {name}</h1>
        <p className="text-muted-foreground">Awards and buyer relationships</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle>Wins (6m)</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.stats?.wins6m ?? '-'}</CardContent></Card>
            <Card><CardHeader><CardTitle>Wins (24m)</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.stats?.wins24m ?? '-'}</CardContent></Card>
            <Card><CardHeader><CardTitle>Top Buyers</CardTitle></CardHeader><CardContent className="text-sm">{(summary?.stats?.topBuyers || []).slice(0,5).join(', ') || '-'}</CardContent></Card>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Buyer Relationships</CardTitle>
              <CardDescription>Buyers awarding to this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {(metrics?.activity.topBuyers || []).map((buyer) => (
                  <li key={buyer} className="flex justify-between border rounded p-2">
                    <span>{buyer}</span>
                    <span className="font-mono">●</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Awards by Year</CardTitle>
              <CardDescription>Distribution of awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics?.activity.awardsByYear || {}).sort(([a],[b]) => a.localeCompare(b)).map(([year, count]) => {
                  const max = Math.max(1, ...Object.values(metrics?.activity.awardsByYear || {}));
                  const width = Math.round((Number(count) / max) * 100);
                  return (
                    <div key={year} className="flex items-center gap-2">
                      <div className="w-16 text-xs text-muted-foreground">{year}</div>
                      <div className="flex-1 bg-muted rounded h-3">
                        <div className="bg-primary h-3 rounded" style={{ width: `${width}%` }} />
                      </div>
                      <div className="w-10 text-right font-mono text-xs">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
