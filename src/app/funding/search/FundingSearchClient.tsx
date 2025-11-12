"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FundingCard } from "@/components/FundingCard";
import { FundingFilterPanel, FundingSearchParams } from "@/components/FundingFilterPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertCircle, Target, TrendingUp } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { trackSearch, trackButtonClick } from "@/lib/analytics";

interface FundingOpportunity {
  id: string;
  slug: string;
  programName: string;
  institution: string;
  fundingType: string;
  categories: string[];
  provinces: string[];
  purpose?: string | null;
  minAmountZAR?: number | null;
  maxAmountZAR?: number | null;
  amountNotes?: string | null;
  fundedIndustries: string[];
  eligibility: string[];
  applyUrl?: string | null;
  source: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Enhanced fields for Corporate ESD
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  applicationMethod?: string | null;
  submissionRequirements?: string[];
  fundingCategory?: string | null;
  parentInstitution?: string | null;
  sector?: string | null;
  deadline?: Date | string | null;
}

interface FundingSearchResponse {
  items: FundingOpportunity[];
  total: number;
  page: number;
  pageSize: number;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    dataSource: string;
  };
}

interface FundingFacets {
  categories: [string, number][];
  provinces: [string, number][];
  fundingTypes: [string, number][];
  sources: [string, number][];
  institutions: [string, number][];
  amountRanges: {
    min: number | null;
    max: number | null;
    quartiles: number[];
  };
}

function FundingSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchParamsState, setSearchParamsState] = useState<FundingSearchParams>({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: 20,
  });
  const [data, setData] = useState<FundingSearchResponse | null>(null);
  const [facets, setFacets] = useState<FundingFacets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params with state
  useEffect(() => {
    const params: FundingSearchParams = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: 20,
    };

    const q = searchParams.get("q");
    if (q) params.q = q;

    const categories = searchParams.getAll("categories");
    if (categories.length) params.categories = categories;

    const provinces = searchParams.getAll("provinces");
    if (provinces.length) params.provinces = provinces;

    const fundingType = searchParams.get("fundingType");
    if (fundingType) params.fundingType = fundingType;

    const amountMin = searchParams.get("amountMin");
    if (amountMin) params.amountMin = parseInt(amountMin);

    const amountMax = searchParams.get("amountMax");
    if (amountMax) params.amountMax = parseInt(amountMax);

    const source = searchParams.get("source");
    if (source) params.source = source;

    const institution = searchParams.get("institution");
    if (institution) params.institution = institution;

    setSearchParamsState(params);
  }, [searchParams]);

  // Fetch facets on mount
  useEffect(() => {
    async function fetchFacets() {
      setIsLoadingFacets(true);
      try {
        const response = await fetch('/api/funding/facets');
        if (!response.ok) throw new Error('Failed to fetch facets');
        const facetsData = await response.json();
        setFacets(facetsData);
      } catch (err) {
        console.error('Error fetching facets:', err);
      } finally {
        setIsLoadingFacets(false);
      }
    }

    fetchFacets();
  }, []);

  // Fetch funding opportunities
  useEffect(() => {
    let cancelled = false;

    async function fetchFunding() {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string
        const queryParams = new URLSearchParams();
        if (searchParamsState.q) queryParams.set('q', searchParamsState.q);
        if (searchParamsState.categories) {
          searchParamsState.categories.forEach(cat => queryParams.append('categories', cat));
        }
        if (searchParamsState.provinces) {
          searchParamsState.provinces.forEach(prov => queryParams.append('provinces', prov));
        }
        if (searchParamsState.fundingType) queryParams.set('fundingType', searchParamsState.fundingType);
        if (searchParamsState.amountMin) queryParams.set('amountMin', searchParamsState.amountMin.toString());
        if (searchParamsState.amountMax) queryParams.set('amountMax', searchParamsState.amountMax.toString());
        if (searchParamsState.source) queryParams.set('source', searchParamsState.source);
        if (searchParamsState.institution) queryParams.set('institution', searchParamsState.institution);
        queryParams.set('page', searchParamsState.page?.toString() || '1');
        queryParams.set('pageSize', '20');

        const response = await fetch(`/api/funding?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch funding opportunities');

        const result = await response.json();

        if (!cancelled) {
          setData(result);

          // Track successful search
          trackSearch(
            searchParamsState.q || '',
            {
              type: 'funding',
              categories: searchParamsState.categories?.join(','),
              provinces: searchParamsState.provinces?.join(','),
              fundingType: searchParamsState.fundingType,
              amountMin: searchParamsState.amountMin,
              amountMax: searchParamsState.amountMax,
              source: searchParamsState.source,
              institution: searchParamsState.institution,
              results_count: result.total,
            }
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load funding opportunities");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFunding();

    return () => {
      cancelled = true;
    };
  }, [searchParamsState]);

  // Handle search with filters
  const handleSearch = (params: FundingSearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.set('q', params.q);
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(cat => queryParams.append('categories', cat));
    }
    if (params.provinces && params.provinces.length > 0) {
      params.provinces.forEach(prov => queryParams.append('provinces', prov));
    }
    if (params.fundingType) queryParams.set('fundingType', params.fundingType);
    if (params.amountMin) queryParams.set('amountMin', params.amountMin.toString());
    if (params.amountMax) queryParams.set('amountMax', params.amountMax.toString());
    if (params.source) queryParams.set('source', params.source);
    if (params.institution) queryParams.set('institution', params.institution);
    queryParams.set('page', '1'); // Reset to page 1 on filter change

    router.push(`/funding/search?${queryParams.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', newPage.toString());
    router.push(`/funding/search?${queryParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.total / (data.pageSize || 20)) : 0;
  const currentPage = data?.page || 1;

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Funding Opportunities", href: "/funding" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SME Funding Opportunities</h1>
        <p className="text-muted-foreground">
          Discover funding programs from IDC, dtic, NEF, SEFA, Land Bank, TIA, and more institutions across South Africa
        </p>
      </div>

      {/* Stats Bar */}
      {data && !isLoading && (
        <div className="mb-6 flex flex-wrap gap-4">
          <Badge variant="outline" className="py-2 px-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            {data.total} programs available
          </Badge>
          {facets && (
            <>
              <Badge variant="outline" className="py-2 px-4">
                {facets.institutions.length} institutions
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                {facets.categories.length} categories
              </Badge>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel - Left Sidebar */}
        <div className="lg:col-span-1">
          <FundingFilterPanel
            onSearch={handleSearch}
            facets={facets || undefined}
            isLoadingFacets={isLoadingFacets}
            initialValues={searchParamsState}
          />
        </div>

        {/* Results - Right Content */}
        <div className="lg:col-span-3">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              {/* Results Grid */}
              <div className="space-y-4 mb-6">
                {data.items.map((funding) => (
                  <FundingCard key={funding.id} funding={funding} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * (data.pageSize || 20)) + 1} to{" "}
                    {Math.min(currentPage * (data.pageSize || 20), data.total)} of{" "}
                    {data.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No Results State
            <div className="text-center py-16">
              <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No funding programs found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms to find more opportunities
              </p>
              <Button
                variant="outline"
                onClick={() => handleSearch({ page: 1 })}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FundingSearchClient() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 lg:col-span-1" />
          <div className="lg:col-span-3 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    }>
      <FundingSearchContent />
    </Suspense>
  );
}
