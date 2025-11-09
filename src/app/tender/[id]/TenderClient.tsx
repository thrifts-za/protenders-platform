"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import OpportunityScoreCard from "@/components/OpportunityScoreCard";
import { Tender } from "@/types/tender";
import { getTenderById } from "@/lib/api";
import { Calendar, DollarSign, FileText, Clock, Building2, Target, Star, Share2, Info, Check, Lock } from "lucide-react";
import StrategicAssistant from "@/components/StrategicAssistant";
import EntrepreneurMetrics from "@/components/EntrepreneurMetrics";
import TenderStructuredData from "@/components/tender/TenderStructuredData";
import { extractTenderIdFromSlug } from "@/lib/utils/slug";
import { toSentenceCase } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CountdownTimer } from "@/components/CountdownTimer";
import { createTenderCalendarEvent, downloadICSFile } from "@/lib/utils/calendar";
import FinancialIntelligence from "@/components/tender/FinancialIntelligence";
import CompetitiveAnalysis from "@/components/tender/CompetitiveAnalysis";
import ActionCenter from "@/components/tender/ActionCenter";
import RealTimeUpdates from "@/components/tender/RealTimeUpdates";
import AwardHistory from "@/components/tender/AwardHistory";
import DocumentsList from "@/components/tender/DocumentsList";
import OverviewTab from "@/components/tender/OverviewTab";

// This is the client-side interactive component for tender details
// The server component wrapper (page.tsx) handles metadata generation

export default function TenderClient() {
  const params = useParams();
  const slug = params.id as string;
  // Extract the actual OCID from the slug (handles both old OCID-only and new slug-based URLs)
  const id = extractTenderIdFromSlug(slug);
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

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

  // Check if tender is saved in localStorage
  useEffect(() => {
    if (!id) return;
    const savedTenders = localStorage.getItem('saved-tenders');
    if (savedTenders) {
      const parsed = JSON.parse(savedTenders);
      setIsSaved(parsed.includes(id));
    }
  }, [id]);

  // Button Handlers
  const handleAddToCalendar = () => {
    if (!tender) return;

    const closingDate = tender.tender?.tenderPeriod?.endDate;
    if (!closingDate) {
      toast({
        title: "No closing date",
        description: "This tender doesn't have a closing date set.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tenderUrl = typeof window !== 'undefined' ? window.location.href : '';
      const event = createTenderCalendarEvent(
        tender.tender?.title || 'Tender',
        closingDate,
        tender.tender?.description,
        tenderUrl
      );

      const filename = `tender-${tender.ocid}-closing.ics`;
      downloadICSFile(event, filename);

      toast({
        title: "Calendar event downloaded",
        description: "The .ics file has been downloaded. Open it to add to your calendar.",
      });
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTender = () => {
    if (!id) return;

    try {
      const savedTenders = localStorage.getItem('saved-tenders');
      let tenderIds: string[] = savedTenders ? JSON.parse(savedTenders) : [];

      if (isSaved) {
        // Remove from saved
        tenderIds = tenderIds.filter(tenderId => tenderId !== id);
        setIsSaved(false);
        toast({
          title: "Tender removed",
          description: "Tender has been removed from your saved list.",
        });
      } else {
        // Add to saved
        tenderIds.push(id);
        setIsSaved(true);
        toast({
          title: "Tender saved",
          description: "Tender has been added to your saved list.",
        });
      }

      localStorage.setItem('saved-tenders', JSON.stringify(tenderIds));
    } catch (error) {
      console.error('Failed to save tender:', error);
      toast({
        title: "Error",
        description: "Failed to save tender. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!tender) return;

    const tenderUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: tender.tender?.title || 'Tender',
      text: `Check out this tender: ${tender.tender?.title || 'Tender'}`,
      url: tenderUrl,
    };

    try {
      // Try native share API first (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Tender has been shared.",
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(tenderUrl);
        toast({
          title: "Link copied",
          description: "Tender link has been copied to clipboard.",
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share:', error);
        toast({
          title: "Error",
          description: "Failed to share tender. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

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
  const enrichment: any = (tender as any)?.enrichment || raw?.__enrichment || null;
  const parties: any[] = raw?.parties || (tender as any)?.parties || [];
  const buyerParty = parties.find((p) => p?.id === tender.buyer?.id) || parties.find((p) => Array.isArray(p?.roles) && p.roles.includes("buyer"));
  const procuringEntity = raw?.tender?.procuringEntity || {};
  const contact = {
    name: enrichment?.contactPerson || buyerParty?.contactPoint?.name || procuringEntity?.contactPoint?.name,
    email: enrichment?.contactEmail || buyerParty?.contactPoint?.email || procuringEntity?.contactPoint?.email,
    telephone: enrichment?.contactTelephone || buyerParty?.contactPoint?.telephone || procuringEntity?.contactPoint?.telephone,
    faxNumber: buyerParty?.contactPoint?.faxNumber || procuringEntity?.contactPoint?.faxNumber,
  } as any;

  const tenderNumber = tender.tender?.id || raw?.tender?.id || tender.id || "—";
  const organOfState = tender.buyer?.name || procuringEntity?.name || buyerParty?.name || "—";
  const tenderType = enrichment?.tenderType || raw?.tender?.procurementMethodDetails || tender.tender?.procurementMethodDetails || tender.tender?.procurementMethod || "—";

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

  const province = enrichment?.province || findProvince();
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

  const place = enrichment?.deliveryLocation || findPlace();
  const specialConditions = enrichment?.specialConditions || raw?.tender?.eligibilityCriteria || raw?.tender?.otherRequirements || "N/A";

  // Get all documents from various sources
  const tenderDocuments = raw?.tender?.documents || tender.tender?.documents || [];
  const planningDocuments = raw?.planning?.documents || [];
  const enrichmentDocuments = (enrichment?.documents || []) as any[];
  // Merge and de-duplicate documents by URL (fallback to id/title)
  const mergedDocs = [...tenderDocuments, ...planningDocuments, ...enrichmentDocuments];
  const seenDocKeys = new Set<string>();
  const documents = mergedDocs.filter((doc: any) => {
    const key = String((doc?.url || doc?.id || doc?.title || '')).toLowerCase();
    if (!key) return true;
    if (seenDocKeys.has(key)) return false;
    seenDocKeys.add(key);
    return true;
  });

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

  // Extract requirements and eligibility information
  const extractRequirements = () => {
    const requirements: {
      bbbeeLevel?: string;
      certifications: string[];
      eligibility: string[];
      otherRequirements: string[];
    } = {
      certifications: [],
      eligibility: [],
      otherRequirements: [],
    };

    // Combine all text sources for parsing
    const textSources = [
      tender.tender?.description || '',
      tender.tender?.title || '',
      specialConditions,
      raw?.tender?.eligibilityCriteria || '',
      raw?.tender?.otherRequirements || '',
      enrichment?.specialConditions || '',
      ...(tender.tender?.items || []).map((item: any) => item?.description || ''),
    ].join(' ').toLowerCase();

    // Extract BBBEE requirements
    const bbbeeMatch = textSources.match(/b-?bbee\s*(level\s*)?(\d+|[1-4])/i);
    if (bbbeeMatch) {
      requirements.bbbeeLevel = `Level ${bbbeeMatch[2]}`;
    } else if (textSources.includes('bbbee') || textSources.includes('b-bbee')) {
      requirements.bbbeeLevel = 'Required (level not specified)';
    }

    // Common certifications
    const certKeywords = [
      { keyword: 'tax', cert: 'Valid Tax Clearance Certificate' },
      { keyword: 'csd', cert: 'CSD (Central Supplier Database) Registration' },
      { keyword: 'cidb', cert: 'CIDB (Construction Industry Development Board) Registration' },
      { keyword: 'cipc', cert: 'CIPC Company Registration' },
      { keyword: 'vat', cert: 'VAT Registration' },
      { keyword: 'insurance', cert: 'Professional Indemnity Insurance' },
      { keyword: 'liability insurance', cert: 'Public Liability Insurance' },
      { keyword: 'workman', cert: "Workmen's Compensation" },
      { keyword: 'uif', cert: 'UIF Registration' },
      { keyword: 'sars', cert: 'SARS Tax Compliance Status' },
    ];

    certKeywords.forEach(({ keyword, cert }) => {
      if (textSources.includes(keyword) && !requirements.certifications.includes(cert)) {
        requirements.certifications.push(cert);
      }
    });

    // Eligibility criteria
    const eligibilityKeywords = [
      { keyword: 'sme', criteria: 'SME (Small and Medium Enterprises) preferred' },
      { keyword: 'qse', criteria: 'QSE (Qualifying Small Enterprise)' },
      { keyword: 'exempt micro enterprise', criteria: 'EME (Exempt Micro Enterprise) preferred' },
      { keyword: 'eme', criteria: 'EME (Exempt Micro Enterprise) preferred' },
      { keyword: '51%', criteria: 'Minimum 51% Black Ownership' },
      { keyword: '30%', criteria: 'Minimum 30% Black Ownership' },
      { keyword: 'black owned', criteria: 'Black-Owned Business preferred' },
      { keyword: 'women owned', criteria: 'Women-Owned Business preferred' },
      { keyword: 'youth owned', criteria: 'Youth-Owned Business preferred' },
      { keyword: 'disabled', criteria: 'Businesses owned by people with disabilities preferred' },
      { keyword: 'local', criteria: 'Local suppliers preferred' },
      { keyword: 'years experience', criteria: 'Minimum experience required (see description)' },
      { keyword: 'track record', criteria: 'Proven track record required' },
      { keyword: 'past performance', criteria: 'Past performance references required' },
    ];

    eligibilityKeywords.forEach(({ keyword, criteria }) => {
      if (textSources.includes(keyword) && !requirements.eligibility.includes(criteria)) {
        requirements.eligibility.push(criteria);
      }
    });

    // Other requirements
    const otherKeywords = [
      { keyword: 'site visit', requirement: 'Compulsory site visit' },
      { keyword: 'compulsory briefing', requirement: 'Compulsory briefing session' },
      { keyword: 'non-refundable', requirement: 'Non-refundable tender fee may apply' },
      { keyword: 'joint venture', requirement: 'Joint ventures allowed' },
      { keyword: 'consortium', requirement: 'Consortium bids allowed' },
      { keyword: 'sub-contract', requirement: 'Sub-contracting allowed' },
    ];

    otherKeywords.forEach(({ keyword, requirement }) => {
      if (textSources.includes(keyword) && !requirements.otherRequirements.includes(requirement)) {
        requirements.otherRequirements.push(requirement);
      }
    });

    return requirements;
  };

  const requirements = extractRequirements();
  const daysUntilClose = getDaysUntilClose(closingDate);
  const isUrgent = daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0;

  // Helper to create URL-friendly category slug
  const createCategorySlug = (category: string) => {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Build breadcrumb items
  const breadcrumbItems: Array<{ name: string; url?: string }> = [
    { name: 'Home', url: '/' },
    { name: 'eTenders', url: '/etenders' },
  ];

  // Add category breadcrumb if available
  if (tender.detailedCategory) {
    breadcrumbItems.push({
      name: `${tender.detailedCategory}`,
      url: `/etenders/category/${createCategorySlug(tender.detailedCategory)}`,
    });
  }

  // Add current tender title (no URL for current page) - full title for SEO
  const tenderTitle = tender.tender?.title || "Tender Details";
  breadcrumbItems.push({ name: tenderTitle });

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      {tender && <TenderStructuredData tender={tender} />}

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-8">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {tender.detailedCategory ? (
              <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                {tender.detailedCategory}
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                {tender.tender?.mainProcurementCategory || "Tender"}
              </span>
            )}
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
      <div className="w-full border-b bg-gray-50 dark:bg-gray-900/50">
        <div className="content-container py-4">
          <div className="flex flex-wrap items-center gap-3">
            {closingDate && (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Closes {formatDate(closingDate)}
                </Badge>
                <CountdownTimer closingDate={closingDate} />
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddToCalendar}>
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={handleSaveTender}
              >
                {isSaved ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                {isSaved ? "Saved" : "Save Tender"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full py-8">
        <div className="content-container">
          {/* 2-Column Layout: Cards on left, Sidebar on right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,350px)] xl:grid-cols-[1fr_350px] gap-6 lg:gap-8">
            {/* Left Column - Main Cards */}
            <div className="space-y-8 w-full min-w-0">
              {/* Description Section */}
              {tender.tender?.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                      {toSentenceCase(tender.tender.description)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Section (eTenders-style) */}
              <Card>
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

            {/* Requirements & Eligibility Section */}
            {(requirements.bbbeeLevel || requirements.certifications.length > 0 ||
              requirements.eligibility.length > 0 || requirements.otherRequirements.length > 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Requirements & Eligibility
                </h3>

                <div className="space-y-4">
                  {/* BBBEE Level */}
                  {requirements.bbbeeLevel && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-blue-600 text-white mt-0.5">BBBEE</Badge>
                        <span className="text-sm font-medium">{requirements.bbbeeLevel}</span>
                      </div>
                    </div>
                  )}

                  {/* Required Certifications */}
                  {requirements.certifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Required Certifications:</h4>
                      <ul className="space-y-1.5">
                        {requirements.certifications.map((cert, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Eligibility Criteria */}
                  {requirements.eligibility.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Eligibility Criteria:</h4>
                      <ul className="space-y-1.5">
                        {requirements.eligibility.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Other Requirements */}
                  {requirements.otherRequirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Additional Requirements:</h4>
                      <ul className="space-y-1.5">
                        {requirements.otherRequirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-600 mt-0.5">!</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <strong>Note:</strong> Requirements have been automatically extracted. Always verify complete requirements in the official tender documents.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
              </Card>

              {/* Enquiries Section */}
              <Card>
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
              <Card>
          <CardHeader>
            <CardTitle>Briefing Session</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="font-semibold">Is there a briefing session?:</span> {typeof enrichment?.hasBriefing === 'boolean' ? (enrichment.hasBriefing ? 'Yes' : 'No') : (enrichment?.briefingDate || enrichment?.briefingVenue ? 'Yes' : 'Unknown')}
            </div>
            <div>
              <span className="font-semibold">Is it compulsory?:</span> {typeof enrichment?.briefingCompulsory === 'boolean' ? (enrichment.briefingCompulsory ? 'Yes' : 'No') : 'Unknown'}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Briefing Date and Time:</span> {enrichment?.briefingDate ? fmtLongDateTime(enrichment.briefingDate) : 'Not disclosed'}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Briefing Venue:</span> {enrichment?.briefingVenue || 'Not disclosed'}
            </div>
            {enrichment?.briefingMeetingLink && (
              <div className="md:col-span-2">
                <span className="font-semibold">Meeting Link/ID:</span> {enrichment.briefingMeetingLink}
              </div>
            )}
            {!enrichment?.briefingDate && !enrichment?.briefingVenue && (
              <div className="md:col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Briefing session information may be available in tender documents or the
                  <a href={`https://www.etenders.gov.za/`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> official eTenders website</a>.
                </p>
              </div>
            )}
          </CardContent>
              </Card>

              {/* Documents Section */}
              <Card>
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

              {/* Tabbed Interface */}
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
                <TabsContent value="overview">
                  <OverviewTab tender={tender} />
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial">
                  <FinancialIntelligence
                    tenderValue={tender?.tender?.value?.amount}
                    tenderTitle={tender?.tender?.title}
                  />
                </TabsContent>

                {/* Competitor Tab */}
                <TabsContent value="competitor">
                  <CompetitiveAnalysis
                    tenderCategory={tender?.tender?.mainProcurementCategory}
                    province={tender?.parties?.find(p => p.roles?.includes('buyer'))?.address?.region}
                  />
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents">
                  <DocumentsList documents={documents} />
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions">
                  <ActionCenter closingDate={tender?.closingAt} />
                </TabsContent>

                {/* Updates Tab */}
                <TabsContent value="updates">
                  <RealTimeUpdates tenderNumber={tender?.tender?.id} />
                </TabsContent>

                {/* Awards Tab */}
                <TabsContent value="awards">
                  <AwardHistory
                    buyerName={tender?.buyer?.name}
                    tenderCategory={tender?.tender?.mainProcurementCategory}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:sticky lg:top-8 lg:self-start w-full max-w-full">
              <Tabs defaultValue="strategy" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="strategy">Strategy</TabsTrigger>
                  <TabsTrigger value="market">Market</TabsTrigger>
                </TabsList>
                <TabsContent value="strategy" className="mt-4">
                  <StrategicAssistant tender={tender} intel={undefined} />
                </TabsContent>
                <TabsContent value="market" className="mt-4">
                  <EntrepreneurMetrics tender={tender} intel={undefined} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
