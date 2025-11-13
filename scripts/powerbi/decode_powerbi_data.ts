/**
 * Universal PowerBI Response Decoder
 *
 * Decodes PowerBI compact encoding to extract actual data values.
 * Handles value dictionaries, groupings, and measures.
 *
 * Usage: npx tsx scripts/powerbi/decode_powerbi_data.ts <dataset-name>
 * Example: npx tsx scripts/powerbi/decode_powerbi_data.ts pppfa_categories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PowerBIResponse {
  results?: Array<{
    result?: {
      data?: {
        descriptor?: {
          Select?: Array<{
            Kind?: number;
            Name?: string;
            Value?: string;
          }>;
        };
        dsr?: {
          DS?: Array<{
            PH?: Array<{
              DM0?: Array<any>;
            }>;
            ValueDicts?: Record<string, any[]>;
            IC?: boolean;
            N?: boolean;
          }>;
        };
      };
    };
  }>;
}

/**
 * Decode a PowerBI response to extract data
 */
function decodePowerBIResponse(response: PowerBIResponse): any[] {
  const result = response.results?.[0];
  const data = result?.result?.data;

  if (!data) {
    throw new Error('No data found in response');
  }

  const descriptor = data.descriptor;
  const ds = data.dsr?.DS?.[0];

  if (!ds) {
    throw new Error('No dataset found in response');
  }

  const rows = ds.PH?.[0]?.DM0;
  const valueDicts = ds.ValueDicts || {};

  if (!rows || rows.length === 0) {
    console.warn('No rows found in response');
    return [];
  }

  console.log(`Found ${rows.length} rows`);
  console.log(`Value dictionaries: ${Object.keys(valueDicts).join(', ') || 'none'}`);

  // Get column names from descriptor
  const columns = descriptor?.Select?.map((col, idx) => ({
    name: col?.Name || `Column_${idx}`,
    kind: col?.Kind,
    value: col?.Value
  })) || [];

  console.log(`Columns: ${columns.map(c => c.name).join(', ')}`);

  // Decode each row
  const decodedRows: any[] = [];

  for (const row of rows) {
    const decodedRow: any = {};

    // Process each field in the row
    for (const [key, value] of Object.entries(row)) {
      if (key === 'S') continue; // Skip metadata

      // Check if this is a dictionary reference (e.g., G0, M0, etc.)
      if (typeof value === 'number' && valueDicts[`D${key.substring(1)}`]) {
        // Dereference from value dictionary
        const dictKey = `D${key.substring(1)}`;
        const dictValue = valueDicts[dictKey][value];
        decodedRow[key] = dictValue;
      } else if (typeof value === 'string') {
        // String value (might have quotes)
        decodedRow[key] = value.replace(/^'|'$/g, '');
      } else {
        // Direct value
        decodedRow[key] = value;
      }
    }

    decodedRows.push(decodedRow);
  }

  return decodedRows;
}

/**
 * Decode a dataset
 */
async function decodeDataset(datasetName: string): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PowerBI Response Decoder');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Dataset: ${datasetName}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Load raw data
  const rawDir = path.join(__dirname, 'raw_pages', datasetName);
  const rawFiles = fs.readdirSync(rawDir)
    .filter(f => f.startsWith('page_') && f.endsWith('.json'))
    .sort();

  if (rawFiles.length === 0) {
    throw new Error(`No raw pages found in ${rawDir}`);
  }

  console.log(`Found ${rawFiles.length} raw page(s)\n`);

  // Decode all pages
  const allDecodedRows: any[] = [];

  for (const rawFile of rawFiles) {
    console.log(`\nDecoding ${rawFile}...`);

    const rawPath = path.join(rawDir, rawFile);
    const response: PowerBIResponse = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

    try {
      const decodedRows = decodePowerBIResponse(response);
      allDecodedRows.push(...decodedRows);

      console.log(`✓ Decoded ${decodedRows.length} rows from ${rawFile}`);

      // Show sample of first file
      if (rawFile === rawFiles[0] && decodedRows.length > 0) {
        console.log('\nSample data (first 3 rows):');
        console.log(JSON.stringify(decodedRows.slice(0, 3), null, 2));
      }
    } catch (error) {
      console.error(`✗ Error decoding ${rawFile}:`, error);
      throw error;
    }
  }

  // Save decoded data
  const decodedDir = path.join(__dirname, 'decoded');
  fs.mkdirSync(decodedDir, { recursive: true });

  const jsonPath = path.join(decodedDir, `${datasetName}.json`);
  const csvPath = path.join(decodedDir, `${datasetName}.csv`);

  // Save as JSON
  fs.writeFileSync(jsonPath, JSON.stringify(allDecodedRows, null, 2));
  console.log(`\n✓ Saved JSON: ${jsonPath}`);

  // Save as CSV (if rows exist)
  if (allDecodedRows.length > 0) {
    const headers = Object.keys(allDecodedRows[0]);
    const csvLines = [
      headers.join(','),
      ...allDecodedRows.map(row =>
        headers.map(h => {
          const value = row[h];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ];

    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`✓ Saved CSV: ${csvPath}`);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Decoding Complete');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Dataset: ${datasetName}`);
  console.log(`Total rows decoded: ${allDecodedRows.length}`);
  console.log(`Output files:`);
  console.log(`  - JSON: ${jsonPath}`);
  console.log(`  - CSV: ${csvPath}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// CLI execution
const datasetName = process.argv[2];

if (!datasetName) {
  console.error('Usage: npx tsx scripts/powerbi/decode_powerbi_data.ts <dataset-name>');
  console.error('\nAvailable datasets:');
  console.error('  - pppfa_categories');
  console.error('  - demographic_timeseries');
  console.error('  - supplier_classification');
  console.error('  - smme_breakdown');
  process.exit(1);
}

decodeDataset(datasetName).catch(error => {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
});
