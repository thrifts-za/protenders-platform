/**
 * Submit URLs to IndexNow for instant search engine indexing
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow.ts
 *   npx tsx scripts/submit-indexnow.ts --env production
 */

const INDEXNOW_KEY = '0b1263b8ed06431aae2a05fc49502518';
const SITE_URL = 'https://www.protenders.co.za';

async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: 'www.protenders.co.za',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  // Submit to multiple search engines
  const engines = [
    { name: 'IndexNow', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
  ];

  console.log(`\n📤 Submitting ${urls.length} URLs to search engines...\n`);

  for (const engine of engines) {
    try {
      const response = await fetch(engine.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ ${engine.name}: Success (${response.status})`);
      } else {
        const text = await response.text();
        console.log(`⚠️  ${engine.name}: ${response.status} - ${text || 'No response'}`);
      }
    } catch (error) {
      console.error(`❌ ${engine.name}: Failed -`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n✨ Submission complete!\n`);
}

async function main() {
  console.log('🚀 IndexNow URL Submission');
  console.log('==========================\n');

  // Important pages to index
  const importantUrls = [
    // Homepage
    `${SITE_URL}`,

    // Main pages
    `${SITE_URL}/search`,
    `${SITE_URL}/closing-soon`,
    `${SITE_URL}/latest`,
    `${SITE_URL}/tenders`,
    `${SITE_URL}/opportunities`,
    `${SITE_URL}/etenders`,

    // Browse pages
    `${SITE_URL}/provinces`,
    `${SITE_URL}/categories`,

    // Province pages
    `${SITE_URL}/province/gauteng`,
    `${SITE_URL}/province/western-cape`,
    `${SITE_URL}/province/kwazulu-natal`,
    `${SITE_URL}/province/eastern-cape`,
    `${SITE_URL}/province/limpopo`,
    `${SITE_URL}/province/mpumalanga`,
    `${SITE_URL}/province/north-west`,
    `${SITE_URL}/province/northern-cape`,
    `${SITE_URL}/province/free-state`,

    // Category pages
    `${SITE_URL}/category/construction`,
    `${SITE_URL}/category/it-services`,
    `${SITE_URL}/category/consulting`,
    `${SITE_URL}/category/security-services`,
    `${SITE_URL}/category/cleaning-services`,
    `${SITE_URL}/category/supply-and-delivery`,

    // eTenders pages
    `${SITE_URL}/etenders/gauteng`,
    `${SITE_URL}/etenders/western-cape`,
    `${SITE_URL}/etenders/kwazulu-natal`,

    // Static pages
    `${SITE_URL}/about`,
    `${SITE_URL}/how-it-works`,
    `${SITE_URL}/faq`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/insights`,
    `${SITE_URL}/resources`,
    `${SITE_URL}/glossary`,
    `${SITE_URL}/public-sector-tenders`,
  ];

  // Submit in batches of 100 (IndexNow limit is 10,000)
  const batchSize = 100;
  for (let i = 0; i < importantUrls.length; i += batchSize) {
    const batch = importantUrls.slice(i, i + batchSize);
    await submitToIndexNow(batch);

    // Wait 1 second between batches to avoid rate limiting
    if (i + batchSize < importantUrls.length) {
      console.log('⏳ Waiting 1 second before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('✅ All URLs submitted successfully!');
  console.log(`\nTotal URLs indexed: ${importantUrls.length}`);
  console.log('\nNote: It may take a few hours for search engines to process these URLs.\n');
}

main().catch(console.error);
