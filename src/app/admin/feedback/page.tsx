"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  Mail,
  FileText,
  Calendar,
  Tag,
  Lightbulb,
  Bug
} from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span title="Pending"><Clock className="h-4 w-4 text-blue-500" /></span>;
      case 'reviewed':
        return <span title="Reviewed"><Eye className="h-4 w-4 text-yellow-500" /></span>;
      case 'resolved':
        return <span title="Resolved"><CheckCircle className="h-4 w-4 text-green-500" /></span>;
      case 'dismissed':
        return <span title="Dismissed"><XCircle className="h-4 w-4 text-red-500" /></span>;
      default:
        return <span title={status}><AlertCircle className="h-4 w-4 text-gray-400" /></span>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return <span title="Critical"><Zap className="h-4 w-4 text-red-600" /></span>;
      case 'high':
        return <span title="High"><AlertTriangle className="h-4 w-4 text-orange-500" /></span>;
      case 'medium':
        return <span title="Medium"><TrendingUp className="h-4 w-4 text-yellow-500" /></span>;
      case 'low':
        return <span title="Low"><AlertCircle className="h-4 w-4 text-gray-500" /></span>;
      default:
        return <span title={priority}><AlertCircle className="h-4 w-4 text-gray-400" /></span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const openDetails = (feedback: FeedbackRow) => {
    setSelectedFeedback(feedback);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Feedback</h1>
          <p className="text-muted-foreground">Manage user feedback and feature requests</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Feedback</p>
          </div>
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Feedback Management
          </CardTitle>
          <CardDescription>View and respond to user feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Search title..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2 capitalize">
                      {getStatusIcon(s)}
                      {s}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Title</TableHead>
                  <TableHead className="w-[60px] text-center">Type</TableHead>
                  <TableHead className="w-[60px] text-center">Priority</TableHead>
                  <TableHead className="w-[180px]">Email</TableHead>
                  <TableHead className="w-[60px] text-center">Status</TableHead>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading feedback...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate" title={r.title}>
                            {r.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={r.description}>
                            {r.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span title={r.type}>{getTypeIcon(r.type)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getPriorityIcon(r.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px]">
                          <p className="text-xs truncate" title={r.email || '-'}>
                            {r.email || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusIcon(r.status)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {dayjs(r.createdAt).fromNow()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(r)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Page {page} of {totalPages} · {total.toLocaleString()} total</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Complete information about this feedback submission
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* Feedback Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Feedback Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Title</p>
                      <p className="font-medium">{selectedFeedback.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedFeedback.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Tag className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(selectedFeedback.type)}
                        <Badge variant="outline" className="capitalize">{selectedFeedback.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-0.5">{getPriorityIcon(selectedFeedback.priority)}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <Badge
                        variant={
                          selectedFeedback.priority === 'critical' || selectedFeedback.priority === 'high'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {selectedFeedback.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-0.5">{getStatusIcon(selectedFeedback.status)}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge
                        variant={
                          selectedFeedback.status === 'resolved'
                            ? 'default'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {selectedFeedback.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact & Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedFeedback.email && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="font-medium break-all">{selectedFeedback.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                      <p className="font-medium">{dayjs(selectedFeedback.createdAt).format('MMM D, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(selectedFeedback.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Update Status</p>
                  <Select
                    value={selectedFeedback.status}
                    onValueChange={(value) => {
                      updateStatus(selectedFeedback.id, value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2 capitalize">
                            {getStatusIcon(s)}
                            {s}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
