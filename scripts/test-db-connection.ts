/**
 * Test Database Connection
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔌 Testing database connection to Render PostgreSQL...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Get database version
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    console.log('📊 Database version:');
    console.log(result[0].version);
    console.log();

    // Count some tables to verify schema
    const userCount = await prisma.user.count();
    const tenderCount = await prisma.tender.count();
    const ocdsReleaseCount = await prisma.oCDSRelease.count();

    console.log('📈 Current database stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Tenders: ${tenderCount}`);
    console.log(`   OCDS Releases: ${ocdsReleaseCount}`);
    console.log();

    console.log('✅ All tests passed! Prisma is configured correctly.\n');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
