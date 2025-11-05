"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  Loader2,
} from "lucide-react";

export default function TenderIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tender, setTender] = useState<Record<string, unknown> | null>(null);
  const [intel, setIntel] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch tender data
        const tenderResponse = await fetch(`/api/tenders/${id}`);
        if (!tenderResponse.ok) throw new Error("Failed to load tender");
        const tenderData = await tenderResponse.json();
        setTender(tenderData);

        // Fetch intelligence data
        // Prefer local API intelligence endpoint
        const intelResponse = await fetch(`/api/tenders/${encodeURIComponent(id)}/intel`);
        if (intelResponse.ok) {
          const intelData = await intelResponse.json();
          setIntel(intelData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load intelligence data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "Computing...";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilClose = (closingDate: string | undefined) => {
    if (!closingDate) return null;
    return Math.ceil(
      (new Date(closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full py-8">
          <div className="content-container">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-10 w-10" />
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Intelligence Dashboard Unavailable</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Tender not found"}
          </p>
          <Link href="/search">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tenderData = tender as Record<string, unknown>;
  const tenderDetails = tenderData?.tender as Record<string, unknown> | undefined;
  const buyerData = tenderData?.buyer as Record<string, unknown> | undefined;
  const tenderPeriod = tenderDetails?.tenderPeriod as Record<string, unknown> | undefined;

  const title = (tenderDetails?.title as string) || "Untitled Tender";
  const buyerName = (buyerData?.name as string) || "Unknown Buyer";
  const status = (tenderDetails?.status as string) || "active";
  const closingDate = tenderPeriod?.endDate as string | undefined;
  const daysUntilClose = getDaysUntilClose(closingDate);
  const isUrgent = daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0;

  // Intelligence data
  const intelData = intel as Record<string, unknown> | null;
  const opportunityScoreData = intelData?.opportunityScore as Record<string, unknown> | undefined;
  const financialData = intelData?.financial as Record<string, unknown> | undefined;
  const financialBand = financialData?.band as Record<string, unknown> | undefined;
  const competitionData = intelData?.competition as Record<string, unknown> | undefined;
  const frequentWinnersData = competitionData?.frequentWinners as unknown[] | undefined;

  const opportunityScore = (opportunityScoreData?.value as number) ?? null;
  const estValue = (financialBand?.mid as number) || (financialData?.estValueZAR as number);
  const frequentWinners = frequentWinnersData?.length || 0;
  const docsWithRisks = Array.isArray((intel as Record<string, unknown>)?.docInsights)
    ? ((intel as Record<string, unknown>).docInsights as Record<string, unknown>[])?.filter(
        (d: Record<string, unknown>) => {
          const keyPoints = d.keyPoints as Record<string, unknown> | undefined;
          const risks = keyPoints?.risks as unknown[] | undefined;
          return Array.isArray(risks) && risks.length > 0;
        }
      ).length || 0
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/tender/${id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tender Details
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold">Intelligence Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{title}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isUrgent && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Closes in {daysUntilClose} days
                </Badge>
              )}
              <Badge variant="secondary">{status}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-8">
        <div className="content-container">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {opportunityScore !== null ? `${opportunityScore}%` : "N/A"}
                  </div>
                  <div className="text-sm text-green-600">Opportunity Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(estValue)}
                  </div>
                  <div className="text-sm text-blue-600">Est. Contract Value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-700">{frequentWinners}</div>
                  <div className="text-sm text-purple-600">Frequent Winners</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-700">{docsWithRisks}</div>
                  <div className="text-sm text-orange-600">Documents w/ Risks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Loading State */}
        {!intel && (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">AI Intelligence Loading...</h3>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing this tender to provide comprehensive intelligence insights.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Intelligence Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="overview">Intelligence Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="competition">Competitive Analysis</TabsTrigger>
            <TabsTrigger value="documents">Document Intelligence</TabsTrigger>
            <TabsTrigger value="actions">Action Center</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Intelligence Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {intel ? (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>AI Analysis Complete:</strong> Intelligence data is ready for {title}
                      </AlertDescription>
                    </Alert>

                    {/* Basic Intelligence Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Buyer Information</h4>
                        <p className="text-sm">Name: {buyerName}</p>
                        {(() => {
                          const buyerIntel = intelData?.buyer as Record<string, unknown> | undefined;
                          const awards24m = buyerIntel?.awards24m as number | undefined;
                          return awards24m ? (
                            <p className="text-sm">Awards (24m): {awards24m}</p>
                          ) : null;
                        })()}
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Timeline</h4>
                        {closingDate && (
                          <p className="text-sm">Closes: {formatDate(closingDate)}</p>
                        )}
                        {daysUntilClose !== null && (
                          <p className="text-sm">Days remaining: {daysUntilClose}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Intelligence components are being migrated to Next.js.</p>
                    <p className="text-sm mt-2">
                      Advanced intelligence features coming soon...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {intel ? (
                  (() => {
                    const financial = (intelData?.financial as Record<string, unknown> | undefined) || {};
                    const band = (financial?.band as Record<string, number> | undefined) || {} as any;
                    const mid = (band?.mid as number) || (financial?.estValueZAR as number | undefined);
                    const low = band?.low as number | undefined;
                    const high = band?.high as number | undefined;
                    const confidence = (financial?.confidence as number | undefined) ?? undefined;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Estimated Value</div>
                          <div className="text-xl font-semibold">{formatCurrency(mid || 0)}</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Range (Low?High)</div>
                          <div className="text-xl font-semibold">
                            {low ? formatCurrency(low) : '?'} ? {high ? formatCurrency(high) : '?'}
                          </div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className="text-xl font-semibold">{confidence != null ? `${confidence}%` : 'N/A'}</div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Financial intelligence not available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competition Tab */}
          <TabsContent value="competition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Competitive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {intel ? (
                  (() => {
                    const comp = (intelData?.competition as Record<string, unknown> | undefined) || {};
                    const winners = (comp?.frequentWinners as Array<Record<string, unknown>> | undefined) || [];
                    if (!winners.length) {
                      return <div className="text-sm text-muted-foreground">No frequent winners identified.</div>;
                    }
                    return (
                      <div className="space-y-3">
                        {winners.slice(0, 10).map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="font-medium">{String(w.name || w["supplier"] || 'Unknown')}</div>
                            <div className="text-sm text-muted-foreground">{(w.count as number | undefined) ?? ''}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Competition data not available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Document Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {intel ? (
                  (() => {
                    const docs = (intelData?.docInsights as Array<Record<string, unknown>> | undefined) || [];
                    if (!docs.length) return <div className="text-sm text-muted-foreground">No document insights available.</div>;
                    return (
                      <div className="space-y-4">
                        {docs.map((d, i) => {
                          const title = (d.title as string) || `Document ${i + 1}`;
                          const keyPoints = (d.keyPoints as Record<string, unknown> | undefined) || {};
                          const risks = (keyPoints?.risks as Array<string> | undefined) || [];
                          const summary = (keyPoints?.summary as string | undefined) || '';
                          return (
                            <div key={i} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold">{title}</div>
                                {risks.length > 0 && (
                                  <Badge variant="destructive">{risks.length} risk{risks.length > 1 ? 's' : ''}</Badge>
                                )}
                              </div>
                              {summary && <p className="text-sm text-muted-foreground mb-2">{summary}</p>}
                              {risks.length > 0 && (
                                <ul className="list-disc pl-5 text-sm text-red-600">
                                  {risks.map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Document intelligence not available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Action Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const recs = (intelData?.recommendations as Array<string> | undefined) || [];
                  const items: string[] = [];
                  if (recs.length) items.push(...recs);
                  if (daysUntilClose != null) {
                    if (daysUntilClose <= 7) items.push("Prioritize bid team and finalize compliance documents this week.");
                    else items.push("Schedule internal review and assign responsibilities for bid preparation.");
                  }
                  if (!items.length) return <div className="text-sm text-muted-foreground">No recommendations currently available.</div>;
                  return (
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      {items.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
