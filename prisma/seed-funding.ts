import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// NORMALIZATION LOGIC
// ============================================================================

/**
 * Generate URL-friendly slug: /funding/{category}/{kebab-program-name}
 */
function generateSlug(category: string, programName: string): string {
  const categorySlug = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const programSlug = programName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${categorySlug}/${programSlug}`;
}

/**
 * Build full-text searchable field
 */
function buildSearchableText(program: any): string {
  const parts: string[] = [
    program.institution || '',
    program.program_name || '',
    program.category || '',
    program.funding_type || '',
    program.purpose || '',
    ...(program.funded_industries || []),
    ...(program.eligibility || []),
  ];

  return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Parse funding amount string and convert to cents
 * Handles: "R1 million", "R50,000", "R1.5m", ranges, percentages
 */
function parseAmountToCents(amountStr: string): { min?: number; max?: number } {
  const result: { min?: number; max?: number } = {};

  // Guard against undefined or empty strings
  if (!amountStr || amountStr.trim() === '') {
    return result;
  }

  // Skip percentage-based amounts
  if (amountStr.includes('%')) {
    return result;
  }

  // Match patterns like "R1 million", "R50,000", "R1.5m"
  const millionPattern = /R\s*(\d+(?:\.\d+)?)\s*million/i;
  const rangePattern = /R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:to|–|-|and)\s*R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/i;
  const upToPattern = /up to R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*million/i;
  const singlePattern = /R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/i;

  // Try "up to X million" pattern
  const upToMatch = amountStr.match(upToPattern);
  if (upToMatch && upToMatch[1]) {
    const amount = parseFloat(upToMatch[1].replace(/[,\s]/g, '')) * 1000000 * 100;
    result.max = Math.floor(amount);
    return result;
  }

  // Try range pattern first (e.g., "R1 million – R15 million")
  const rangeMatch = amountStr.match(rangePattern);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const minStr = rangeMatch[1].replace(/[,\s]/g, '');
    const maxStr = rangeMatch[2].replace(/[,\s]/g, '');

    // Check if amounts are in millions
    const minMultiplier = amountStr.toLowerCase().includes('million') ? 1000000 : 1;
    const maxMultiplier = amountStr.toLowerCase().includes('million') ? 1000000 : 1;

    result.min = Math.floor(parseFloat(minStr) * minMultiplier * 100);
    result.max = Math.floor(parseFloat(maxStr) * maxMultiplier * 100);
    return result;
  }

  // Try million pattern
  const millionMatch = amountStr.match(millionPattern);
  if (millionMatch && millionMatch[1]) {
    // Single amount in millions
    const amount = parseFloat(millionMatch[1]) * 1000000 * 100;
    result.max = Math.floor(amount);
    return result;
  }

  // Try single amount pattern
  const singleMatch = amountStr.match(singlePattern);
  if (singleMatch && singleMatch[1]) {
    const cleanAmount = singleMatch[1].replace(/[,\s]/g, '');
    const amount = parseFloat(cleanAmount) * 100;
    result.max = Math.floor(amount);
    return result;
  }

  return result;
}

/**
 * Normalize provinces - ensures all programs have province coverage
 */
function normalizeProvinces(provinces?: string[]): string[] {
  if (!provinces || provinces.length === 0 || provinces.includes('All Provinces')) {
    return [
      'Eastern Cape',
      'Free State',
      'Gauteng',
      'KwaZulu-Natal',
      'Limpopo',
      'Mpumalanga',
      'Northern Cape',
      'North West',
      'Western Cape'
    ];
  }

  // Normalize province names
  const provinceMap: Record<string, string> = {
    'EC': 'Eastern Cape',
    'FS': 'Free State',
    'GP': 'Gauteng',
    'KZN': 'KwaZulu-Natal',
    'LP': 'Limpopo',
    'MP': 'Mpumalanga',
    'NC': 'Northern Cape',
    'NW': 'North West',
    'WC': 'Western Cape',
  };

  return provinces.map(p => provinceMap[p] || p);
}

/**
 * Normalize category names
 */
function normalizeCategory(category?: string): string {
  if (!category) return 'General Business Development';

  const categoryMap: Record<string, string> = {
    'agriculture': 'Agriculture',
    'manufacturing': 'Manufacturing',
    'technology': 'Technology',
    'energy': 'Energy',
    'tourism': 'Tourism',
    'skills development': 'Skills Development',
    'property development': 'Property Development',
    'infrastructure': 'Infrastructure',
    'mining': 'Mining',
    'retail & trade': 'Retail & Trade',
    'franchise': 'Franchise',
    'export development': 'Export Development',
    'financial services': 'Financial Services',
    'general business development': 'General Business Development',
  };

  const lowerCategory = category.toLowerCase();
  return categoryMap[lowerCategory] || category;
}

/**
 * Normalize funding type
 */
function normalizeFundingType(fundingType?: string): string {
  if (!fundingType) return 'Loan';

  const typeMap: Record<string, string> = {
    'grant': 'Grant',
    'loan': 'Loan',
    'equity': 'Equity',
    'hybrid': 'Hybrid',
    'guarantee': 'Guarantee',
  };

  const lowerType = fundingType.toLowerCase();
  return typeMap[lowerType] || 'Loan';
}

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedFunding() {
  console.log('🌱 Starting funding database seed...');

  // Read the parsed funding programs
  const dataPath = path.join(process.cwd(), 'data', 'funding-programs.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Funding data file not found at: ${dataPath}`);
  }

  const rawPrograms = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📄 Loaded ${rawPrograms.length} programs from JSON`);

  // Transform and normalize
  const programs = rawPrograms.map((program: any) => {
    const category = normalizeCategory(program.category);
    const fundingType = normalizeFundingType(program.funding_type);
    const provinces = normalizeProvinces(program.provinces);
    const amounts = parseAmountToCents(program.funding_range || '');

    return {
      source: 'pdf',
      institution: program.institution,
      programName: program.program_name,
      slug: generateSlug(category, program.program_name),
      fundingType: fundingType,
      minAmount: amounts.min,
      maxAmount: amounts.max,
      amountNotes: program.funding_range,
      categories: [category],
      provinces: provinces,
      eligibility: program.eligibility || [],
      fundedIndustries: program.funded_industries || [],
      purpose: program.purpose || '',
      applyUrl: program.apply_link || '',
      contacts: program.contacts || {},
      searchableText: buildSearchableText(program),
      isActive: true,
    };
  });

  console.log(`🔄 Transformed ${programs.length} programs`);

  // Clear existing funding data
  console.log('🗑️  Clearing existing funding opportunities...');
  await prisma.fundingOpportunity.deleteMany({
    where: { source: 'pdf' }
  });

  // Insert funding opportunities
  console.log('💾 Inserting funding opportunities...');
  let successCount = 0;
  let errorCount = 0;

  for (const program of programs) {
    try {
      await prisma.fundingOpportunity.create({
        data: program
      });
      successCount++;
    } catch (error: any) {
      console.error(`❌ Error inserting ${program.programName}:`, error.message);
      errorCount++;
    }
  }

  console.log(`✅ Successfully seeded ${successCount} funding opportunities`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} programs failed to seed`);
  }

  // Print summary statistics
  const stats = await getFundingStats();
  console.log('\n📊 Funding Database Summary:');
  console.log(`  Total Programs: ${stats.total}`);
  console.log(`  By Institution:`);
  stats.byInstitution.forEach(({ institution, count }) => {
    console.log(`    ${institution}: ${count}`);
  });
  console.log(`  By Category:`);
  stats.byCategory.forEach(({ category, count }) => {
    console.log(`    ${category}: ${count}`);
  });
  console.log(`  By Funding Type:`);
  stats.byFundingType.forEach(({ fundingType, count }) => {
    console.log(`    ${fundingType}: ${count}`);
  });
}

/**
 * Get funding statistics
 */
async function getFundingStats() {
  const total = await prisma.fundingOpportunity.count();

  const byInstitution = await prisma.fundingOpportunity.groupBy({
    by: ['institution'],
    _count: true,
    orderBy: {
      _count: {
        institution: 'desc'
      }
    }
  });

  const byCategory = await prisma.$queryRaw<any[]>`
    SELECT UNNEST(categories) as category, COUNT(*) as count
    FROM "FundingOpportunity"
    GROUP BY category
    ORDER BY count DESC
  `;

  const byFundingType = await prisma.fundingOpportunity.groupBy({
    by: ['fundingType'],
    _count: true,
    orderBy: {
      _count: {
        fundingType: 'desc'
      }
    }
  });

  return {
    total,
    byInstitution: byInstitution.map(item => ({
      institution: item.institution,
      count: item._count
    })),
    byCategory: byCategory.map(item => ({
      category: item.category,
      count: Number(item.count)
    })),
    byFundingType: byFundingType.map(item => ({
      fundingType: item.fundingType,
      count: item._count
    }))
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

seedFunding()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
