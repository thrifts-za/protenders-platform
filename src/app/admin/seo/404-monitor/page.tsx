"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight, TrendingUp, Link as LinkIcon } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Error404 {
  id: string;
  path: string;
  hitCount: number;
  referer: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Suggestion {
  toPath: string;
  title: string;
}

export default function Monitor404Page() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const adminToken: string | null = session?.adminToken || null;

  const [errors, setErrors] = useState<Error404[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<Error404 | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [redirectDialog, setRedirectDialog] = useState(false);
  const [newRedirect, setNewRedirect] = useState({
    fromPath: "",
    toPath: "",
  });

  useEffect(() => {
    load404Errors();
  }, []);

  const load404Errors = async () => {
    try {
      const res = await fetch("/api/admin/404-errors", {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
      }
    } catch (error) {
      console.error("Failed to load 404 errors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRedirect = async (error: Error404) => {
    // Get suggestions for this path
    try {
      const res = await fetch(`/api/admin/404-errors/${error.id}/suggestions`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Failed to get suggestions:", err);
      setSuggestions([]);
    }

    setSelectedError(error);
    setNewRedirect({ fromPath: error.path, toPath: "" });
    setRedirectDialog(true);
  };

  const saveRedirect = async () => {
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          ...newRedirect,
          statusCode: 301,
          isActive: true,
          preserveQuery: true,
          notes: `Created from 404 monitor (${selectedError?.hitCount} hits)`,
        }),
      });

      if (res.ok) {
        alert("Redirect created successfully!");
        setRedirectDialog(false);
        // Optionally reload errors to update the list
        await load404Errors();
      } else {
        const error = await res.text();
        alert(`Failed to create redirect: ${error}`);
      }
    } catch (error) {
      console.error("Failed to create redirect:", error);
      alert("Failed to create redirect");
    }
  };

  const handleDelete404 = async (id: string) => {
    if (!confirm("Delete this 404 log entry?")) return;

    try {
      const res = await fetch(`/api/admin/404-errors/${id}`, {
        method: "DELETE",
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });

      if (res.ok) {
        await load404Errors();
      }
    } catch (error) {
      console.error("Failed to delete 404:", error);
    }
  };

  const totalHits = errors.reduce((sum, e) => sum + e.hitCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading 404 errors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">404 Error Monitor</h1>
        <p className="text-muted-foreground mt-2">
          Track broken links and create redirects to improve user experience
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique 404s</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hits</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalHits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hits per 404</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errors.length > 0 ? Math.round(totalHits / errors.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 404 Table */}
      <Card>
        <CardHeader>
          <CardTitle>404 Errors</CardTitle>
          <CardDescription>
            Most frequent 404 errors. Create redirects to fix broken links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead className="w-[100px] text-right">Hits</TableHead>
                <TableHead className="w-[140px]">First Seen</TableHead>
                <TableHead className="w-[140px]">Last Seen</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No 404 errors logged yet. Great job!
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell className="font-mono text-sm max-w-[400px] truncate">
                      {error.path}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={error.hitCount > 10 ? "destructive" : "secondary"}>
                        {error.hitCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dayjs(error.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dayjs(error.updatedAt).fromNow()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCreateRedirect(error)}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Create Redirect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete404(error.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Redirect Dialog */}
      <Dialog open={redirectDialog} onOpenChange={setRedirectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Redirect for 404</DialogTitle>
            <DialogDescription>
              {selectedError && (
                <>
                  This path has been hit <strong>{selectedError.hitCount} times</strong>.
                  Create a redirect to improve user experience.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From Path</Label>
              <Input value={newRedirect.fromPath} disabled className="font-mono text-sm" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="toPath">To Path *</Label>
              <Input
                id="toPath"
                placeholder="/new-page"
                value={newRedirect.toPath}
                onChange={(e) => setNewRedirect({ ...newRedirect, toPath: e.target.value })}
              />
            </div>

            {suggestions.length > 0 && (
              <div className="grid gap-2">
                <Label>Suggested Destinations</Label>
                <div className="space-y-2">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setNewRedirect({ ...newRedirect, toPath: suggestion.toPath })}
                      className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
                    >
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {suggestion.toPath}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRedirectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveRedirect} disabled={!newRedirect.toPath}>
              Create Redirect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
