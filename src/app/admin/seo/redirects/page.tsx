"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Edit2, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  preserveQuery: boolean;
  hitCount: number;
  lastUsedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export default function RedirectManagerPage() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const adminToken: string | null = session?.adminToken || null;

  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRedirect, setCurrentRedirect] = useState<Partial<Redirect>>({
    fromPath: "",
    toPath: "",
    statusCode: 301,
    isActive: true,
    preserveQuery: true,
    notes: "",
  });
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      const res = await fetch("/api/admin/redirects", {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setRedirects(data.redirects || []);
      }
    } catch (error) {
      console.error("Failed to load redirects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const url = isEditMode
        ? `/api/admin/redirects/${currentRedirect.id}`
        : "/api/admin/redirects";

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify(currentRedirect),
      });

      if (res.ok) {
        await loadRedirects();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await res.text();
        alert(`Failed to save redirect: ${error}`);
      }
    } catch (error) {
      console.error("Failed to save redirect:", error);
      alert("Failed to save redirect");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;

    try {
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: "DELETE",
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });

      if (res.ok) {
        await loadRedirects();
      }
    } catch (error) {
      console.error("Failed to delete redirect:", error);
      alert("Failed to delete redirect");
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setCurrentRedirect(redirect);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentRedirect({
      fromPath: "",
      toPath: "",
      statusCode: 301,
      isActive: true,
      preserveQuery: true,
      notes: "",
    });
    setIsEditMode(false);
  };

  const filteredRedirects = redirects.filter((r) => {
    if (filter === "active") return r.isActive;
    if (filter === "inactive") return !r.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading redirects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Redirect Manager</h1>
        <p className="text-muted-foreground mt-2">
          Manage 301/302 redirects for SEO and link preservation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redirects</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redirects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {redirects.filter((r) => r.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hits</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {redirects.reduce((sum, r) => sum + r.hitCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Redirects</CardTitle>
              <CardDescription>
                Configure URL redirects to preserve SEO value and improve user experience
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Redirects</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Redirect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Hits</TableHead>
                <TableHead className="w-[140px]">Last Used</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No redirects found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRedirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-mono text-sm">{redirect.fromPath}</TableCell>
                    <TableCell className="font-mono text-sm">{redirect.toPath}</TableCell>
                    <TableCell>
                      <Badge variant={redirect.statusCode === 301 ? "default" : "secondary"}>
                        {redirect.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={redirect.isActive ? "default" : "secondary"}>
                        {redirect.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{redirect.hitCount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {redirect.lastUsedAt ? dayjs(redirect.lastUsedAt).fromNow() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(redirect)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(redirect.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Redirect" : "Create New Redirect"}</DialogTitle>
            <DialogDescription>
              Configure a URL redirect. 301 for permanent, 302 for temporary.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fromPath">From Path *</Label>
              <Input
                id="fromPath"
                placeholder="/old-page"
                value={currentRedirect.fromPath}
                onChange={(e) =>
                  setCurrentRedirect({ ...currentRedirect, fromPath: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                The path to redirect from (e.g., /old-page, /removed-content)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="toPath">To Path *</Label>
              <Input
                id="toPath"
                placeholder="/new-page"
                value={currentRedirect.toPath}
                onChange={(e) =>
                  setCurrentRedirect({ ...currentRedirect, toPath: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                The destination path or full URL
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="statusCode">Redirect Type</Label>
                <Select
                  value={String(currentRedirect.statusCode)}
                  onValueChange={(value) =>
                    setCurrentRedirect({ ...currentRedirect, statusCode: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="301">301 Permanent</SelectItem>
                    <SelectItem value="302">302 Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 pt-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={currentRedirect.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentRedirect({ ...currentRedirect, isActive: checked as boolean })
                    }
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal">
                    Active
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveQuery"
                    checked={currentRedirect.preserveQuery}
                    onCheckedChange={(checked) =>
                      setCurrentRedirect({ ...currentRedirect, preserveQuery: checked as boolean })
                    }
                  />
                  <Label htmlFor="preserveQuery" className="text-sm font-normal">
                    Preserve query params
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Why this redirect was created..."
                value={currentRedirect.notes || ""}
                onChange={(e) =>
                  setCurrentRedirect({ ...currentRedirect, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {isEditMode ? "Update" : "Create"} Redirect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
