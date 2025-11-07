"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, FileText, Link2, Rocket, Save, ListTree } from "lucide-react";
import { createTenderUrlFromTitleAndDescription } from "@/lib/utils/slug";

type AdminTender = {
  ocid: string;
  tenderTitle?: string | null;
  buyerName?: string | null;
  status?: string | null;
  mainCategory?: string | null;
  province?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  briefingDate?: string | null;
  briefingTime?: string | null;
  briefingVenue?: string | null;
  briefingMeetingLink?: string | null;
  specialConditions?: string | null;
  json?: any;
};

type TimelineItem = {
  date: string;
  type: string;
  title?: string | null;
  status?: string | null;
  closingDate?: string | null;
  tags?: string[];
};

type Intel = {
  opportunityScore?: number | null;
  dataQualityScore?: number | null;
  estimatedValue?: { valueZAR?: number | null; valueBand?: any; profitMidZAR?: number | null };
  competition?: { hhi?: number | null; level?: string | null };
  buyer?: { name?: string | null; awards24m?: number | null; avgAwardZAR?: number | null } | null;
  category?: { name?: string | null; p25ZAR?: number | null; p50ZAR?: number | null; p75ZAR?: number | null } | null;
  relatedTenders?: Array<{ ocid: string; title?: string | null; buyer?: string | null }>;
};

export default function AdminTenderDetailPage() {
  const params = useParams<{ ocid: string }>();
  const ocid = decodeURIComponent(params.ocid);

  const [loading, setLoading] = useState(true);
  const [tender, setTender] = useState<AdminTender | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [intel, setIntel] = useState<Intel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit form
  const [edit, setEdit] = useState({
    tenderTitle: "",
    contactPerson: "",
    contactEmail: "",
    briefingDate: "",
    briefingTime: "",
    briefingVenue: "",
    briefingMeetingLink: "",
    specialConditions: "",
  });
  const [saving, setSaving] = useState(false);

  const docs = useMemo(() => {
    const d =
      (tender as any)?.json?.tender?.documents ||
      (tender as any)?.json?.releases?.[0]?.tender?.documents ||
      [];
    return Array.isArray(d) ? d.slice(0, 50) : [];
  }, [tender]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocid]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, timelineRes, intelRes] = await Promise.all([
        fetch(`/api/admin/tenders/${encodeURIComponent(ocid)}`),
        fetch(`/api/tenders/${encodeURIComponent(ocid)}/timeline`),
        fetch(`/api/tenders/${encodeURIComponent(ocid)}/intel`),
      ]);

      if (!detailRes.ok) throw new Error(`Detail failed: ${detailRes.status}`);
      const detail = await detailRes.json();
      setTender(detail);
      setEdit({
        tenderTitle: detail.tenderTitle || "",
        contactPerson: detail.contactPerson || "",
        contactEmail: detail.contactEmail || "",
        briefingDate: detail.briefingDate || "",
        briefingTime: detail.briefingTime || "",
        briefingVenue: detail.briefingVenue || "",
        briefingMeetingLink: detail.briefingMeetingLink || "",
        specialConditions: detail.specialConditions || "",
      });

      if (timelineRes.ok) {
        const t = await timelineRes.json();
        setTimeline(t.timeline || []);
      }

      if (intelRes.ok) setIntel(await intelRes.json());
    } catch (e: any) {
      setError(e.message || "Failed to load tender");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenders/${encodeURIComponent(ocid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      if (!res.ok) throw new Error('Update failed');
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function analyzeDocuments() {
    const res = await fetch(`/api/tenders/${encodeURIComponent(ocid)}/analyze`, { method: 'POST' });
    if (res.ok) {
      alert('Analysis enqueued');
    } else {
      alert('Failed to enqueue analysis');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tender: {ocid}</h1>
        <p className="text-muted-foreground">Admin drill-down: overview, timeline, documents, and intelligence</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : !tender ? (
        <div className="text-center py-12 text-muted-foreground">Not found</div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="intel">Intelligence</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Overview</CardTitle>
                <CardDescription>Key fields and quick edits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={edit.tenderTitle} onChange={(e) => setEdit({ ...edit, tenderTitle: e.target.value })} />
                  </div>
                  <div>
                    <Label>Buyer</Label>
                    <Input value={tender.buyerName || ''} readOnly />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-2"><Badge variant="secondary">{tender.status || 'unknown'}</Badge></div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input value={tender.mainCategory || ''} readOnly />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input value={tender.province || ''} readOnly />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Person</Label>
                    <Input value={edit.contactPerson} onChange={(e) => setEdit({ ...edit, contactPerson: e.target.value })} />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" value={edit.contactEmail} onChange={(e) => setEdit({ ...edit, contactEmail: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>Briefing Date</Label>
                    <Input value={edit.briefingDate} onChange={(e) => setEdit({ ...edit, briefingDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Briefing Time</Label>
                    <Input value={edit.briefingTime} onChange={(e) => setEdit({ ...edit, briefingTime: e.target.value })} />
                  </div>
                  <div>
                    <Label>Briefing Venue</Label>
                    <Input value={edit.briefingVenue} onChange={(e) => setEdit({ ...edit, briefingVenue: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Briefing Link</Label>
                    <Input value={edit.briefingMeetingLink} onChange={(e) => setEdit({ ...edit, briefingMeetingLink: e.target.value })} />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Special Conditions</Label>
                  <Textarea rows={4} value={edit.specialConditions} onChange={(e) => setEdit({ ...edit, specialConditions: e.target.value })} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  <a href={tender?.tenderTitle ? createTenderUrlFromTitleAndDescription(tender.tenderTitle, null, ocid) : `/tender/${encodeURIComponent(ocid)}`} target="_blank" className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-muted">
                    <Link2 className="h-4 w-4 mr-2" />Open Public Page
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListTree className="h-5 w-5" /> Timeline</CardTitle>
                <CardDescription>Release history and events</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No timeline data</div>
                ) : (
                  <ul className="space-y-3">
                    {timeline.map((item, idx) => (
                      <li key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{item.type}</div>
                          <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</div>
                        </div>
                        {item.title && <div className="text-sm mt-1">{item.title}</div>}
                        {item.status && <div className="text-xs text-muted-foreground mt-1">Status: {item.status}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documents</CardTitle>
                <CardDescription>Attached tender documents</CardDescription>
              </CardHeader>
              <CardContent>
                {docs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No documents found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 px-2">Title</th>
                          <th className="text-left py-2 px-2">Format</th>
                          <th className="text-left py-2 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map((d: any, i: number) => (
                          <tr key={(d.id || d.url || i) as string} className="border-b last:border-0">
                            <td className="py-3 px-2 max-w-md truncate" title={d.title}>{d.title || '(no title)'}</td>
                            <td className="py-3 px-2">{d.format || '-'}</td>
                            <td className="py-3 px-2">
                              {d.url ? (
                                <a className="underline underline-offset-2" href={d.url} target="_blank" rel="noreferrer">Open</a>
                              ) : (
                                <span className="text-muted-foreground">n/a</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Intelligence</CardTitle>
                <CardDescription>Computed features and market signals</CardDescription>
              </CardHeader>
              <CardContent>
                {!intel ? (
                  <div className="text-center py-8 text-muted-foreground">No intelligence available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Opportunity Score</div>
                        <div className="text-2xl font-bold">{intel.opportunityScore ?? '-'}</div>
                        <div className="text-sm mt-2">Data Quality: {intel.dataQualityScore ?? '-'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Estimated Value (ZAR)</div>
                        <div className="text-2xl font-bold">{intel.estimatedValue?.valueZAR ? intel.estimatedValue.valueZAR.toLocaleString() : '-'}</div>
                        <div className="text-sm mt-2">Profit Mid: {intel.estimatedValue?.profitMidZAR ? intel.estimatedValue.profitMidZAR.toLocaleString() : '-'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Competition HHI</div>
                        <div className="text-2xl font-bold">{intel.competition?.hhi ?? '-'}</div>
                        <div className="text-sm mt-2">Level: {intel.competition?.level ?? '-'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Buyer</div>
                        <div className="text-2xl font-bold">{intel.buyer?.name || '-'}</div>
                        <div className="text-sm mt-2">Awards (24m): {intel.buyer?.awards24m ?? '-'}</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" /> Actions</CardTitle>
                <CardDescription>Maintenance and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={analyzeDocuments}><Rocket className="h-4 w-4 mr-2" />Analyze Documents</Button>
                  <a href={tender?.tenderTitle ? createTenderUrlFromTitleAndDescription(tender.tenderTitle, null, ocid) : `/tender/${encodeURIComponent(ocid)}`} target="_blank" className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-muted">
                    <Link2 className="h-4 w-4 mr-2" />Open Public Page
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

