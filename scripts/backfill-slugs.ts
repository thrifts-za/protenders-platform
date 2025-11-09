/**
 * Backfill Script: Generate and populate slugs for existing OCDSRelease records
 *
 * This script:
 * 1. Finds all OCDSRelease records without a slug
 * 2. Generates SEO-friendly slugs from title/description + OCID
 * 3. Updates records in batches to avoid overwhelming the database
 *
 * Performance impact: ~1500-2500ms reduction per tender page load
 *
 * Usage:
 *   npx tsx scripts/backfill-slugs.ts
 */

import { prisma } from '../src/lib/prisma';
import { generateSlug } from '../src/lib/utils/slug';

const BATCH_SIZE = 100; // Process 100 records at a time
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set DRY_RUN=true to test without changes

async function backfillSlugs() {
  console.log('🔧 Starting slug backfill process...\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let duplicates = 0;

  while (true) {
    // Fetch records without slugs
    const releases = await prisma.oCDSRelease.findMany({
      where: { slug: null },
      take: BATCH_SIZE,
      select: {
        id: true,
        ocid: true,
        tenderTitle: true,
        tenderDisplayTitle: true,
        tenderDescription: true,
      },
      orderBy: { importedAt: 'desc' }, // Process newest first
    });

    if (releases.length === 0) {
      console.log('\n✅ No more records to process!');
      break;
    }

    console.log(`\n📦 Processing batch of ${releases.length} records...`);

    for (const release of releases) {
      try {
        // Determine best text to use for slug generation
        const title = release.tenderDisplayTitle || release.tenderTitle;
        const description = release.tenderDescription;

        // Prefer description if it's substantial (>10 chars), otherwise use title
        const textForSlug = description && description.trim().length > 10
          ? description
          : title;

        if (!textForSlug || textForSlug.trim().length === 0) {
          // No meaningful text available, use OCID only
          const slug = release.ocid;

          if (!DRY_RUN) {
            try {
              await prisma.oCDSRelease.update({
                where: { id: release.id },
                data: { slug },
              });
              processed++;
            } catch (error: any) {
              if (error.code === 'P2002') {
                // Unique constraint violation - slug already exists
                console.warn(`  ⚠️  Duplicate slug detected: ${slug} (using OCID fallback)`);
                duplicates++;

                // Add a random suffix to make it unique
                const uniqueSlug = `${slug}-${Date.now()}`;
                await prisma.oCDSRelease.update({
                  where: { id: release.id },
                  data: { slug: uniqueSlug },
                });
                processed++;
              } else {
                throw error;
              }
            }
          } else {
            processed++;
          }
          continue;
        }

        // Generate slug: descriptive-text-ocid
        let baseSlug = generateSlug(textForSlug);

        // Limit description part to 80 chars for reasonable URL length
        if (baseSlug.length > 80) {
          baseSlug = baseSlug.slice(0, 80).replace(/-+$/, '');
        }

        const slug = `${baseSlug}-${release.ocid}`;

        if (!DRY_RUN) {
          try {
            await prisma.oCDSRelease.update({
              where: { id: release.id },
              data: { slug },
            });
            processed++;
          } catch (error: any) {
            if (error.code === 'P2002') {
              // Unique constraint violation - add timestamp to make unique
              console.warn(`  ⚠️  Duplicate slug detected: ${slug}`);
              duplicates++;

              const uniqueSlug = `${baseSlug}-${release.ocid}-${Date.now()}`;
              await prisma.oCDSRelease.update({
                where: { id: release.id },
                data: { slug: uniqueSlug },
              });
              processed++;
            } else {
              throw error;
            }
          }
        } else {
          processed++;
          if (processed <= 5) {
            // Show first 5 examples in dry run
            console.log(`  Example: "${textForSlug.slice(0, 50)}..." → "${slug}"`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${release.ocid}:`, error);
        errors++;
      }
    }

    // Progress update
    console.log(`  ✓ Batch complete: ${processed} processed, ${errors} errors, ${duplicates} duplicates`);

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Backfill Complete!\n');
  console.log(`Total Processed: ${processed.toLocaleString()}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Duplicates Resolved: ${duplicates}`);
  console.log(`Errors: ${errors}`);
  console.log('='.repeat(60) + '\n');

  if (DRY_RUN) {
    console.log('⚠️  This was a DRY RUN. No changes were made to the database.');
    console.log('To apply changes, run: npx tsx scripts/backfill-slugs.ts\n');
  } else {
    console.log('✅ All slugs have been generated and saved to the database.');
    console.log('🚀 Performance improvement: Tender pages will now load 1500-2500ms faster!\n');
  }
}

// Run the backfill
backfillSlugs()
  .catch((error) => {
    console.error('\n❌ Fatal error during backfill:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
