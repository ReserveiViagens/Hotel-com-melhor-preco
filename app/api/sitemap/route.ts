import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reservei-viagens.com';
    
    // Páginas estáticas
    const staticPages = [
      '',
      '/hoteis',
      '/atracoes',
      '/ingressos',
      '/promocoes',
      '/contato',
      '/cadastro',
      '/login',
      '/politica-privacidade'
    ];

    // Buscar hotéis ativos
    const hotels = await prisma.hotel.findMany({
      where: { active: true },
      select: { id: true, name: true, updatedAt: true }
    });

    // Buscar atrações ativas
    const attractions = await prisma.attraction.findMany({
      where: { active: true },
      select: { id: true, name: true, updatedAt: true }
    });

    // Buscar promoções ativas
    const promotions = await prisma.promotion.findMany({
      where: { 
        active: true,
        validUntil: { gt: new Date() }
      },
      select: { id: true, title: true, updatedAt: true }
    });

    // Gerar XML do sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${hotels.map(hotel => `
  <url>
    <loc>${baseUrl}/hoteis/${hotel.id}</loc>
    <lastmod>${hotel.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  
  ${attractions.map(attraction => `
  <url>
    <loc>${baseUrl}/atracoes/${attraction.id}</loc>
    <lastmod>${attraction.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  
  ${promotions.map(promotion => `
  <url>
    <loc>${baseUrl}/promocoes/${promotion.id}</loc>
    <lastmod>${promotion.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar sitemap' },
      { status: 500 }
    );
  }
} 