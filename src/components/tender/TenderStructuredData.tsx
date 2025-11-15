"use client";

import { Tender } from "@/types/tender";
import { generateTenderFAQSchema } from "@/lib/utils/tender-metadata";
import { generateJobPostingSchema } from "@/lib/structured-data";

interface TenderStructuredDataProps {
  tender: Tender;
}

/**
 * Client component that injects structured data (JSON-LD) for SEO
 * Uses JobPosting schema (more semantically correct for tenders) + FAQ schema
 */
export default function TenderStructuredData({ tender }: TenderStructuredDataProps) {
  // Generate FAQ schema for common questions
  const release = {
    tenderDisplayTitle: tender.tender?.title,
    tenderTitle: tender.tender?.title,
    buyerName: tender.buyer?.name,
    mainCategory: tender.tender?.mainProcurementCategory,
    province: (tender as any).enrichment?.province,
    closingAt: tender.tender?.tenderPeriod?.endDate || tender.closingAt,
  };

  const faqSchema = generateTenderFAQSchema(release);

  // Generate JobPosting schema - more semantically correct for government tenders
  // Gives rich snippets in Google (closing date, organization, location)
  const jobPostingSchema = generateJobPostingSchema(tender);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}