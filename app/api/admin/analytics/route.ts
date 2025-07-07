import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Verificar token JWT
function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, (process.env as any).JWT_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Obter dados de analytics
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'last30days';
    const metric = searchParams.get('metric');

    // Simular dados de analytics baseados no período
    const getDateRange = (range: string) => {
      const now = new Date();
      switch (range) {
        case 'today':
          return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return { start: new Date(yesterday.setHours(0, 0, 0, 0)), end: new Date(yesterday.setHours(23, 59, 59, 999)) };
        case 'last7days':
          const week = new Date(now);
          week.setDate(week.getDate() - 7);
          return { start: week, end: new Date() };
        case 'last30days':
          const month = new Date(now);
          month.setDate(month.getDate() - 30);
          return { start: month, end: new Date() };
        case 'last90days':
          const quarter = new Date(now);
          quarter.setDate(quarter.getDate() - 90);
          return { start: quarter, end: new Date() };
        default:
          return { start: new Date(now.setDate(now.getDate() - 30)), end: new Date() };
      }
    };

    const { start, end } = getDateRange(dateRange);

    // Dados mockados de analytics
    const analyticsData = {
      overview: {
        totalUsers: 12450,
        totalRevenue: 1245000,
        totalBookings: 3420,
        conversionRate: 3.2,
        avgOrderValue: 364.12,
        returningCustomers: 4280,
        newCustomers: 8170,
        churnRate: 12.5,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      trends: generateTrendData(dateRange),
      demographics: {
        ageGroups: [
          { range: '18-24', count: 2180, percentage: 17.5 },
          { range: '25-34', count: 4240, percentage: 34.1 },
          { range: '35-44', count: 3680, percentage: 29.6 },
          { range: '45-54', count: 1850, percentage: 14.9 },
          { range: '55+', count: 500, percentage: 4.0 }
        ],
        genders: [
          { type: 'Feminino', count: 7320, percentage: 58.8 },
          { type: 'Masculino', count: 4890, percentage: 39.3 },
          { type: 'Outro', count: 240, percentage: 1.9 }
        ],
        locations: [
          { city: 'São Paulo', state: 'SP', count: 2840, percentage: 22.8 },
          { city: 'Rio de Janeiro', state: 'RJ', count: 1920, percentage: 15.4 },
          { city: 'Belo Horizonte', state: 'MG', count: 1180, percentage: 9.5 },
          { city: 'Brasília', state: 'DF', count: 980, percentage: 7.9 },
          { city: 'Salvador', state: 'BA', count: 760, percentage: 6.1 }
        ]
      },
      behavior: {
        topPages: [
          { page: '/hoteis', views: 45200, uniqueViews: 32100, avgTime: 145, bounceRate: 32.1 },
          { page: '/atracoes', views: 38900, uniqueViews: 28400, avgTime: 132, bounceRate: 28.7 },
          { page: '/promocoes', views: 31200, uniqueViews: 24800, avgTime: 98, bounceRate: 41.2 },
          { page: '/ingressos', views: 28500, uniqueViews: 21900, avgTime: 156, bounceRate: 25.8 },
          { page: '/', views: 52300, uniqueViews: 41200, avgTime: 87, bounceRate: 45.3 }
        ],
        devices: [
          { type: 'Mobile', count: 7890, percentage: 63.4 },
          { type: 'Desktop', count: 3680, percentage: 29.6 },
          { type: 'Tablet', count: 880, percentage: 7.1 }
        ],
        browsers: [
          { name: 'Chrome', count: 8240, percentage: 66.2 },
          { name: 'Safari', count: 2180, percentage: 17.5 },
          { name: 'Firefox', count: 1340, percentage: 10.8 },
          { name: 'Edge', count: 690, percentage: 5.5 }
        ],
        sources: [
          { source: 'Google Organic', count: 4890, percentage: 39.3 },
          { source: 'Direct', count: 3240, percentage: 26.0 },
          { source: 'Social Media', count: 2180, percentage: 17.5 },
          { source: 'Email', count: 1340, percentage: 10.8 },
          { source: 'Referral', count: 800, percentage: 6.4 }
        ]
      },
      bookings: {
        byType: [
          { type: 'Hotéis', count: 1890, revenue: 687000, avgValue: 363.49 },
          { type: 'Atrações', count: 980, revenue: 245000, avgValue: 250.00 },
          { type: 'Pacotes', count: 420, revenue: 234000, avgValue: 557.14 },
          { type: 'Ingressos', count: 130, revenue: 79000, avgValue: 607.69 }
        ],
        byMonth: generateMonthlyData(),
        topDestinations: [
          { destination: 'Caldas Novas', count: 890, revenue: 324000, avgStay: 3.2 },
          { destination: 'Rio Quente', count: 620, revenue: 245000, avgStay: 2.8 },
          { destination: 'Pirenópolis', count: 450, revenue: 189000, avgStay: 2.1 },
          { destination: 'Chapada dos Veadeiros', count: 380, revenue: 156000, avgStay: 4.5 },
          { destination: 'Goiânia', count: 290, revenue: 98000, avgStay: 1.8 }
        ],
        avgBookingValue: 364.12,
        bookingConversion: 3.2,
        cancellationRate: 8.5,
        leadTime: 18.5 // dias médios entre reserva e check-in
      },
      marketing: {
        campaigns: [
          { name: 'Verão 2024', impressions: 125000, clicks: 4200, conversions: 180, cost: 8500, roi: 4.2 },
          { name: 'Férias Escolares', impressions: 98000, clicks: 3800, conversions: 145, cost: 6200, roi: 3.8 },
          { name: 'Fim de Semana', impressions: 67000, clicks: 2900, conversions: 98, cost: 4100, roi: 2.9 },
          { name: 'Black Friday', impressions: 156000, clicks: 6800, conversions: 320, cost: 12000, roi: 5.1 }
        ],
        channels: [
          { channel: 'Google Ads', users: 4200, conversions: 180, cost: 8500, cpc: 2.02, cpa: 47.22 },
          { channel: 'Facebook Ads', users: 3800, conversions: 145, cost: 6200, cpc: 1.63, cpa: 42.76 },
          { channel: 'Instagram Ads', users: 2900, conversions: 98, cost: 4100, cpc: 1.41, cpa: 41.84 },
          { channel: 'Email Marketing', users: 1800, conversions: 85, cost: 500, cpc: 0.28, cpa: 5.88 }
        ],
        roi: 4.2,
        cac: 47.22,
        ltv: 890.45,
        attributionModel: 'last-click'
      },
      realTime: {
        activeUsers: Math.floor(Math.random() * 300) + 150,
        currentBookings: Math.floor(Math.random() * 20) + 5,
        revenueToday: Math.floor(Math.random() * 50000) + 20000,
        topPages: [
          { page: '/hoteis', activeUsers: Math.floor(Math.random() * 100) + 50 },
          { page: '/promocoes', activeUsers: Math.floor(Math.random() * 80) + 30 },
          { page: '/atracoes', activeUsers: Math.floor(Math.random() * 60) + 20 },
          { page: '/', activeUsers: Math.floor(Math.random() * 40) + 10 }
        ],
        recentActivity: generateRecentActivity()
      }
    };

    // Se um métrica específica foi solicitada, retornar apenas ela
    if (metric && analyticsData[metric]) {
      return NextResponse.json(analyticsData[metric]);
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para gerar dados de tendência
function generateTrendData(dateRange: string) {
  const days = dateRange === 'last7days' ? 7 : dateRange === 'last30days' ? 30 : 90;
  const trends = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    trends.push({
      period: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 500) + 800,
      revenue: Math.floor(Math.random() * 50000) + 100000,
      bookings: Math.floor(Math.random() * 100) + 200,
      change: (Math.random() - 0.5) * 40 // -20% a +20%
    });
  }
  
  return trends;
}

// Função para gerar dados mensais
function generateMonthlyData() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const monthlyData = [];
  
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    monthlyData.push({
      month: months[monthIndex],
      count: Math.floor(Math.random() * 200) + 250,
      revenue: Math.floor(Math.random() * 100000) + 80000,
      avgValue: Math.floor(Math.random() * 200) + 300
    });
  }
  
  return monthlyData;
}

// Função para gerar atividade recente
function generateRecentActivity() {
  const activities = [
    { type: 'booking', description: 'Nova reserva de hotel em Caldas Novas' },
    { type: 'registration', description: 'Novo usuário cadastrado' },
    { type: 'booking', description: 'Reserva de ingresso para Hot Park' },
    { type: 'payment', description: 'Pagamento confirmado - R$ 1.240' },
    { type: 'booking', description: 'Reserva de pacote família completa' },
    { type: 'review', description: 'Nova avaliação 5 estrelas' },
    { type: 'cancellation', description: 'Cancelamento de reserva' },
    { type: 'payment', description: 'Pagamento PIX processado' }
  ];
  
  return activities.slice(0, 5).map((activity, index) => ({
    ...activity,
    timestamp: new Date(Date.now() - (index * 60000 * Math.random() * 30)).toISOString()
  }));
} 