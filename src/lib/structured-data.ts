/**
 * JSON-LD Structured Data for SEO
 * Helps search engines understand content better
 */

interface Organization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressRegion: string;
  };
  sameAs: string[];
}

interface WebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

interface BreadcrumbList {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

interface Service {
  "@context": "https://schema.org";
  "@type": "Service";
  serviceType: string;
  provider: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  areaServed: {
    "@type": "Country";
    name: string;
  };
  description: string;
}

interface JobPosting {
  "@context": "https://schema.org";
  "@type": "JobPosting";
  title: string;
  description: string;
  hiringOrganization: {
    "@type": "Organization";
    name: string;
  };
  datePosted: string;
  validThrough?: string;
  jobLocationType?: string;
  applicantLocationRequirements?: {
    "@type": "Country";
    name: string;
  };
}

interface Article {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  image?: string;
  articleBody?: string;
  keywords?: string;
}

interface FAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface HowTo {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  image?: string;
  totalTime?: string;
  estimatedCost?: {
    "@type": "MonetaryAmount";
    currency: string;
    value: string;
  };
  step: Array<{
    "@type": "HowToStep";
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

interface AggregateRating {
  "@context": "https://schema.org";
  "@type": "AggregateRating";
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  ratingCount: number;
  reviewCount?: number;
}

interface Product {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image?: string;
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    bestRating: number;
    worstRating: number;
    ratingCount: number;
  };
}

export function generateOrganizationSchema(): Organization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ProTenders",
    url: "https://protenders.co.za",
    logo: "https://protenders.co.za/logo.png",
    description:
      "South Africa's premier government tender portal. Search 10,000+ tenders, RFQs & RFPs. AI-powered alerts, BEE opportunities & procurement intelligence.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ZA",
      addressRegion: "South Africa",
    },
    sameAs: [
      "https://www.linkedin.com/company/protenders",
      "https://twitter.com/protenders",
      "https://www.facebook.com/protenders",
    ],
  };
}

export function generateWebSiteSchema(): WebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ProTenders",
    url: "https://protenders.co.za",
    description:
      "Search 10,000+ government tenders, RFQs & RFPs across South Africa. AI-powered tender alerts, BEE opportunities & real-time procurement intelligence.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://protenders.co.za/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>): BreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `https://protenders.co.za${item.url}` : undefined,
    })),
  };
}

export function generateServiceSchema(
  serviceType: string,
  description: string
): Service {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    provider: {
      "@type": "Organization",
      name: "ProTenders",
      url: "https://protenders.co.za",
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    description,
  };
}

// Province-specific schemas with LocalBusiness
interface LocalBusiness {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  description: string;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressRegion: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  areaServed: {
    "@type": "State" | "City";
    name: string;
  };
  url: string;
  sameAs?: string[];
}

// Province-specific schemas
export function generateProvinceServiceSchema(
  provinceName: string,
  description: string
): Service {
  return generateServiceSchema(
    `${provinceName} Government Tenders`,
    description
  );
}

// Enhanced LocalBusiness schema for provinces
export function generateProvinceLocalBusinessSchema(
  provinceName: string,
  description: string,
  options?: {
    latitude?: number;
    longitude?: number;
    url?: string;
  }
): LocalBusiness {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `ProTenders ${provinceName}`,
    description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "ZA",
      addressRegion: provinceName,
    },
    geo: options?.latitude && options?.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: options.latitude,
          longitude: options.longitude,
        }
      : undefined,
    areaServed: {
      "@type": "State",
      name: provinceName,
    },
    url: options?.url || `https://protenders.co.za/provinces/${provinceName.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

// Municipality LocalBusiness schema
export function generateMunicipalityLocalBusinessSchema(
  municipalityName: string,
  province: string,
  description: string,
  options?: {
    latitude?: number;
    longitude?: number;
    url?: string;
  }
): LocalBusiness {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${municipalityName} Tenders - ProTenders`,
    description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "ZA",
      addressRegion: province,
    },
    geo: options?.latitude && options?.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: options.latitude,
          longitude: options.longitude,
        }
      : undefined,
    areaServed: {
      "@type": "City",
      name: municipalityName,
    },
    url: options?.url || `https://protenders.co.za/municipalities/${municipalityName.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

// Category-specific schemas
export function generateCategoryServiceSchema(
  categoryName: string,
  description: string
): Service {
  return generateServiceSchema(
    `${categoryName} Tenders South Africa`,
    description
  );
}

// Province coordinates for geo-targeting
export const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number; capital: string }> = {
  "Gauteng": { lat: -26.2041, lng: 28.0473, capital: "Johannesburg" },
  "Western Cape": { lat: -33.9249, lng: 18.4241, capital: "Cape Town" },
  "KwaZulu-Natal": { lat: -29.8587, lng: 31.0218, capital: "Durban" },
  "Eastern Cape": { lat: -32.2968, lng: 26.4194, capital: "Port Elizabeth" },
  "Free State": { lat: -29.1217, lng: 26.2144, capital: "Bloemfontein" },
  "Limpopo": { lat: -23.4013, lng: 29.4179, capital: "Polokwane" },
  "Mpumalanga": { lat: -25.4753, lng: 30.9694, capital: "Mbombela" },
  "Northern Cape": { lat: -28.7282, lng: 24.7499, capital: "Kimberley" },
  "North West": { lat: -25.8601, lng: 25.6433, capital: "Mahikeng" },
};

// JobPosting schema for individual tenders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateJobPostingSchema(tender: any): JobPosting {
  const title = tender.tender?.title || "Government Tender Opportunity";
  const description = tender.tender?.description || title;
  const buyerName = tender.buyer?.name || "Government Entity";
  const datePosted = tender.date || new Date().toISOString();
  const validThrough = tender.tender?.tenderPeriod?.endDate;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    hiringOrganization: {
      "@type": "Organization",
      name: buyerName,
    },
    datePosted,
    validThrough,
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "South Africa",
    },
  };
}

// Article schema for blog posts
export interface BlogPostData {
  title: string;
  excerpt: string;
  author: string;
  publishedDate: string;
  content?: string;
  tags?: string[];
  slug: string;
}

export function generateArticleSchema(post: BlogPostData): Article {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "ProTenders",
      logo: {
        "@type": "ImageObject",
        url: "https://protenders.co.za/logo.png",
      },
    },
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    image: "https://protenders.co.za/images/og-image.png",
    articleBody: post.content,
    keywords: post.tags?.join(", "),
  };
}

// FAQ schema for FAQ pages and tender details
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqItems: FAQItem[]): FAQPage {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// HowTo schema for guide pages
export interface HowToStepData {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStepData[],
  options?: {
    image?: string;
    totalTime?: string;
    estimatedCost?: {
      currency: string;
      value: string;
    };
  }
): HowTo {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    image: options?.image,
    totalTime: options?.totalTime,
    estimatedCost: options?.estimatedCost
      ? {
          "@type": "MonetaryAmount",
          currency: options.estimatedCost.currency,
          value: options.estimatedCost.value,
        }
      : undefined,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  };
}

// Aggregate Rating schema for tender complexity/opportunity scores
export function generateAggregateRatingSchema(
  ratingValue: number,
  ratingCount: number,
  bestRating: number = 5,
  worstRating: number = 1,
  reviewCount?: number
): AggregateRating {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue,
    bestRating,
    worstRating,
    ratingCount,
    reviewCount,
  };
}

// Product schema for funding opportunities
export interface FundingProductData {
  name: string;
  description: string;
  image?: string;
  maxAmount?: string;
  currency?: string;
  rating?: {
    value: number;
    count: number;
  };
}

export function generateFundingProductSchema(funding: FundingProductData): Product {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: funding.name,
    description: funding.description,
    image: funding.image,
    offers: funding.maxAmount
      ? {
          "@type": "Offer",
          price: funding.maxAmount,
          priceCurrency: funding.currency || "ZAR",
          availability: "https://schema.org/InStock",
        }
      : undefined,
    aggregateRating: funding.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: funding.rating.value,
          bestRating: 5,
          worstRating: 1,
          ratingCount: funding.rating.count,
        }
      : undefined,
  };
}

// Helper to render schema in HTML
export function renderStructuredData(
  data: Organization | WebSite | BreadcrumbList | Service | JobPosting | Article | FAQPage | HowTo | AggregateRating | Product | LocalBusiness
): string {
  return JSON.stringify(data);
}
