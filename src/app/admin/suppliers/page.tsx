"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Users, RefreshCw, Search } from "lucide-react";

type SupplierRow = {
  name: string | null;
  awardCount: number;
  latestAwardAt?: string | null;
  firstAwardAt?: string | null;
};

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [search, setSearch] = useState("");
  const [minAwards, setMinAwards] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("awardCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, minAwards, sortBy, sortOrder]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (minAwards !== "" && !isNaN(Number(minAwards))) params.set("minAwards", String(minAwards));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return params.toString();
  };

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suppliers?${buildQuery()}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setSuppliers(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (e: any) {
      setError(e.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  const resetFilters = () => {
    setSearch("");
    setMinAwards("");
    setSortBy("awardCount");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
        <p className="text-muted-foreground">Manage supplier profiles and award statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Supplier Directory
          </CardTitle>
          <CardDescription>View suppliers with award metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <div className="md:col-span-2 flex gap-2">
              <Input placeholder="Search supplier name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              <Button variant="outline" onClick={loadData} title="Search"><Search className="h-4 w-4" /></Button>
            </div>
            <div>
              <Input type="number" min={0} placeholder="Min awards" value={minAwards as any} onChange={(e) => { const v = e.target.value; setMinAwards(v === '' ? '' : Number(v)); setPage(1); }} />
            </div>
            <div>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awardCount">Award Count</SelectItem>
                  <SelectItem value="latestAward">Latest Award</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as any); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Order" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={resetFilters}><RefreshCw className="h-4 w-4 mr-2" />Reset</Button>
          </div>

          <Separator className="my-3" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Supplier</th>
                  <th className="text-left py-2 px-2">Award Count</th>
                  <th className="text-left py-2 px-2">First Award</th>
                  <th className="text-left py-2 px-2">Latest Award</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Loading suppliers...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="py-8 text-center text-red-600">{error}</td></tr>
                ) : suppliers.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No suppliers found</td></tr>
                ) : (
                  suppliers.map((s, idx) => (
                    <tr key={(s.name || 'unknown') + idx} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <a className="underline underline-offset-2" href={`/admin/suppliers/${encodeURIComponent(s.name || '')}`}>{s.name || '-'}</a>
                      </td>
                      <td className="py-3 px-2 font-mono">{s.awardCount.toLocaleString()}</td>
                      <td className="py-3 px-2 text-xs">{s.firstAwardAt ? new Date(s.firstAwardAt).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-2 text-xs">{s.latestAwardAt ? new Date(s.latestAwardAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Page {page} of {totalPages} · {total.toLocaleString()} results</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
