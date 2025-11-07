"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Metrics = {
  buyerName: string;
  stats: any;
  activity: { totalTenders: number; tenders6m: number; tenders12m: number; averageTendersPerMonth: number };
  categories: { total: number; topCategories: { category: string; count: number }[] };
  status: Record<string, number>;
  recentTenders: { ocid: string; title: string; category?: string | null; status?: string | null; publishedDate?: string | null }[];
};

export default function BuyerDetail() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [name]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/buyers/${encodeURIComponent(name)}/metrics`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Buyer: {name}</h1>
        <p className="text-muted-foreground">Overview and recent tenders</p>
      </div>

      {loading || !data ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle>Total Tenders</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data.activity.totalTenders}</CardContent></Card>
            <Card><CardHeader><CardTitle>Last 6 months</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data.activity.tenders6m}</CardContent></Card>
            <Card><CardHeader><CardTitle>Avg / month</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data.activity.averageTendersPerMonth}</CardContent></Card>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>Most frequent categories for this buyer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const max = Math.max(1, ...data.categories.topCategories.map((c) => c.count));
                  return data.categories.topCategories.map((c) => {
                    const width = Math.round((c.count / max) * 100);
                    return (
                      <div key={c.category} className="flex items-center gap-2">
                        <div className="w-40 truncate text-xs" title={c.category}>{c.category}</div>
                        <div className="flex-1 bg-muted rounded h-3">
                          <div className="bg-primary h-3 rounded" style={{ width: `${width}%` }} />
                        </div>
                        <div className="w-10 text-right font-mono text-xs">{c.count}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tenders</CardTitle>
              <CardDescription>Last {data.recentTenders.length} tenders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-2">Title</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Published</th>
                      <th className="text-left py-2 px-2">OCID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTenders.map((t) => (
                      <tr key={t.ocid} className="border-b last:border-0">
                        <td className="py-3 px-2 max-w-md truncate" title={t.title}><a className="underline underline-offset-2" href={`/admin/tenders/${encodeURIComponent(t.ocid)}`}>{t.title}</a></td>
                        <td className="py-3 px-2">{t.category || '-'}</td>
                        <td className="py-3 px-2">{t.status || '-'}</td>
                        <td className="py-3 px-2 text-xs">{t.publishedDate ? new Date(t.publishedDate).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-2 font-mono text-xs">{t.ocid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
