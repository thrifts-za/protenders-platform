import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const today = new Date('2025-11-10T00:00:00Z');
  const tomorrow = new Date('2025-11-11T00:00:00Z');

  // Check all Phase 2 enhancement fields
  const todayTenders = await prisma.oCDSRelease.findMany({
    where: {
      publishedAt: { gte: today, lt: tomorrow }
    },
    select: {
      ocid: true,
      tenderTitle: true,
      organOfStateType: true,
      hasESubmission: true,
      estimatedValueMin: true,
      estimatedValueMax: true,
      documentCount: true,
      city: true,
      district: true,
      hasDocuments: true,
    }
  });

  console.log('Total tenders today:', todayTenders.length);
  console.log('\nPhase 2 Enhancement Fields Coverage:');

  const withOrganType = todayTenders.filter(t => t.organOfStateType).length;
  const withESubmission = todayTenders.filter(t => t.hasESubmission != null).length;
  const withEstimatedValue = todayTenders.filter(t => t.estimatedValueMin || t.estimatedValueMax).length;
  const withDocCount = todayTenders.filter(t => t.documentCount != null).length;
  const withCity = todayTenders.filter(t => t.city).length;
  const withDistrict = todayTenders.filter(t => t.district).length;

  console.log('organOfStateType:', withOrganType, '(' + ((withOrganType/todayTenders.length)*100).toFixed(1) + '%)');
  console.log('hasESubmission:', withESubmission, '(' + ((withESubmission/todayTenders.length)*100).toFixed(1) + '%)');
  console.log('estimatedValue:', withEstimatedValue, '(' + ((withEstimatedValue/todayTenders.length)*100).toFixed(1) + '%)');
  console.log('documentCount:', withDocCount, '(' + ((withDocCount/todayTenders.length)*100).toFixed(1) + '%)');
  console.log('city:', withCity, '(' + ((withCity/todayTenders.length)*100).toFixed(1) + '%)');
  console.log('district:', withDistrict, '(' + ((withDistrict/todayTenders.length)*100).toFixed(1) + '%)');

  console.log('\nSample tender with Phase 2 fields:');
  const sample = todayTenders[0];
  console.log('OCID:', sample.ocid);
  console.log('Title:', sample.tenderTitle?.slice(0, 50));
  console.log('organOfStateType:', sample.organOfStateType || 'NOT SET');
  console.log('hasESubmission:', sample.hasESubmission != null ? sample.hasESubmission : 'NOT SET');
  console.log('estimatedValue:', sample.estimatedValueMin || sample.estimatedValueMax ?
    (sample.estimatedValueMin || '?') + ' - ' + (sample.estimatedValueMax || '?') : 'NOT SET');
  console.log('documentCount:', sample.documentCount != null ? sample.documentCount : 'NOT SET');
  console.log('hasDocuments:', sample.hasDocuments != null ? sample.hasDocuments : 'NOT SET');
  console.log('city:', sample.city || 'NOT SET');
  console.log('district:', sample.district || 'NOT SET');
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
