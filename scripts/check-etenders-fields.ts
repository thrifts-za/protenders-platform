#!/usr/bin/env tsx
/**
 * Check what fields are available in the eTenders API response
 */

const ETENDERS_API_BASE = 'https://secure.etenders.gov.za/home/PaginatedTenderOpportunities';

async function fetchJsonWithRetry<T>(url: string): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log('🔍 Checking eTenders API fields...\n');

  const url = `${ETENDERS_API_BASE}?draw=1&start=0&length=1&search[value]=&status=1`;

  try {
    const response = await fetchJsonWithRetry<{ data: any[] }>(url);

    if (!response.data || response.data.length === 0) {
      console.log('⚠️  No data returned from API');
      return;
    }

    const firstRecord = response.data[0];

    console.log('📋 Available fields in eTenders API response:\n');
    console.log(Object.keys(firstRecord).sort().join('\n'));

    console.log('\n\n📄 Sample record:\n');
    console.log(JSON.stringify(firstRecord, null, 2));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

main();
