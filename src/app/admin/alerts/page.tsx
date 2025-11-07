"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Bell } from "lucide-react";

type LogRow = {
  id: string;
  user: string;
  savedSearchId: string;
  savedSearchName: string;
  alertFrequency: string;
  tendersFound: number;
  emailSent: boolean;
  error?: string | null;
  createdAt: string;
};

export default function AdminAlertsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/alerts/logs?limit=100');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runAlerts() {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/alerts/run', { method: 'POST' });
      if (res.ok) {
        await load();
        alert('Alerts run completed');
      } else {
        alert('Failed to run alerts');
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alerts Runner</h1>
        <p className="text-muted-foreground">Manually trigger and monitor saved search alert runs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Run Alerts</CardTitle>
          <CardDescription>Execute alert emails for due saved searches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runAlerts} disabled={running}>
              {running ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Running...</> : <><Bell className="h-4 w-4 mr-2" />Run Alerts Now</>}
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4 mr-2" />Refresh Logs</Button>
          </div>

          <Separator className="my-4" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">When</th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Search</th>
                  <th className="text-left py-2 px-2">Frequency</th>
                  <th className="text-left py-2 px-2">Results</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No alert runs yet</td></tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-3 px-2 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-2">{l.user}</td>
                      <td className="py-3 px-2">{l.savedSearchName}</td>
                      <td className="py-3 px-2">{l.alertFrequency}</td>
                      <td className="py-3 px-2">{l.tendersFound}</td>
                      <td className="py-3 px-2 text-xs">{l.emailSent ? 'SENT' : (l.error ? 'ERROR' : 'PENDING')}</td>
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

