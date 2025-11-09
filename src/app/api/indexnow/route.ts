/**
 * IndexNow API Route
 * POST /api/indexnow
 *
 * Submits URLs to search engines (Bing, Yandex, etc.) for instant indexing
 * Uses IndexNow protocol for rapid URL discovery
 */

import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = '0b1263b8ed06431aae2a05fc49502518';
const SITE_URL = 'https://www.protenders.co.za';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate URLs (must be from same domain)
    const validUrls = urls.filter(url => url.startsWith(SITE_URL));

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    // Submit to IndexNow API
    const indexNowPayload = {
      host: 'www.protenders.co.za',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: validUrls,
    };

    // Submit to multiple search engines
    const engines = [
      'https://api.indexnow.org/indexnow', // IndexNow (Bing, Yandex, etc.)
      'https://www.bing.com/indexnow',     // Bing directly
      'https://yandex.com/indexnow',       // Yandex directly
    ];

    const results = await Promise.allSettled(
      engines.map(engine =>
        fetch(engine, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(indexNowPayload),
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ IndexNow: Submitted ${validUrls.length} URLs to ${successful}/${engines.length} search engines`);

    return NextResponse.json({
      success: true,
      submitted: validUrls.length,
      engines: {
        total: engines.length,
        successful,
        failed,
      },
      urls: validUrls,
    });
  } catch (error) {
    console.error('❌ IndexNow error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit URLs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
