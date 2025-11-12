/**
 * Funding Detail Page
 * Phase 3: ProTender Fund Finder - SEO-optimized detail page with JSON-LD
 *
 * Supports both slug and ID lookups
 * Generates structured data for search engines
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Building2,
  DollarSign,
  MapPin,
  Tag,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle2,
  Target,
  Calendar,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FundingCard } from '@/components/FundingCard';
import { formatRelativeDate } from '@/lib/date';
import { prisma } from '@/lib/prisma';

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
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  } | null;
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

async function getFundingBySlug(slug: string | string[]): Promise<FundingOpportunity | null> {
  try {
    // Handle both single slug and catch-all slug array
    const slugString = Array.isArray(slug) ? slug.join('/') : slug;

    // Query database directly from server component
    let opportunity = await prisma.fundingOpportunity.findUnique({
      where: { id: slugString },
    });

    // If not found by ID, try slug
    if (!opportunity) {
      opportunity = await prisma.fundingOpportunity.findUnique({
        where: { slug: slugString },
      });
    }

    if (!opportunity) {
      return null;
    }

    // Convert BigInt amounts for serialization
    return {
      ...opportunity,
      minAmountZAR: opportunity.minAmount ? Number(opportunity.minAmount) / 100 : null,
      maxAmountZAR: opportunity.maxAmount ? Number(opportunity.maxAmount) / 100 : null,
    } as FundingOpportunity;
  } catch (error) {
    console.error('Error fetching funding:', error);
    return null;
  }
}

async function getRelatedFunding(
  category: string,
  currentId: string
): Promise<FundingOpportunity[]> {
  try {
    // Query database directly
    const opportunities = await prisma.fundingOpportunity.findMany({
      where: {
        isActive: true,
        categories: { has: category },
        id: { not: currentId },
      },
      take: 4,
      orderBy: [
        { createdAt: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    // Convert BigInt amounts for serialization
    return opportunities.map(opp => ({
      ...opp,
      minAmountZAR: opp.minAmount ? Number(opp.minAmount) / 100 : null,
      maxAmountZAR: opp.maxAmount ? Number(opp.maxAmount) / 100 : null,
    })) as FundingOpportunity[];
  } catch (error) {
    console.error('Error fetching related funding:', error);
    return [];
  }
}

/**
 * Get funding type badge color - each type has unique, professional color
 */
function getFundingTypeBadgeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'grant':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300'; // Green - Free money
    case 'loan':
      return 'bg-blue-100 text-blue-700 border-blue-300'; // Blue - Traditional financing
    case 'equity':
      return 'bg-purple-100 text-purple-700 border-purple-300'; // Purple - Investment/Partnership
    case 'hybrid':
      return 'bg-amber-100 text-amber-700 border-amber-300'; // Amber - Mixed approach
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'; // Gray - Unknown/Other
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata(props: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  // In Next.js 15, params must be awaited
  const params = await props.params;
  const funding = await getFundingBySlug(params.slug);

  if (!funding) {
    return {
      title: 'Funding Not Found',
    };
  }

  const amountText = funding.amountNotes ||
    (funding.minAmountZAR && funding.maxAmountZAR
      ? `R${funding.minAmountZAR.toLocaleString()} - R${funding.maxAmountZAR.toLocaleString()}`
      : funding.maxAmountZAR
      ? `Up to R${funding.maxAmountZAR.toLocaleString()}`
      : 'Amount varies');

  return {
    title: `${funding.programName} | ${funding.institution}`,
    description: `${funding.purpose || `${funding.fundingType} funding from ${funding.institution}`}. ${amountText}. Available in ${funding.provinces.join(', ')}.`,
    keywords: [
      funding.programName,
      funding.institution,
      ...funding.categories,
      ...funding.fundedIndustries,
      funding.fundingType,
      'SME funding',
      'South Africa funding',
    ],
    openGraph: {
      title: `${funding.programName} | ${funding.institution}`,
      description: funding.purpose || `${funding.fundingType} funding from ${funding.institution}`,
      url: `https://protenders.co.za/funding/${funding.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://protenders.co.za/funding/${funding.slug}`,
    },
  };
}

export default async function FundingDetailPage(props: {
  params: Promise<{ slug: string | string[] }>;
}) {
  // In Next.js 15, params must be awaited
  const params = await props.params;
  const funding = await getFundingBySlug(params.slug);

  if (!funding) {
    notFound();
  }

  const relatedFunding = funding.categories.length > 0
    ? await getRelatedFunding(funding.categories[0], funding.id)
    : [];

  // Format amount range
  const amountText = funding.amountNotes ||
    (funding.minAmountZAR && funding.maxAmountZAR
      ? `R${funding.minAmountZAR.toLocaleString()} - R${funding.maxAmountZAR.toLocaleString()}`
      : funding.maxAmountZAR
      ? `Up to R${funding.maxAmountZAR.toLocaleString()}`
      : funding.minAmountZAR
      ? `From R${funding.minAmountZAR.toLocaleString()}`
      : 'Amount varies');

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': funding.fundingType === 'Grant' ? 'Grant' : 'FinancialProduct',
    name: funding.programName,
    description: funding.purpose || `${funding.fundingType} funding from ${funding.institution}`,
    provider: {
      '@type': 'Organization',
      name: funding.institution,
      ...(funding.contacts?.email && { email: funding.contacts.email }),
      ...(funding.contacts?.phone && { telephone: funding.contacts.phone }),
      ...(funding.contacts?.address && { address: funding.contacts.address }),
    },
    ...(funding.amountNotes && { amount: funding.amountNotes }),
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    url: `https://protenders.co.za/funding/${funding.slug}`,
    category: funding.categories.join(', '),
    ...(funding.applyUrl && { potentialAction: {
      '@type': 'ApplyAction',
      target: funding.applyUrl,
    }}),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto py-8 px-4">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Funding', href: '/funding' },
            { label: funding.programName, href: `/funding/${funding.slug}` },
          ]}
        />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{funding.programName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span className="text-lg">{funding.institution}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                className={`text-base py-1 px-3 border font-semibold ${getFundingTypeBadgeColor(funding.fundingType)}`}
              >
                {funding.fundingType}
              </Badge>
            </div>
          </div>

          {funding.purpose && (
            <p className="text-lg text-muted-foreground">{funding.purpose}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Information Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Key Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Funding Amount</div>
                    <div className="text-sm text-muted-foreground">{amountText}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Provinces</div>
                    <div className="text-sm text-muted-foreground">
                      {funding.provinces.length === 9
                        ? 'All Provinces'
                        : funding.provinces.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Categories</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {funding.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeDate(funding.updatedAt.toString())}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Funded Industries */}
            {funding.fundedIndustries.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Funded Industries
                </h2>
                <div className="flex flex-wrap gap-2">
                  {funding.fundedIndustries.map((industry) => (
                    <Badge key={industry} variant="outline">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Eligibility Criteria */}
            {funding.eligibility.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Eligibility Criteria
                </h2>
                <ul className="space-y-2">
                  {funding.eligibility.map((criterion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Registration CTA Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Don't Miss Out!</h3>
                    <p className="text-sm text-muted-foreground">
                      Register to get instant alerts when new funding opportunities match your business profile.
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90" asChild size="lg">
                  <Link href="/register">
                    Register for Free Alerts
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already registered? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            </Card>

            {/* Apply Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Apply for This Program</h2>
              {funding.applyUrl ? (
                <Button className="w-full" asChild>
                  <a href={funding.applyUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Application Portal
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  Contact the institution directly to apply
                </p>
              )}

              {/* Contact Information */}
              {funding.contacts && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium">Contact Information</h3>
                  {funding.contacts.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${funding.contacts.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {funding.contacts.email}
                      </a>
                    </div>
                  )}
                  {funding.contacts.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${funding.contacts.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {funding.contacts.phone}
                      </a>
                    </div>
                  )}
                  {funding.contacts.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{funding.contacts.address}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Data Source - Hidden for now */}
            {/* <Card className="p-4">
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">Data Source</div>
                <div>{funding.source.toUpperCase()}</div>
                <div className="mt-2">
                  Last verified: {formatRelativeDate(funding.updatedAt.toString())}
                </div>
              </div>
            </Card> */}
          </div>
        </div>

        {/* Related Funding */}
        {relatedFunding.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Funding Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedFunding.slice(0, 4).map((related) => (
                <FundingCard key={related.id} funding={related} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/funding">Browse All Funding Programs</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
