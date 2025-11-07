"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, RefreshCw } from "lucide-react";

type AuditRow = {
  id: string;
  user: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  createdAt: string;
  metadata?: any;
};

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit');
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setRows((json.data || []) as AuditRow[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  const filtered = rows.filter((r) => {
    const hay = `${r.user} ${r.action} ${r.entity ?? ''} ${r.entityId ?? ''}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">Track admin actions and system changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Audit Trail
          </CardTitle>
          <CardDescription>View audit logs and system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Filter logs..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          </div>
          <Separator className="my-3" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">When</th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Action</th>
                  <th className="text-left py-2 px-2">Entity</th>
                  <th className="text-left py-2 px-2">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading logs...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="py-8 text-center text-red-600">{error}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No audit logs</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="py-3 px-2 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-2">{r.user}</td>
                      <td className="py-3 px-2">{r.action}</td>
                      <td className="py-3 px-2">
                        <div>{r.entity || '-'}</div>
                        {r.entityId ? <div className="text-xs text-muted-foreground">{r.entityId}</div> : null}
                      </td>
                      <td className="py-3 px-2 text-xs max-w-md truncate" title={r.metadata ? JSON.stringify(r.metadata) : ''}>
                        {r.metadata ? JSON.stringify(r.metadata) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
