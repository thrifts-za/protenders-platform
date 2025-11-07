"use client";

import { Tender } from "@/types/tender";
import { generateTenderFAQSchema, generateTenderServiceSchema } from "@/lib/utils/tender-metadata";

interface TenderStructuredDataProps {
  tender: Tender;
}

/**
 * Client component that injects structured data (JSON-LD) for SEO
 * This should ideally be server-rendered, but works as client component for now
 */
export default function TenderStructuredData({ tender }: TenderStructuredDataProps) {
  // Generate FAQ schema
  const release = {
    tenderDisplayTitle: tender.tender?.title,
    tenderTitle: tender.tender?.title,
    buyerName: tender.buyer?.name,
    mainCategory: tender.tender?.mainProcurementCategory,
    province: (tender as any).enrichment?.province,
    closingAt: tender.tender?.tenderPeriod?.endDate || tender.closingAt,
  };

  const slug = tender.ocid || tender.id; // Fallback to OCID for now
  const faqSchema = generateTenderFAQSchema(release);
  const serviceSchema = generateTenderServiceSchema(release, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}