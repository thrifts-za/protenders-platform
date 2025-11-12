import { prisma } from '../src/lib/prisma';

async function checkSlugs() {
  const funding = await prisma.fundingOpportunity.findMany({
    select: { slug: true, programName: true, categories: true },
    take: 15,
    orderBy: { createdAt: 'desc' }
  });

  console.log('Sample slugs from database:');
  funding.forEach((f, i) => {
    console.log(`${i + 1}. ${f.programName}`);
    console.log(`   Slug: ${f.slug}`);
    console.log(`   Categories: ${f.categories.join(', ')}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkSlugs();
