"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Play,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface SyncState {
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastCursor?: string;
  lastSyncedDate?: string;
  notes?: string;
}

interface Job {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  note?: string;
  metadata?: string;
}

export default function ETLSyncPage() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const adminToken: string | null = session?.adminToken || null;
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [enrichLimit, setEnrichLimit] = useState<string>("300");
  const [enrichWindow, setEnrichWindow] = useState<string>("1");
  const [backfillYear, setBackfillYear] = useState("all-time");
  const [backfillLimit, setBackfillLimit] = useState("1000");
  const [progress, setProgress] = useState<{years?: any; generatedAt?: string} | null>(null);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds to reduce DB load
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError("");
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined;
      const [stateRes, jobsRes, progressRes] = await Promise.all([
        fetch("/api/admin/sync/state", { headers }),
        fetch("/api/admin/jobs?limit=10", { headers }),
        fetch("/api/admin/enrichment/progress", { headers }),
      ]);

      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setSyncState(stateData.state || stateData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.recentJobs || jobsData.jobs || []);
      }

      if (progressRes.ok) {
        const prog = await progressRes.json();
        setProgress(prog);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load sync data");
    } finally {
      setLoading(false);
    }
  };

  const triggerAction = async (action: string, payload: Record<string, unknown> = {}) => {
    setActionLoading(action);
    setError("");

    try {
      const endpoint = action.startsWith("jobs/")
        ? `/api/admin/${action}`
        : `/api/admin/jobs/${action}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to trigger ${action}`);
      }

      // Reload data immediately
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to trigger ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getHealthStatus = () => {
    if (!syncState?.lastSuccessAt) return { status: "unknown", color: "text-gray-500" };

    const lastSuccess = new Date(syncState.lastSuccessAt);
    const hoursAgo = (Date.now() - lastSuccess.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 24) {
      return { status: "healthy", color: "text-green-600" };
    } else if (hoursAgo < 48) {
      return { status: "warning", color: "text-yellow-600" };
    } else {
      return { status: "stale", color: "text-red-600" };
    }
  };

  const health = getHealthStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading sync data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">ETL Sync Management</h1>
        <p className="text-muted-foreground">
          Manage OCDS data synchronization and imports
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sync State Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>Current state of data synchronization</CardDescription>
            </div>
            <div className={`flex items-center gap-2 ${health.color}`}>
              {health.status === "healthy" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-semibold uppercase text-sm">{health.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Run</p>
              <p className="font-medium">
                {syncState?.lastRunAt
                  ? dayjs(syncState.lastRunAt).fromNow()
                  : "Never"}
              </p>
              {syncState?.lastRunAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {dayjs(syncState.lastRunAt).format("MMM D, YYYY HH:mm")}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Success</p>
              <p className="font-medium">
                {syncState?.lastSuccessAt
                  ? dayjs(syncState.lastSuccessAt).fromNow()
                  : "Never"}
              </p>
              {syncState?.lastSuccessAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {dayjs(syncState.lastSuccessAt).format("MMM D, YYYY HH:mm")}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Schedule</p>
              <p className="font-medium">Every 30 minutes (GitHub Actions)</p>
              <p className="text-xs text-muted-foreground mt-1">Incremental sync with enrichment. Vercel cron runs nightly as fallback.</p>
            </div>
          </div>

          {syncState?.notes && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>{syncState.notes}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Live OCDS Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Live OCDS API Sync
          </CardTitle>
          <CardDescription>
            Incremental sync from the official OCDS registry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => triggerAction("sync-now")}
              disabled={actionLoading === "sync-now"}
              className="w-full"
            >
              {actionLoading === "sync-now" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>

            <Button
              onClick={() => triggerAction("sync-today")}
              disabled={actionLoading === "sync-today"}
              variant="secondary"
              className="w-full"
            >
              {actionLoading === "sync-today" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Sync Today
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 w-full">
              <Select value={enrichLimit} onValueChange={setEnrichLimit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Enrich 10</SelectItem>
                  <SelectItem value="25">Enrich 25</SelectItem>
                  <SelectItem value="50">Enrich 50</SelectItem>
                  <SelectItem value="100">Enrich 100</SelectItem>
                  <SelectItem value="200">Enrich 200</SelectItem>
                  <SelectItem value="300">Enrich 300</SelectItem>
                  <SelectItem value="500">Enrich 500</SelectItem>
                  <SelectItem value="1000">Enrich 1000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={enrichWindow} onValueChange={setEnrichWindow}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today only</SelectItem>
                  <SelectItem value="3">Last 3 days</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            <Button
              onClick={() => triggerAction("enrich-today", { maxEnrichment: Number(enrichLimit), windowDays: Number(enrichWindow) })}
              disabled={actionLoading === "enrich-today"}
              variant="secondary"
              className="flex-1"
            >
              {actionLoading === "enrich-today" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Enrich Today
                </>
              )}
            </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => triggerAction("delta-sync")}
              disabled={actionLoading === "delta-sync"}
              variant="outline"
              className="w-full"
            >
              {actionLoading === "delta-sync" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Delta Sync
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mt-4">
            <p>• <strong>Sync Now:</strong> Full incremental sync from last checkpoint</p>
            <p>• <strong>Sync Today:</strong> Quick sync for today's releases only</p>
            <p>• <strong>Enrich Window:</strong> Sync + enrich tenders in selected window (cap controls max enrich attempts)</p>
            <p>• <strong>Delta Sync:</strong> Test mode - sync without database writes</p>
          </div>
        </CardContent>
      </Card>

      {/* Legacy Import Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Legacy JSONL Import
          </CardTitle>
          <CardDescription>
            Download and import archived OCDS data from OCP registry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => triggerAction("download", { year: selectedYear })}
              disabled={actionLoading === "download"}
              variant="secondary"
            >
              {actionLoading === "download" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download JSONL
                </>
              )}
            </Button>

            <Button
              onClick={() => triggerAction("import", { year: selectedYear })}
              disabled={actionLoading === "import"}
              variant="secondary"
            >
              {actionLoading === "import" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSONL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All-Time Enrichment Backfill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All-Time Enrichment Backfill
          </CardTitle>
          <CardDescription>
            Enrich historical tenders and persist all fields (province, contacts, briefing, documents)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {(['2024','2025','allTime'] as const).map((key) => {
              const row = (progress?.years || {})[key] || null;
              const percent = row?.percent ?? 0;
              const total = row?.total ?? 0;
              const unenriched = row?.unenriched ?? 0;
              return (
                <div key={key} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm">{key === 'allTime' ? 'All Time' : key}</div>
                    <div className="text-xs text-muted-foreground">{percent}%</div>
                  </div>
                  <div className="h-2 bg-muted rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {total > 0 ? (
                      <>
                        <span className="font-medium">{total - unenriched}</span> enriched of <span className="font-medium">{total}</span>
                        {unenriched > 0 ? <span> • {unenriched} remaining</span> : null}
                      </>
                    ) : (
                      <span>No data</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Range</label>
              <Select value={backfillYear} onValueChange={setBackfillYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Batch Size</label>
              <Select value={backfillLimit} onValueChange={setBackfillLimit}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => triggerAction("enrich-backfill", { year: backfillYear, limit: Number(backfillLimit) })}
              disabled={actionLoading === "enrich-backfill"}
              variant="secondary"
            >
              {actionLoading === "enrich-backfill" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Backfilling...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Run Backfill
                </>
              )}
            </Button>
            <Button
              onClick={() => triggerAction("enrichment/cancel")}
              disabled={actionLoading === "enrichment/cancel"}
              variant="outline"
            >
              {actionLoading === "enrichment/cancel" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Cancel Backfill
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mt-2">
            <p>• Runs within a 5-minute window; re-run to process remaining items.</p>
            <p>• Safely enriches only records missing fields; existing enrichment is preserved.</p>
          </div>
        </CardContent>
      </Card>

      {/* Database Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Tools
          </CardTitle>
          <CardDescription>
            Maintenance operations and optimizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => triggerAction("reindex")}
              disabled={actionLoading === "reindex"}
              variant="outline"
            >
              {actionLoading === "reindex" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reindexing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Reindex Database
                </>
              )}
            </Button>

            <Button
              onClick={() => triggerAction("aggregates")}
              disabled={actionLoading === "aggregates"}
              variant="outline"
            >
              {actionLoading === "aggregates" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Run Aggregates
                </>
              )}
            </Button>

            <Button
              onClick={() => triggerAction("features")}
              disabled={actionLoading === "features"}
              variant="outline"
            >
              {actionLoading === "features" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Computing...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Compute Features
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job History</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <CardDescription>Last 50 sync and import jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">Type</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                  <th className="text-left py-2 px-2 font-medium">Started</th>
                  <th className="text-left py-2 px-2 font-medium">Finished</th>
                  <th className="text-left py-2 px-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-xs uppercase">{job.type}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 px-2">
                        {dayjs(job.startedAt).format("MMM D, HH:mm")}
                      </td>
                      <td className="py-3 px-2">
                        {job.finishedAt
                          ? dayjs(job.finishedAt).format("MMM D, HH:mm")
                          : job.status === "RUNNING"
                          ? "Running..."
                          : "-"}
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground max-w-xs truncate">
                        {job.note || "-"}
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
