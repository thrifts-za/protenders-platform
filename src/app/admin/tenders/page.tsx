"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, RefreshCw, Search, Pencil } from "lucide-react";

type Tender = {
  id: string;
  ocid: string;
  tenderTitle: string | null;
  tenderDescription: string | null;
  buyerName: string | null;
  mainCategory: string | null;
  status: string | null;
  publishedAt: string | null;
  closingAt: string | null;
  province: string | null;
  tenderType: string | null;
  contactEmail: string | null;
  contactPerson: string | null;
  updatedAt: string | null;
};

export default function TendersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState("");
  const [buyer, setBuyer] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Edit dialog state
  const [open, setOpen] = useState(false);
  const [editingOcid, setEditingOcid] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    tenderTitle: '',
    contactPerson: '',
    contactEmail: '',
    briefingDate: '',
    briefingTime: '',
    briefingVenue: '',
    briefingMeetingLink: '',
    specialConditions: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, category, buyer, search, fromDate, toDate, sortBy, sortOrder]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status && status !== 'all') params.set("status", status);
    if (category) params.set("category", category);
    if (buyer) params.set("buyer", buyer);
    if (search) params.set("search", search);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return params.toString();
  };

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tenders?${buildQuery()}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setTenders(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (e: any) {
      setError(e.message || "Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }

  async function openEdit(ocid: string) {
    setEditingOcid(ocid);
    setOpen(true);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/tenders/${ocid}`);
      const json = await res.json();
      setEditForm({
        tenderTitle: json.tenderTitle || '',
        contactPerson: json.contactPerson || '',
        contactEmail: json.contactEmail || '',
        briefingDate: json.briefingDate || '',
        briefingTime: json.briefingTime || '',
        briefingVenue: json.briefingVenue || '',
        briefingMeetingLink: json.briefingMeetingLink || '',
        specialConditions: json.specialConditions || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setEditLoading(false);
    }
  }

  async function saveEdit() {
    if (!editingOcid) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/tenders/${editingOcid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Update failed');
      setOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to save changes');
    } finally {
      setEditLoading(false);
    }
  }

  const resetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setCategory("");
    setBuyer("");
    setFromDate("");
    setToDate("");
    setSortBy("publishedAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tender Management</h1>
        <p className="text-muted-foreground">Browse and manage tender records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> Tender Catalog
          </CardTitle>
          <CardDescription>View and filter tenders from the catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <div className="md:col-span-2 flex gap-2">
              <Input
                placeholder="Search title/description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <Button variant="outline" onClick={loadData} title="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Select value={status ?? "all"} onValueChange={(v) => { setStatus(v === 'all' ? undefined : v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input placeholder="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} />
            </div>
            <div>
              <Input placeholder="Buyer" value={buyer} onChange={(e) => { setBuyer(e.target.value); setPage(1); }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
              <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="publishedAt">Published</SelectItem>
                <SelectItem value="closingAt">Closing</SelectItem>
                <SelectItem value="updatedAt">Updated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as any); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Order" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}><RefreshCw className="h-4 w-4 mr-2" />Reset</Button>
          </div>

          <Separator className="my-3" />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left py-2 px-2">Buyer</th>
                  <th className="text-left py-2 px-2">Category</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Published</th>
                  <th className="text-left py-2 px-2">Closing</th>
                  <th className="text-left py-2 px-2">OCID</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Loading tenders...</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="py-8 text-center text-red-600">{error}</td></tr>
                ) : tenders.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No tenders found</td></tr>
                ) : (
                  tenders.map((t) => (
                    <tr key={`${t.id}-${t.ocid}`} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 max-w-md">
                        <div className="font-medium truncate" title={t.tenderTitle || ''}>{t.tenderTitle || '(no title)'}</div>
                        <div className="text-xs text-muted-foreground truncate" title={t.tenderDescription || ''}>{t.tenderDescription || ''}</div>
                      </td>
                      <td className="py-3 px-2">{t.buyerName || '-'}</td>
                      <td className="py-3 px-2">{t.mainCategory || '-'}</td>
                      <td className="py-3 px-2">{t.status ? <Badge variant="secondary">{t.status}</Badge> : '-'}</td>
                      <td className="py-3 px-2 text-xs">{t.publishedAt ? new Date(t.publishedAt).toLocaleString() : '-'}</td>
                      <td className="py-3 px-2 text-xs">{t.closingAt ? new Date(t.closingAt).toLocaleString() : '-'}</td>
                      <td className="py-3 px-2 font-mono text-xs">
                        <a className="underline underline-offset-2" href={`/admin/tenders/${encodeURIComponent(t.ocid)}`}>{t.ocid}</a>
                      </td>
                      <td className="py-3 px-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(t.ocid)}>
                          <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div>
              Page {page} of {totalPages} · {total.toLocaleString()} results
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tender</DialogTitle>
          </DialogHeader>
          {editLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={editForm.tenderTitle} onChange={(e) => setEditForm({ ...editForm, tenderTitle: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Contact Person</Label>
                  <Input value={editForm.contactPerson} onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Contact Email</Label>
                  <Input type="email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Briefing Date</Label>
                  <Input value={editForm.briefingDate} onChange={(e) => setEditForm({ ...editForm, briefingDate: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Briefing Time</Label>
                  <Input value={editForm.briefingTime} onChange={(e) => setEditForm({ ...editForm, briefingTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Briefing Venue</Label>
                <Input value={editForm.briefingVenue} onChange={(e) => setEditForm({ ...editForm, briefingVenue: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Briefing Link</Label>
                <Input value={editForm.briefingMeetingLink} onChange={(e) => setEditForm({ ...editForm, briefingMeetingLink: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Special Conditions</Label>
                <Textarea rows={3} value={editForm.specialConditions} onChange={(e) => setEditForm({ ...editForm, specialConditions: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={editLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
