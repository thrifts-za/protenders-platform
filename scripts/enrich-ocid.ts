#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { enrichTenderFromEtenders } from '../src/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_MS } from '../src/lib/enrichment/constants';

async function getPrisma() {
  const mod = await import('../src/lib/prisma');
  return (mod as any).prisma as any;
}

function parseArgs(){
  const args = process.argv.slice(2);
  const out: Record<string,string> = {};
  for(const a of args){ const m=a.match(/^--([^=]+)=(.*)$/); if(m) out[m[1]]=m[2]; }
  return out;
}

function deriveTenderNumberFromRelease(raw: any): string | null {
  const t = raw?.tender;
  if (!t) return null;
  const title = typeof t.title === 'string' ? t.title.trim() : '';
  // Prefix style: RFP..., RFQ...
  let m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
  if (m) return (m[0] || title).replace(/\s+/g, '');
  // Suffix style: .../RFP, .../RFQ
  m = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
  if (m) return (m[0] || title).replace(/\s+/g, '');
  // Fallback to tender.id
  if (typeof t.id === 'string' && t.id.trim()) return t.id.trim();
  if (typeof t.id === 'number') return String(t.id);
  return null;
}

async function main(){
  const prisma = await getPrisma();
  const { ocid='' } = parseArgs();
  if(!ocid){ console.error('Usage: npx tsx scripts/enrich-ocid.ts --ocid=ocds-...'); process.exit(1); }

  const release = await prisma.oCDSRelease.findFirst({ where: { ocid }, orderBy: { date: 'desc' } });
  if(!release){ console.error('Not found in DB'); process.exit(1); }
  const raw = JSON.parse(release.json);
  const tenderNumber = deriveTenderNumberFromRelease(raw);
  const buyerName = raw?.buyer?.name || raw?.tender?.procuringEntity?.name;
  const title = raw?.tender?.title;
  const tenderIdHint = String(raw?.tender?.id || '');
  console.log('Enriching with:', { tenderNumber, buyerName, title, tenderIdHint });

  const enrichment = await enrichTenderFromEtenders(tenderNumber || title || tenderIdHint, RATE_LIMIT_DELAY_MS, {
    buyerName,
    title,
    tenderIdHint,
  });
  console.log('Enrichment:', enrichment);
  if (!enrichment) { console.log('No enrichment found'); process.exit(0); }

  await prisma.oCDSRelease.update({
    where: { ocid_date: { ocid, date: release.date } },
    data: {
      province: enrichment.province || null,
      deliveryLocation: enrichment.deliveryLocation || null,
      specialConditions: enrichment.specialConditions || null,
      contactPerson: enrichment.contactPerson || null,
      contactEmail: enrichment.contactEmail || null,
      contactTelephone: enrichment.contactTelephone || null,
      briefingDate: enrichment.briefingDate || null,
      briefingTime: enrichment.briefingTime || null,
      briefingVenue: enrichment.briefingVenue || null,
      briefingMeetingLink: enrichment.briefingMeetingLink || null,
      tenderType: enrichment.tenderType || release.tenderType,
      hasBriefing: typeof enrichment.hasBriefing === 'boolean' ? enrichment.hasBriefing : null,
      briefingCompulsory: typeof enrichment.briefingCompulsory === 'boolean' ? enrichment.briefingCompulsory : null,
      enrichmentDocuments: Array.isArray(enrichment.documents) ? (enrichment.documents as any) : null,

      // Phase 2: Deep Filtering Enhancement Fields
      organOfStateType: enrichment.organOfStateType || null,
      hasESubmission: typeof enrichment.hasESubmission === 'boolean' ? enrichment.hasESubmission : null,
      estimatedValueMin: enrichment.estimatedValueMin ?? null,
      estimatedValueMax: enrichment.estimatedValueMax ?? null,
      documentCount: typeof enrichment.documentCount === 'number' ? enrichment.documentCount : null,
      hasDocuments: typeof enrichment.hasDocuments === 'boolean' ? enrichment.hasDocuments : null,
      city: enrichment.city ?? null,
      district: enrichment.district ?? null,
      tenderTypeCategory: enrichment.tenderTypeCategory || null,
      dataQualityScore: typeof enrichment.dataQualityScore === 'number' ? enrichment.dataQualityScore : null,
      municipalityType: enrichment.municipalityType ?? null,
      departmentLevel: enrichment.departmentLevel ?? null,
      enrichedAt: new Date(),
    }
  });
  console.log('✅ DB updated for', ocid);
  console.log('\n📊 Phase 2 Fields:');
  console.log('  - Organ Type:', enrichment.organOfStateType || 'N/A');
  console.log('  - E-Submission:', enrichment.hasESubmission ? 'Yes' : 'No');
  console.log('  - Estimated Value:', enrichment.estimatedValueMin ? `R${enrichment.estimatedValueMin.toLocaleString()}` : 'N/A');
  console.log('  - Documents:', enrichment.documentCount || 0);
  console.log('  - City:', enrichment.city || 'N/A');
  console.log('  - District:', enrichment.district || 'N/A');
  console.log('  - Tender Type:', enrichment.tenderTypeCategory || 'N/A');
  console.log('  - Quality Score:', enrichment.dataQualityScore || 'N/A');
}

main().catch((e)=>{ console.error(e); process.exit(1); });
