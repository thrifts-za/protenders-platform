import type { OCDSRelease } from "./ocdsClient";
import { scrapeTenderDetails, TenderEnrichment } from "@/services/tenderScraper";

export interface EnrichedRelease {
  release: OCDSRelease;
  enrichment: TenderEnrichment | null;
}

export async function enrichRelease(release: OCDSRelease): Promise<EnrichedRelease> {
  const tenderId = release.tender?.id || release.ocid;
  const enrichment = tenderId ? await scrapeTenderDetails(tenderId) : null;
  return { release, enrichment };
}


