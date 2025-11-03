"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MetricCard } from "@/components/admin/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Database,
  Search,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";

interface Metrics {
  totalReleases: number;
  uniqueOcids: number;
  totalSearches: number;
  searchResults: number;
  dataSourceRatio: {
    localDb: number;
    liveApi: number;
  };
  databaseSize: string;
  lastImport?: string;
  nextCronRun: string;
}

interface RecentJob {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const adminToken: string | null = session?.adminToken || null;
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [metricsRes, jobsRes] = await Promise.all([
        fetch("/api/admin/metrics", { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined }),
        fetch("/api/admin/jobs?limit=5", { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || data);
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setRecentJobs(data.jobs || data);
      }
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system metrics and recent activity
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Releases"
          value={metrics?.totalReleases?.toLocaleString() || "0"}
          icon={FileText}
          description="All OCDS releases in database"
        />
        <MetricCard
          title="Unique Tenders"
          value={metrics?.uniqueOcids?.toLocaleString() || "0"}
          icon={Database}
          description="Distinct OCIDs"
        />
        <MetricCard
          title="Total Searches"
          value={metrics?.totalSearches?.toLocaleString() || "0"}
          icon={Search}
          description="User search queries"
        />
        <MetricCard
          title="Search Results"
          value={metrics?.searchResults?.toLocaleString() || "0"}
          icon={TrendingUp}
          description="Total results returned"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Data Source Ratio</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Local DB</span>
                <span className="text-sm font-bold">{metrics?.dataSourceRatio?.localDb || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${metrics?.dataSourceRatio?.localDb || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Live API</span>
                <span className="text-sm font-bold">{metrics?.dataSourceRatio?.liveApi || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Database Size</p>
            </div>
            <p className="text-2xl font-bold">{metrics?.databaseSize || "0 MB"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Last Import</p>
            </div>
            <p className="text-sm font-bold">
              {metrics?.lastImport
                ? dayjs(metrics.lastImport).fromNow()
                : "Never"}
            </p>
            {metrics?.lastImport && (
              <p className="text-xs text-muted-foreground mt-1">
                {dayjs(metrics.lastImport).format("MMM D, YYYY HH:mm")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Next Cron Run</p>
            </div>
            <p className="text-sm font-bold">
              {metrics?.nextCronRun || "03:00 SAST"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Daily automatic sync</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Last 5 sync and import operations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent jobs
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm uppercase">{job.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(job.startedAt).format("MMM D, YYYY HH:mm")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900">System Health</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800">
            All systems operational. Last sync completed successfully.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
