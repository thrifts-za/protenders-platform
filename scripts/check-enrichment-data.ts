import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Phase 2 enrichment data coverage...\n');

  // Total tenders
  const totalTenders = await prisma.oCDSRelease.count();
  console.log(`Total tenders in database: ${totalTenders}`);

  // Count tenders with each enrichment field
  const enrichmentCounts = await Promise.all([
    prisma.oCDSRelease.count({ where: { province: { not: null } } }),
    prisma.oCDSRelease.count({ where: { detailedCategory: { not: null } } }),
    prisma.oCDSRelease.count({ where: { contactEmail: { not: null } } }),
    prisma.oCDSRelease.count({ where: { contactPerson: { not: null } } }),
    prisma.oCDSRelease.count({ where: { contactTelephone: { not: null } } }),
    prisma.oCDSRelease.count({ where: { deliveryLocation: { not: null } } }),
    prisma.oCDSRelease.count({ where: { hasBriefing: true } }),
    prisma.oCDSRelease.count({ where: { briefingDate: { not: null } } }),
    prisma.oCDSRelease.count({ where: { specialConditions: { not: null } } }),
    prisma.oCDSRelease.count({ where: { enrichmentDocuments: { not: null } } }),
  ]);

  const [province, detailedCategory, contactEmail, contactPerson, contactTelephone,
         deliveryLocation, hasBriefing, briefingDate, specialConditions, enrichmentDocuments] = enrichmentCounts;

  console.log('\nEnrichment Field Coverage:');
  console.log(`  Province: ${province} (${((province/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Detailed Category: ${detailedCategory} (${((detailedCategory/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Contact Email: ${contactEmail} (${((contactEmail/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Contact Person: ${contactPerson} (${((contactPerson/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Contact Telephone: ${contactTelephone} (${((contactTelephone/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Delivery Location: ${deliveryLocation} (${((deliveryLocation/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Has Briefing: ${hasBriefing} (${((hasBriefing/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Briefing Date: ${briefingDate} (${((briefingDate/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Special Conditions: ${specialConditions} (${((specialConditions/totalTenders)*100).toFixed(1)}%)`);
  console.log(`  Enrichment Documents: ${enrichmentDocuments} (${((enrichmentDocuments/totalTenders)*100).toFixed(1)}%)`);

  // Get sample enriched tender
  console.log('\n\nSample Enriched Tender (Recent):');
  const sampleTender = await prisma.oCDSRelease.findFirst({
    where: {
      detailedCategory: { not: null },
      province: { not: null },
    },
    orderBy: { enrichedAt: 'desc' },
    select: {
      ocid: true,
      tenderTitle: true,
      province: true,
      detailedCategory: true,
      contactEmail: true,
      contactPerson: true,
      deliveryLocation: true,
      hasBriefing: true,
      briefingDate: true,
      briefingVenue: true,
      specialConditions: true,
      enrichedAt: true,
    },
  });

  if (sampleTender) {
    console.log(`OCID: ${sampleTender.ocid}`);
    console.log(`Title: ${sampleTender.tenderTitle?.slice(0, 60)}...`);
    console.log(`Province: ${sampleTender.province}`);
    console.log(`Detailed Category: ${sampleTender.detailedCategory}`);
    console.log(`Contact: ${sampleTender.contactPerson || 'N/A'} (${sampleTender.contactEmail || 'N/A'})`);
    console.log(`Delivery Location: ${sampleTender.deliveryLocation || 'N/A'}`);
    console.log(`Has Briefing: ${sampleTender.hasBriefing ? 'Yes' : 'No'}`);
    if (sampleTender.briefingDate) {
      console.log(`Briefing Date: ${sampleTender.briefingDate}`);
      console.log(`Briefing Venue: ${sampleTender.briefingVenue || 'N/A'}`);
    }
    console.log(`Special Conditions: ${sampleTender.specialConditions ? 'Yes' : 'No'}`);
    console.log(`Enriched At: ${sampleTender.enrichedAt?.toISOString() || 'N/A'}`);
  }

  // Check recent tenders (last 7 days) enrichment status
  console.log('\n\nRecent Tenders (Last 7 Days) Enrichment Status:');
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTotal = await prisma.oCDSRelease.count({
    where: { publishedAt: { gte: sevenDaysAgo } }
  });

  const recentEnriched = await prisma.oCDSRelease.count({
    where: {
      publishedAt: { gte: sevenDaysAgo },
      detailedCategory: { not: null }
    }
  });

  console.log(`  Total recent tenders: ${recentTotal}`);
  console.log(`  Enriched recent tenders: ${recentEnriched} (${((recentEnriched/recentTotal)*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
