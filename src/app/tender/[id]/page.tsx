"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OpportunityScoreCard from "@/components/OpportunityScoreCard";
import { Tender } from "@/types/tender";
import { getTenderById } from "@/lib/api";
import { Calendar, DollarSign, FileText, Clock, Building2, Target, Star, Share2, Info } from "lucide-react";

// Note: This is a client component. Do not export `revalidate` here.

// We won't use generateStaticParams for now since we have thousands of tenders
// They will be generated on-demand with ISR

export default function TenderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTender() {
      try {
        const tenderData = await getTenderById(id);
        setTender(tenderData);
      } catch (error) {
        console.error('Failed to load tender:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTender();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tender details...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tender Not Found</h1>
          <p className="text-muted-foreground">The requested tender could not be found.</p>
        </div>
      </div>
    );
  }

  // Helpers
  const fmtLongDateTime = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${datePart} - ${timePart}`;
  };

  const raw: any = (tender as any)?.raw || null;
  const parties: any[] = raw?.parties || (tender as any)?.parties || [];
  const buyerParty = parties.find((p) => p?.id === tender.buyer?.id) || parties.find((p) => Array.isArray(p?.roles) && p.roles.includes("buyer"));
  const procuringEntity = raw?.tender?.procuringEntity || {};
  const contact = buyerParty?.contactPoint || procuringEntity?.contactPoint || {};

  const tenderNumber = tender.tender?.id || raw?.tender?.id || tender.id || "—";
  const organOfState = tender.buyer?.name || procuringEntity?.name || buyerParty?.name || "—";
  const tenderType = raw?.tender?.procurementMethodDetails || tender.tender?.procurementMethodDetails || tender.tender?.procurementMethod || "—";

  const findProvince = () => {
    const region = buyerParty?.address?.region || raw?.tender?.deliveryLocation?.address?.region;
    if (region) return region;
    // Best-effort from title text
    const title = tender.tender?.title?.toLowerCase() || "";
    const provinces = [
      "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West",
    ];
    const found = provinces.find((p) => title.includes(p.toLowerCase()));
    return found || "—";
  };

  const province = findProvince();
  const datePublished = fmtLongDateTime(tender.publishedAt || (tender as any).date || null);
  const closingDateTime = fmtLongDateTime(tender.tender?.tenderPeriod?.endDate || tender.closingAt || null);

  const findPlace = () => {
    // Try delivery locations on items
    const items = raw?.tender?.items || [];
    for (const it of items) {
      const addr = it?.deliveryLocation?.address;
      if (addr) {
        const parts = [addr.streetAddress, addr.locality, addr.region, addr.postalCode].filter(Boolean);
        if (parts.length) return parts.join(", ");
      }
    }
    // Try buyer address
    const addr = buyerParty?.address;
    if (addr) {
      const parts = [addr.streetAddress, addr.locality, addr.region, addr.postalCode].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
    return "—";
  };

  const place = findPlace();
  const specialConditions = raw?.tender?.eligibilityCriteria || raw?.tender?.otherRequirements || "N/A";

  // Get all documents from various sources
  const tenderDocuments = raw?.tender?.documents || tender.tender?.documents || [];
  const planningDocuments = raw?.planning?.documents || [];
  const documents = [...tenderDocuments, ...planningDocuments];

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount || amount === 0) return "Value not disclosed";
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilClose = (closingDate?: string) => {
    if (!closingDate) return null;
    const now = new Date();
    const closeDate = new Date(closingDate);
    const diffTime = closeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const closingDate = tender.tender?.tenderPeriod?.endDate || tender.closingAt;
  const daysUntilClose = getDaysUntilClose(closingDate);
  const isUrgent = daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {tender.tender?.mainProcurementCategory || "Tender"}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                tender.tender?.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {tender.tender?.status || tender.status || "active"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{tender.tender?.title || "Untitled Tender"}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Buyer:</span>
              <span>{tender.buyer?.name || "Unknown Buyer"}</span>
            </div>
            {tender.tender?.id && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Reference:</span>
                <span className="font-mono">{tender.tender.id}</span>
              </div>
            )}
            {tender.date && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Published:</span>
                <span>{formatDate(tender.date)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {closingDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Closes {formatDate(closingDate)}
              </Badge>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Save Tender
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Details Section (eTenders-style) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="font-semibold">Tender Number:</span> {tenderNumber}
              </div>
              <div>
                <span className="font-semibold">Organ Of State:</span> {organOfState}
              </div>
              <div>
                <span className="font-semibold">Tender Type:</span> {tenderType}
              </div>
              <div>
                <span className="font-semibold">Province:</span> {province}
              </div>
              <div>
                <span className="font-semibold">Date Published:</span> {datePublished}
              </div>
              <div>
                <span className="font-semibold">Closing Date:</span> {closingDateTime}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Place where goods, works or services are required:</span> {place}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Special Conditions:</span> {specialConditions}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enquiries Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enquiries</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="font-semibold">Contact Person:</span> {contact?.name || "Not disclosed"}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {contact?.email || "Not disclosed"}
            </div>
            <div>
              <span className="font-semibold">Telephone number:</span> {contact?.telephone || contact?.phone || "Not disclosed"}
            </div>
            <div>
              <span className="font-semibold">Fax number:</span> {contact?.faxNumber || "Not disclosed"}
            </div>
            {!contact?.email && !contact?.telephone && (
              <div className="md:col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <p className="text-xs text-muted-foreground">
                  For complete contact details, please visit the{" "}
                  <a
                    href={`https://www.etenders.gov.za/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    official eTenders website
                  </a>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Briefing Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Briefing Session</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="font-semibold">Is there a briefing session?:</span> Unknown
            </div>
            <div>
              <span className="font-semibold">Is it compulsory?:</span> Unknown
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Briefing Date and Time:</span> Not disclosed
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Briefing Venue:</span> Not disclosed
            </div>
            <div className="md:col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-xs text-muted-foreground">
                Briefing session information is not available through the OCDS API. Please check the tender documents or visit the{" "}
                <a
                  href={`https://www.etenders.gov.za/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  official eTenders website
                </a> for briefing details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {(!documents || documents.length === 0) ? (
              <div className="text-sm text-muted-foreground">No documents available.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {documents.map((doc, idx) => (
                  <li key={doc.id || idx} className="flex items-center justify-between gap-4 p-2 border rounded">
                    <div className="truncate">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {doc.title || doc.documentType || "Document"}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Date Uploaded: {fmtLongDateTime(doc.datePublished || doc.dateModified)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
      </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-8 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial Intelligence</TabsTrigger>
            <TabsTrigger value="competitor">Competitive Analysis</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="actions">Action Center</TabsTrigger>
            <TabsTrigger value="updates">Real-time Updates</TabsTrigger>
            <TabsTrigger value="awards">Award History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* AI Opportunity Score Card */}
                <OpportunityScoreCard tender={tender} />

                {/* Description */}
                {tender.tender?.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                        {tender.tender.description}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tender.tender?.value && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Value</p>
                          <p className="text-lg font-semibold text-green-700">
                            {formatCurrency(tender.tender.value.amount, tender.tender.value.currency)}
                          </p>
                        </div>
                      </div>
                    )}

                    {closingDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className={`h-5 w-5 mt-0.5 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Closing Date</p>
                          <p className="text-lg font-semibold">{formatDate(closingDate)}</p>
                          {daysUntilClose !== null && (
                            <div className="flex items-center gap-2 mt-1">
                              {isUrgent ? (
                                <Badge className="bg-red-100 text-red-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysUntilClose} days left
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {daysUntilClose} days left
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {tender.tender?.procurementMethod && (
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Procurement Method</p>
                          <p className="font-medium">{tender.tender.procurementMethod}</p>
                        </div>
                      </div>
                    )}

                    {tender.buyer?.name && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Buyer</p>
                          <p className="font-medium">{tender.buyer.name}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{tender.buyer?.name || "Government Department"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contact information will be displayed here.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="bg-primary/10 border border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Ready to bid?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get AI-powered insights and strategic recommendations for this opportunity.
                    </p>
                    <Button className="w-full">
                      View Intelligence Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Financial Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Financial analysis component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitor Tab */}
          <TabsContent value="competitor" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Competitive analysis component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document analysis component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Action Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Task management component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Real-time updates component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Award History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Award history component will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}
