"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

interface SearchLog {
  id: string;
  keywords?: string;
  filters?: string;
  duration: number;
  dataSource: string;
  resultsCount: number;
  createdAt: string;
}

interface ErrorLog {
  id: string;
  path: string;
  method: string;
  statusCode: number;
  message: string;
  stack?: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const adminToken: string | null = session?.adminToken || null;
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined;
      const [searchRes, errorRes] = await Promise.all([
        fetch("/api/admin/analytics/searches?limit=100", { headers }),
        fetch("/api/admin/analytics/errors?limit=100", { headers }),
      ]);

      if (searchRes.ok) {
        const data = await searchRes.json();
        const arr = Array.isArray(data) ? data : (data.recentSearches || data.searches || []);
        setSearchLogs(Array.isArray(arr) ? arr : []);
      }

      if (errorRes.ok) {
        const data = await errorRes.json();
        const arr = Array.isArray(data) ? data : (data.recentErrors || data.errors || []);
        setErrorLogs(Array.isArray(arr) ? arr : []);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportSearchLogs = () => {
    const csv = [
      ["Keywords", "Source", "Results", "Duration (ms)", "Date"],
      ...searchLogs.map((log) => [
        log.keywords || "",
        log.dataSource,
        log.resultsCount,
        log.duration,
        dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-logs-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
  };

  const exportErrorLogs = () => {
    const csv = [
      ["Status", "Method", "Path", "Message", "Date"],
      ...errorLogs.map((log) => [
        log.statusCode,
        log.method,
        log.path,
        log.message,
        dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-logs-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Search logs, error tracking, and system diagnostics
        </p>
      </div>

      {/* Search Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Logs</CardTitle>
              <CardDescription>Last 100 search requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportSearchLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">Keywords</th>
                  <th className="text-left py-2 px-2 font-medium">Source</th>
                  <th className="text-right py-2 px-2 font-medium">Results</th>
                  <th className="text-right py-2 px-2 font-medium">Duration</th>
                  <th className="text-left py-2 px-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {searchLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No search logs found
                    </td>
                  </tr>
                ) : (
                  searchLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 max-w-xs truncate">
                        {log.keywords || <span className="text-muted-foreground italic">No keywords</span>}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={log.dataSource === "local-db" ? "default" : "secondary"}>
                          {log.dataSource}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        {log.resultsCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        {log.duration}ms
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">
                        {dayjs(log.createdAt).format("MMM D, HH:mm:ss")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>Last 100 API errors</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportErrorLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                  <th className="text-left py-2 px-2 font-medium">Method</th>
                  <th className="text-left py-2 px-2 font-medium">Path</th>
                  <th className="text-left py-2 px-2 font-medium">Message</th>
                  <th className="text-left py-2 px-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {errorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No errors found - system is healthy!
                    </td>
                  </tr>
                ) : (
                  errorLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <Badge variant="destructive">{log.statusCode}</Badge>
                      </td>
                      <td className="py-3 px-2 font-mono text-xs">
                        {log.method}
                      </td>
                      <td className="py-3 px-2 font-mono text-xs max-w-xs truncate">
                        {log.path}
                      </td>
                      <td className="py-3 px-2 max-w-sm truncate">
                        {log.message}
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">
                        {dayjs(log.createdAt).format("MMM D, HH:mm:ss")}
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
