/**
 * Update Funding Script
 * Phase 3: ProTender Fund Finder
 *
 * Runs all funding scrapers sequentially to update the database
 * Usage: npx tsx scripts/update-funding.ts
 *
 * NOTE: Scrapers are currently stubs. Full implementation in Phase 4.
 */

import { updateIDCFunding } from '../src/lib/scrapers/idc-scraper';
import { updateSEFAFunding } from '../src/lib/scrapers/sefa-scraper';
import { updateNEFFunding } from '../src/lib/scrapers/nef-scraper';

interface UpdateResult {
  institution: string;
  added: number;
  updated: number;
  deactivated: number;
  error?: string;
}

async function updateAllFunding() {
  console.log('🚀 Starting funding database update...\n');

  const startTime = Date.now();
  const results: UpdateResult[] = [];

  // Update IDC funding
  try {
    console.log('📊 Updating IDC funding...');
    const idcResult = await updateIDCFunding();
    results.push({
      institution: 'IDC',
      ...idcResult,
    });
  } catch (error) {
    console.error('❌ IDC update failed:', error);
    results.push({
      institution: 'IDC',
      added: 0,
      updated: 0,
      deactivated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  console.log('');

  // Update SEFA funding
  try {
    console.log('📊 Updating SEFA funding...');
    const sefaResult = await updateSEFAFunding();
    results.push({
      institution: 'SEFA',
      ...sefaResult,
    });
  } catch (error) {
    console.error('❌ SEFA update failed:', error);
    results.push({
      institution: 'SEFA',
      added: 0,
      updated: 0,
      deactivated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  console.log('');

  // Update NEF funding
  try {
    console.log('📊 Updating NEF funding...');
    const nefResult = await updateNEFFunding();
    results.push({
      institution: 'NEF',
      ...nefResult,
    });
  } catch (error) {
    console.error('❌ NEF update failed:', error);
    results.push({
      institution: 'NEF',
      added: 0,
      updated: 0,
      deactivated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 Funding Update Summary');
  console.log('='.repeat(60));
  console.log(`Duration: ${duration}s\n`);

  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  const totalDeactivated = results.reduce((sum, r) => sum + r.deactivated, 0);
  const errors = results.filter(r => r.error);

  results.forEach(result => {
    console.log(`${result.institution}:`);
    console.log(`  Added: ${result.added}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Deactivated: ${result.deactivated}`);
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    }
    console.log('');
  });

  console.log('Total:');
  console.log(`  Added: ${totalAdded}`);
  console.log(`  Updated: ${totalUpdated}`);
  console.log(`  Deactivated: ${totalDeactivated}`);
  console.log(`  Errors: ${errors.length}`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n⚠️  Some updates failed. Check logs above for details.');
    process.exit(1);
  }

  console.log('\n✅ Funding update complete!');
}

// Run the update
updateAllFunding()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
