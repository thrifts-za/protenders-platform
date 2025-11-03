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

// Helper to render schema in HTML
export function renderStructuredData(data: Organization | WebSite | BreadcrumbList | Service | JobPosting): string {
  return JSON.stringify(data);
}
