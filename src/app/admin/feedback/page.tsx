"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, RefreshCw, Save } from "lucide-react";

type FeedbackRow = {
  id: string;
  type: string;
  title: string;
  description: string;
  email?: string | null;
  priority: string;
  status: string;
  createdAt: string;
};

const statusOptions = ["pending", "reviewed", "resolved", "dismissed"] as const;

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, q]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status && status !== 'all') params.set("status", status);
    // Simple search over title in-memory post-fetch for now
    return params.toString();
  };

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback?${buildQuery()}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      const data: FeedbackRow[] = json.data || [];
      const filtered = q ? data.filter((r) => (r.title || '').toLowerCase().includes(q.toLowerCase())) : data;
      setRows(filtered);
      setTotal(json.pagination?.total || filtered.length);
    } catch (e: any) {
      setError(e.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Feedback</h1>
        <p className="text-muted-foreground">Manage user feedback and feature requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Feedback Management
          </CardTitle>
          <CardDescription>View and respond to user feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Input placeholder="Search title..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            </div>
            <div>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
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
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Priority</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Loading feedback...</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="py-8 text-center text-red-600">{error}</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No feedback found</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="py-3 px-2 max-w-md">
                        <div className="font-medium truncate" title={r.title}>{r.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{r.description}</div>
                      </td>
                      <td className="py-3 px-2">{r.type}</td>
                      <td className="py-3 px-2">
                        <Badge variant={r.priority === 'high' || r.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {r.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">{r.email || '-'}</td>
                      <td className="py-3 px-2">
                        <Badge variant={r.status === 'pending' ? 'secondary' : 'default'}>{r.status}</Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Select defaultValue={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Set status" /></SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => updateStatus(r.id, r.status)} title="Reapply status"><Save className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Page {page} of {totalPages} · {total.toLocaleString()} total</div>
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
