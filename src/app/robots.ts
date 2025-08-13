import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/chat',
          '/analytics',
          '/profile',
          '/settings',
          '/security',
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
