import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reservei-viagens.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/admin/

# Disallow private areas
Disallow: /api/auth/
Disallow: /api/webhooks/

# Allow important pages
Allow: /hoteis/
Allow: /atracoes/
Allow: /ingressos/
Allow: /promocoes/

# Crawl delay (optional)
Crawl-delay: 1

# Google specific
User-agent: Googlebot
Allow: /

# Bing specific
User-agent: Bingbot
Allow: /

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
} 