/**
 * PowerBI Transaction Fetcher
 *
 * Fetches ALL transaction records from National Treasury's PowerBI dashboard
 * using pagination with continuationToken.
 *
 * Phase 1: FETCH ONLY - Saves raw API responses to disk
 * Phase 2: Separate decoder will parse the compact encoding
 *
 * Following Grounds.md pattern: Never hit the API twice
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PowerBI API Configuration
const ENDPOINT = 'https://wabi-north-europe-l-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true';
const RESOURCE_KEY = '4112cc95-bcc9-4702-96db-26c9dd801c08';

// Directories
const PAYLOAD_FILE = path.join(__dirname, 'payloads', 'transactions_detail.json');
const RAW_PAGES_DIR = path.join(__dirname, 'raw_pages', 'transactions');

// Configuration
const MAX_PAGES = 1000; // Safety limit (30K records / 500 per page = ~60 pages)
const REQUEST_DELAY_MS = 1000; // 1 second between requests to be respectful

interface PowerBIResponse {
  results?: Array<{
    result?: {
      data?: {
        descriptor?: any;
        dsr?: {
          DS?: Array<{
            PH?: Array<{
              DM0?: Array<any>;
            }>;
          }>;
        };
      };
    };
  }>;
  continuationToken?: string;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single page from PowerBI API
 */
async function fetchPage(continuationToken: string | null, pageNumber: number): Promise<{
  data: any;
  nextToken: string | null;
  rowCount: number;
}> {
  console.log(`\n[Page ${pageNumber}] ${continuationToken ? `Token: ${continuationToken.substring(0, 20)}...` : 'Initial request'}`);

  // Load base payload
  const basePayload = JSON.parse(fs.readFileSync(PAYLOAD_FILE, 'utf8'));

  // Deep clone and inject continuationToken
  const payload = structuredClone(basePayload);

  // Add continuationToken to the query if present
  if (continuationToken) {
    payload.queries[0].continuationToken = continuationToken;
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
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} on page ${pageNumber}: ${text}`);
  }

  const json: PowerBIResponse = await response.json();

  // Save raw response to disk
  const filename = `page_${String(pageNumber).padStart(4, '0')}.json`;
  const filepath = path.join(RAW_PAGES_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(json, null, 2));

  // Extract continuation token and row count
  // PowerBI structure: results[0].result.data.dsr.DS[0].PH[0].DM0
  let nextToken: string | null = null;
  let rowCount = 0;

  try {
    const result = json.results?.[0];
    const data = result?.result?.data;

    // Check for continuation token at various levels
    nextToken = json.continuationToken ||
                result?.result?.data?.continuationToken ||
                data?.dsr?.DS?.[0]?.continuationToken ||
                null;

    // Count rows
    const dm0 = data?.dsr?.DS?.[0]?.PH?.[0]?.DM0;
    if (dm0 && Array.isArray(dm0)) {
      rowCount = dm0.length;
    }
  } catch (error) {
    console.warn(`Warning: Could not extract metadata from page ${pageNumber}:`, error);
  }

  console.log(`[Page ${pageNumber}] ✓ Saved ${filename} | Rows: ${rowCount} | Next token: ${nextToken ? 'Yes' : 'No'}`);

  return {
    data: json,
    nextToken,
    rowCount
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PowerBI Transaction Fetcher');
  console.log('  Phase 1: Fetch and Save Raw Pages');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verify payload file exists
  if (!fs.existsSync(PAYLOAD_FILE)) {
    throw new Error(`Payload file not found: ${PAYLOAD_FILE}`);
  }

  // Ensure output directory exists
  fs.mkdirSync(RAW_PAGES_DIR, { recursive: true });

  // Check for existing pages
  const existingPages = fs.readdirSync(RAW_PAGES_DIR)
    .filter(f => f.startsWith('page_') && f.endsWith('.json'))
    .length;

  if (existingPages > 0) {
    console.log(`⚠️  Found ${existingPages} existing pages in ${RAW_PAGES_DIR}`);
    console.log('   To re-fetch, delete the directory and run again.\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>(resolve => {
      rl.question('Continue from where left off? (y/n): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      return;
    }
  }

  // Start fetching
  let currentToken: string | null = null;
  let pageNumber = existingPages + 1;
  let totalRows = 0;

  console.log('Starting extraction...\n');

  while (pageNumber <= MAX_PAGES) {
    try {
      const { nextToken, rowCount } = await fetchPage(currentToken, pageNumber);

      totalRows += rowCount;

      if (!nextToken) {
        console.log('\n✓ Reached last page (no continuation token)');
        break;
      }

      currentToken = nextToken;
      pageNumber++;

      // Rate limiting
      if (pageNumber <= MAX_PAGES) {
        await sleep(REQUEST_DELAY_MS);
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
  console.log(`Total pages fetched: ${pageNumber}`);
  console.log(`Total rows extracted: ${totalRows}`);
  console.log(`Output directory: ${RAW_PAGES_DIR}`);
  console.log('\nNext step: Run decode_transactions.ts to parse the data');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Execute
main().catch(error => {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
});
