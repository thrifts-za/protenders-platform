import type { OCDSRelease } from "./ocdsClient";
import type { TenderEnrichment } from "@/services/tenderScraper";

export interface NormalizedForDB {
  ocid: string;
  releaseId: string;
  date?: Date;
  tag?: string;
  json: string;
  buyerName?: string;
  tenderTitle?: string;
  tenderDescription?: string;
  mainCategory?: string;
  closingAt?: Date | null;
  submissionMethods?: string | null;
  status?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  tenderType?: string | null;
  province?: string | null;
  deliveryLocation?: string | null;
  specialConditions?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactTelephone?: string | null;
  enquiryDeadline?: Date | null;
  briefingDate?: string | null;
  briefingTime?: string | null;
  briefingVenue?: string | null;
  briefingMeetingLink?: string | null;
}

export function normalizeReleaseForDB(
  release: OCDSRelease,
  enrichment: TenderEnrichment | null
): NormalizedForDB {
  const publishedAtIso = release.date;
  const closingIso = release.tender?.tenderPeriod?.endDate;
  const updatedAtIso = release.tender?.documents?.reduce<string | undefined>((acc, d) => {
    const dm = d?.dateModified || d?.datePublished;
    if (!dm) return acc;
    if (!acc) return dm;
    return new Date(dm) > new Date(acc) ? dm : acc;
  }, undefined);

  return {
    ocid: release.ocid,
    releaseId: release.id,
    date: publishedAtIso ? new Date(publishedAtIso) : undefined,
    tag: "compiled",
    json: JSON.stringify(release),
    buyerName: release.buyer?.name || release.tender?.procuringEntity?.name || undefined,
    tenderTitle: release.tender?.title || undefined,
    tenderDescription: release.tender?.description || undefined,
    mainCategory: release.tender?.mainProcurementCategory || undefined,
    closingAt: closingIso ? new Date(closingIso) : null,
    submissionMethods: null,
    status: release.tender?.status || null,
    publishedAt: publishedAtIso ? new Date(publishedAtIso) : null,
    updatedAt: updatedAtIso ? new Date(updatedAtIso) : null,
    tenderType: release.tender?.procurementMethodDetails || release.tender?.procurementMethod || null,
    province: enrichment?.province || null,
    deliveryLocation: enrichment?.deliveryAddress || null,
    specialConditions: enrichment?.specialConditions || null,
    contactPerson: enrichment?.contactPerson || null,
    contactEmail: enrichment?.contactEmail || null,
    contactTelephone: enrichment?.contactTelephone || null,
    enquiryDeadline: null,
    briefingDate: enrichment?.briefingSession?.date || null,
    briefingTime: enrichment?.briefingSession?.time || null,
    briefingVenue: enrichment?.briefingSession?.venue || null,
    briefingMeetingLink: enrichment?.briefingSession?.meetingLink || null,
  };
}


