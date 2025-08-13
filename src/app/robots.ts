import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/app',
          '/app/chat',
          '/app/analytics',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://breezie.io/sitemap.xml',
  }
}
