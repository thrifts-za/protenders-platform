import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/auth/',
          '/dashboard/',
          '/user/',
        ],
      },
      // Traditional Search Engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0, // No delay for Googlebot
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0, // No delay for Bingbot
      },
      {
        userAgent: 'Slurp', // Yahoo
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      // AI Search Engines & LLM Crawlers
      {
        userAgent: 'GPTBot', // ChatGPT web browsing & training
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT user-initiated requests
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'OAI-SearchBot', // OpenAI SearchGPT
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Claude-Web', // Anthropic Claude web access
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'ClaudeBot', // Anthropic Claude crawler
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'anthropic-ai', // Anthropic alternative user agent
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'YouBot', // You.com AI search
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Applebot', // Apple Siri & Spotlight
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Applebot-Extended', // Apple AI training
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Google-Extended', // Google Bard/Gemini training
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'cohere-ai', // Cohere AI
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Diffbot', // Diffbot AI knowledge graph
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'FacebookBot', // Meta AI
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ImagesiftBot', // AI image analysis
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bytespider', // ByteDance (TikTok)
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/auth/', '/dashboard/', '/user/'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://www.protenders.co.za/sitemap_index.xml',
    host: 'https://www.protenders.co.za',
  }
}
