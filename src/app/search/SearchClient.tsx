"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TenderCard } from "@/components/TenderCard";
import type { TenderSearchResponse, SearchParams } from "@/types/tender";
import { searchTenders } from "@/lib/api";
import FilterPanel from "@/components/FilterPanel";
import SaveSearchDialog from "@/components/SaveSearchDialog";
import FreshnessFilters, { FreshnessFilterState } from "@/components/FreshnessFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Download, AlertCircle, Info, Building2, FileText, CheckSquare } from "lucide-react";
import { exportToCSV } from "@/lib/csv";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { trackSearch, trackButtonClick, trackFilterChange } from "@/lib/analytics";

const FRESHNESS_STORAGE_KEY = "tender-search-freshness";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize freshness from URL (SSR-safe), then sync to localStorage after mount
  const windowDaysParam = searchParams.get("windowDays");
  const initialWindowDays: number | null = windowDaysParam === null
    ? 30
    : windowDaysParam === ""
    ? null
    : Number.isNaN(parseInt(windowDaysParam))
    ? 30
    : parseInt(windowDaysParam);
  const sortParam = searchParams.get("sort");
  const initialSort: FreshnessFilterState["sort"] = (sortParam === "closingSoon" || sortParam === "relevance") ? sortParam : "latest";

  const [searchParamsState, setSearchParamsState] = useState<SearchParams>({ 
    page: parseInt(searchParams.get("page") || "1"), 
    pageSize: 20 
  });
  const [freshnessFilters, setFreshnessFilters] = useState<FreshnessFilterState>({ windowDays: initialWindowDays, updatedSince: null, sort: initialSort });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [data, setData] = useState<TenderSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params with state
  useEffect(() => {
    const params: SearchParams = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: 20,
    };

    const keywords = searchParams.get("keywords");
    if (keywords) params.keywords = keywords;

    const categories = searchParams.getAll("categories");
    if (categories.length) params.categories = categories;

    const province = searchParams.get("province");
    if (province) params.province = province;

    const buyer = searchParams.get("buyer");
    if (buyer) params.buyer = buyer;

    const closingInDays = searchParams.get("closingInDays");
    if (closingInDays) params.closingInDays = parseInt(closingInDays);

    const submissionMethods = searchParams.getAll("submissionMethods");
    if (submissionMethods.length) params.submissionMethods = submissionMethods;

    const status = searchParams.get("status");
    if (status) params.status = status as any;

    setSearchParamsState(params);
  }, [searchParams]);

  // Save freshness preferences to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        FRESHNESS_STORAGE_KEY,
        JSON.stringify({
          windowDays: freshnessFilters.windowDays,
          updatedSince: freshnessFilters.updatedSince?.toISOString(),
          sort: freshnessFilters.sort,
        })
      );
    } catch (e) {
      console.error("Failed to save freshness preferences:", e);
    }
  }, [freshnessFilters]);

  // Fetch tenders
  useEffect(() => {
    let cancelled = false;
    
    async function fetchTenders() {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await searchTenders({
          ...searchParamsState,
          closingInDays: searchParamsState.closingInDays ?? undefined,
          buyer: searchParamsState.buyer ?? undefined,
          status: searchParamsState.status ?? undefined,
          publishedSince: freshnessFilters.windowDays
            ? new Date(Date.now() - freshnessFilters.windowDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          sort: freshnessFilters.sort, // Pass through directly - backend expects "latest", "closingSoon", or "relevance"
        });

        if (!cancelled) {
          setData(result);

          // Track successful search
          trackSearch(
            searchParamsState.keywords || '',
            {
              categories: searchParamsState.categories?.join(','),
              province: searchParamsState.province,
              buyer: searchParamsState.buyer,
              closingInDays: searchParamsState.closingInDays,
              submissionMethods: searchParamsState.submissionMethods?.join(','),
              status: searchParamsState.status,
              sort: freshnessFilters.sort,
              windowDays: freshnessFilters.windowDays,
              results_count: result.total,
            }
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tenders");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    
    fetchTenders();
    
    return () => {
      cancelled = true;
    };
  }, [searchParamsState, freshnessFilters]);

  const handleSearch = (params: SearchParams) => {
    const qs = new URLSearchParams();
    if (params.keywords) qs.set("keywords", params.keywords);
    params.categories?.forEach((c) => qs.append("categories", c));
    if (params.province) qs.set("province", params.province);
    if (params.buyer) qs.set("buyer", String(params.buyer));
    if (params.closingInDays != null) qs.set("closingInDays", String(params.closingInDays));
    params.submissionMethods?.forEach((m) => qs.append("submissionMethods", m));
    if (params.status) qs.set("status", params.status);
    qs.set("page", "1");
    router.push(`/search?${qs.toString()}`);
  };

  const handleFreshnessChange = (filters: FreshnessFilterState) => {
    setFreshnessFilters(filters);
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", "1");
    router.push(`/search?${qs.toString()}`);
  };

  const handleResetFreshness = () => {
    setFreshnessFilters({ windowDays: 30, updatedSince: null, sort: "latest" });
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", "1");
    router.push(`/search?${qs.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", String(newPage));
    router.push(`/search?${qs.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExport = () => {
    if (data?.results) {
      // Transform results to flat format for CSV
      const rows = data.results.map((t) => ({
        id: t.tender?.id || t.id || "",
        title: t.tender?.title || "",
        buyerName: t.buyer?.name || "",
        mainProcurementCategory: t.tender?.mainProcurementCategory || "",
        closingDate: t.tender?.tenderPeriod?.endDate || "",
        status: t.tender?.status || "",
        submissionMethods: t.tender?.submissionMethod || [],
        description: t.tender?.description || "",
      }));
      exportToCSV(rows, `tenders-page-${data.page}.csv`);

      // Track CSV export
      trackButtonClick('Export to CSV', 'Search Results', {
        results_count: rows.length,
        page: data.page,
      });
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Search Tenders' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      <header className="w-full border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="content-container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Find Government Tenders & eTenders Across South Africa
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Search 10,000+ RFQs, RFPs & Procurement Opportunities | BEE Tenders | Real-Time Alerts
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              National Treasury Verified
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              BEE Opportunities
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              SMME Set-Asides
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
              CIDB Tenders
            </Badge>
          </div>

          {/* Quick Links to High-Value Pages */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/public-sector-tenders"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-primary transition-colors group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-white/20 transition-colors">
                <Building2 className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground group-hover:text-white transition-colors">Public Sector Tenders</div>
                <div className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">SOEs, Government & State Entities</div>
              </div>
            </Link>

            <Link
              href="/blog/how-to-submit-etenders-south-africa-complete-guide-2025"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-primary transition-colors group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-white/20 transition-colors">
                <FileText className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground group-hover:text-white transition-colors">How to Submit eTenders</div>
                <div className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Complete Step-by-Step Guide</div>
              </div>
            </Link>

            <Link
              href="/blog/tender-documents-south-africa-complete-checklist-guide-2025"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-primary transition-colors group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-white/20 transition-colors">
                <CheckSquare className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground group-hover:text-white transition-colors">Tender Documents Checklist</div>
                <div className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Required Docs & Templates</div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full py-8">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <FilterPanel onSearch={handleSearch} onSaveSearch={() => setSaveDialogOpen(true)} />
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            {/* Freshness Filters */}
            <div className="bg-card border rounded-lg p-4">
              <FreshnessFilters
                value={freshnessFilters}
                onChange={handleFreshnessChange}
                onReset={handleResetFreshness}
              />
            </div>

            {/* Freshness Banner */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span>
                  Showing {freshnessFilters.windowDays === null ? "all-time" : `latest ${freshnessFilters.windowDays} days`}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Sorted by {freshnessFilters.sort === "latest" ? "Latest" : freshnessFilters.sort === "closingSoon" ? "Closing Soon" : "Relevance"}
                </Badge>
                {data && (
                  <span className="relative flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Live Cloud Database</span>
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                {data && (
                  <p className="text-sm text-muted-foreground">
                    Showing {(data.page - 1) * data.pageSize + 1}-
                    {Math.min(data.page * data.pageSize, data.total)} of {data.total} results
                  </p>
                )}
              </div>
              {data && data.results.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load tenders. Please try again.</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            )}

            {data && data.results.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No tenders found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
              </div>
            )}

            {data && data.results.length > 0 && (
              <>
                <div className="space-y-4">
                  {data.results.map((tender) => (
                    <TenderCard key={tender.ocid || tender.id} tender={tender} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page - 1)}
                      disabled={data.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {data.page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page + 1)}
                      disabled={data.page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
        </div>
      </div>

      <SaveSearchDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        searchParams={searchParamsState}
      />
    </div>
  );
}

// This is the client-side interactive component for search
// The server component wrapper (page.tsx) handles metadata generation

export default function SearchClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background p-8">
        <div className="content-container">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96 w-full" />
            <div className="lg:col-span-3 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
