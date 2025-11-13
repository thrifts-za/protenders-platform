/**
 * Universal PowerBI Data Fetcher
 *
 * Fetches data from National Treasury's PowerBI dashboard using any payload file.
 * Handles pagination automatically and saves raw responses.
 *
 * Usage: npx tsx scripts/powerbi/fetch_powerbi_data.ts <payload-name>
 * Example: npx tsx scripts/powerbi/fetch_powerbi_data.ts demographic_timeseries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PowerBI API Configuration
const ENDPOINT = 'https://wabi-north-europe-l-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true';
const RESOURCE_KEY = '4112cc95-bcc9-4702-96db-26c9dd801c08';

// Configuration
const MAX_PAGES = 100; // Safety limit for pagination
const REQUEST_DELAY_MS = 1000; // 1 second between requests

interface FetchOptions {
  payloadName: string;
  maxPages?: number;
  delayMs?: number;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single page from PowerBI API
 */
async function fetchPage(
  payload: any,
  pageNumber: number,
  outputDir: string,
  continuationToken?: string
): Promise<{ data: any; nextToken: string | null; summary: any }> {
  console.log(`\n[Page ${pageNumber}] ${continuationToken ? 'Continuing...' : 'Initial request'}`);

  // Deep clone payload
  const requestPayload = structuredClone(payload);

  // Add continuation token if present
  if (continuationToken) {
    requestPayload.queries[0].continuationToken = continuationToken;
  }

  // Make request
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://app.powerbi.com',
      'Referer': 'https://app.powerbi.com/',
      'x-powerbi-resourcekey': RESOURCE_KEY,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    body: JSON.stringify(requestPayload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} on page ${pageNumber}: ${text}`);
  }

  const json = await response.json();

  // Save raw response
  const filename = `page_${String(pageNumber).padStart(4, '0')}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(json, null, 2));

  // Extract metadata
  const result = json.results?.[0];
  const data = result?.result?.data;

  // Check for continuation token
  const nextToken = json.continuationToken ||
                    result?.result?.data?.continuationToken ||
                    data?.dsr?.DS?.[0]?.continuationToken ||
                    null;

  // Extract summary info
  const summary = {
    visualId: requestPayload.queries?.[0]?.ApplicationContext?.Sources?.[0]?.VisualId,
    hasDescriptor: !!data?.descriptor,
    hasData: !!data?.dsr?.DS,
    dataSetCount: data?.dsr?.DS?.length || 0,
    timestamp: data?.timestamp,
    fromCache: data?.fromCache
  };

  console.log(`[Page ${pageNumber}] ✓ Saved ${filename}`);
  console.log(`  DataSets: ${summary.dataSetCount} | Cache: ${summary.fromCache} | Next: ${!!nextToken}`);

  return { data: json, nextToken, summary };
}

/**
 * Main fetch function
 */
async function fetchPowerBIData(options: FetchOptions): Promise<void> {
  const { payloadName, maxPages = MAX_PAGES, delayMs = REQUEST_DELAY_MS } = options;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Universal PowerBI Data Fetcher');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Payload: ${payloadName}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Load payload file
  const payloadFile = path.join(__dirname, 'payloads', `${payloadName}.json`);
  if (!fs.existsSync(payloadFile)) {
    throw new Error(`Payload file not found: ${payloadFile}`);
  }

  const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
  const visualId = payload.queries?.[0]?.ApplicationContext?.Sources?.[0]?.VisualId;

  console.log(`Visual ID: ${visualId}\n`);

  // Create output directory
  const outputDir = path.join(__dirname, 'raw_pages', payloadName);
  fs.mkdirSync(outputDir, { recursive: true });

  // Check for existing pages
  const existingPages = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('page_') && f.endsWith('.json'))
    .length;

  if (existingPages > 0) {
    console.log(`⚠️  Found ${existingPages} existing pages in ${outputDir}`);
    console.log('   Delete the directory to re-fetch.\n');
    return;
  }

  // Start fetching
  let currentToken: string | null = null;
  let pageNumber = 1;
  const summaries: any[] = [];

  console.log('Starting extraction...\n');

  while (pageNumber <= maxPages) {
    try {
      const { nextToken, summary } = await fetchPage(payload, pageNumber, outputDir, currentToken);

      summaries.push(summary);

      if (!nextToken) {
        console.log('\n✓ Reached last page (no continuation token)');
        break;
      }

      currentToken = nextToken;
      pageNumber++;

      // Rate limiting
      if (pageNumber <= maxPages) {
        await sleep(delayMs);
      }
    } catch (error) {
      console.error(`\n✗ Error on page ${pageNumber}:`, error);
      throw error;
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Extraction Complete');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Payload: ${payloadName}`);
  console.log(`Visual ID: ${visualId}`);
  console.log(`Total pages fetched: ${pageNumber}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('\nNext step: Build decoder to parse the data');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// CLI execution
const payloadName = process.argv[2];

if (!payloadName) {
  console.error('Usage: npx tsx scripts/powerbi/fetch_powerbi_data.ts <payload-name>');
  console.error('\nAvailable payloads:');
  console.error('  - demographic_timeseries');
  console.error('  - pppfa_categories');
  console.error('  - supplier_classification');
  console.error('  - smme_breakdown');
  console.error('  - transactions_detail');
  process.exit(1);
}

fetchPowerBIData({ payloadName }).catch(error => {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
});
