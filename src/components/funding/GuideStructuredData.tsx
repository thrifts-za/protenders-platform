/**
 * GuideStructuredData Component
 * Phase 3: ProTender Fund Finder - SEO Structured Data
 *
 * Generates JSON-LD structured data for funding guide articles
 */

import type { FundingGuide } from "@/data/fundingGuides";

interface GuideStructuredDataProps {
  guide: FundingGuide;
  url: string;
}

export function GuideStructuredData({ guide, url }: GuideStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Article Schema
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: guide.title,
        description: guide.excerpt,
        image: `https://protenders.co.za/images/og-guides-${guide.slug}.png`, // TODO: Generate OG images
        datePublished: guide.publishedDate,
        dateModified: guide.updatedDate || guide.publishedDate,
        author: {
          "@type": "Organization",
          name: guide.author,
          url: "https://protenders.co.za",
        },
        publisher: {
          "@type": "Organization",
          name: "ProTender",
          logo: {
            "@type": "ImageObject",
            url: "https://protenders.co.za/logo.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        keywords: guide.seoKeywords.join(", "),
        articleSection: guide.category,
        inLanguage: "en-ZA",
      },

      // HowTo Schema (for How-to guides)
      ...(guide.category === "How-to"
        ? [
            {
              "@type": "HowTo",
              "@id": `${url}#howto`,
              name: guide.title,
              description: guide.excerpt,
              totalTime: guide.readTime,
              tool: guide.targetAudience?.map((audience) => ({
                "@type": "HowToTool",
                name: `For ${audience}`,
              })),
              step: [
                {
                  "@type": "HowToStep",
                  name: "Read the complete guide",
                  text: guide.excerpt,
                },
                {
                  "@type": "HowToStep",
                  name: "Download the application checklist",
                  text: guide.downloadableResource?.description || "",
                },
                {
                  "@type": "HowToStep",
                  name: "Apply for funding",
                  text: "Follow the step-by-step process outlined in the guide",
                },
              ],
            },
          ]
        : []),

      // Breadcrumb Schema
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://protenders.co.za",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Funding",
            item: "https://protenders.co.za/funding",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Guides",
            item: "https://protenders.co.za/funding/guides",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: guide.title,
            item: url,
          },
        ],
      },

      // WebPage Schema
      {
        "@type": "WebPage",
        "@id": url,
        url: url,
        name: guide.title,
        description: guide.excerpt,
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://protenders.co.za/#website",
          name: "ProTender",
          url: "https://protenders.co.za",
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          "@id": `${url}#primaryimage`,
          url: `https://protenders.co.za/images/og-guides-${guide.slug}.png`,
        },
        datePublished: guide.publishedDate,
        dateModified: guide.updatedDate || guide.publishedDate,
      },

      // ItemList Schema (for target audiences)
      ...(guide.targetAudience && guide.targetAudience.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${url}#targetaudience`,
              name: "Target Audience",
              itemListElement: guide.targetAudience.map((audience, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: audience,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
