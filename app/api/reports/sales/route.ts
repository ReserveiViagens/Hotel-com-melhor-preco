import { NextRequest, NextResponse } from 'next/server'

interface ReportFilters {
  startDate?: string
  endDate?: string
  gateway?: string
  status?: string
  hotel?: string
}

interface SalesReport {
  totalRevenue: number
  totalReservations: number
  averageTicket: number
  gatewayBreakdown: {
    [key: string]: {
      count: number
      revenue: number
      percentage: number
    }
  }
  statusBreakdown: {
    [key: string]: {
      count: number
      revenue: number
      percentage: number
    }
  }
  dailyData: {
    date: string
    revenue: number
    reservations: number
  }[]
  topHotels: {
    name: string
    reservations: number
    revenue: number
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: ReportFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      gateway: searchParams.get('gateway') || undefined,
      status: searchParams.get('status') || undefined,
      hotel: searchParams.get('hotel') || undefined
    }
    
    // Gerar relatório baseado nos filtros
    const report = await generateSalesReport(filters)
    
    return NextResponse.json({
      success: true,
      report,
      filters,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

async function generateSalesReport(filters: ReportFilters): Promise<SalesReport> {
  // Aqui você buscaria os dados reais do banco de dados
  // Por enquanto, usando dados mock para demonstração
  
  const mockData = generateMockSalesData(filters)
  
  // Calcular totais
  const totalRevenue = mockData.reduce((sum, item) => sum + item.amount, 0)
  const totalReservations = mockData.length
  const averageTicket = totalReservations > 0 ? totalRevenue / totalReservations : 0
  
  // Breakdown por gateway
  const gatewayBreakdown = calculateGatewayBreakdown(mockData)
  
  // Breakdown por status
  const statusBreakdown = calculateStatusBreakdown(mockData)
  
  // Dados diários
  const dailyData = calculateDailyData(mockData)
  
  // Top hotéis
  const topHotels = calculateTopHotels(mockData)
  
  return {
    totalRevenue,
    totalReservations,
    averageTicket,
    gatewayBreakdown,
    statusBreakdown,
    dailyData,
    topHotels
  }
}

function generateMockSalesData(filters: ReportFilters) {
  // Dados mock para demonstração
  const mockReservations = [
    {
      id: '1',
      amount: 1500,
      gateway: 'mercadoPago',
      status: 'confirmada',
      hotel: 'Spazzio DiRoma Hotel',
      date: '2025-01-20'
    },
    {
      id: '2',
      amount: 2000,
      gateway: 'pagarme',
      status: 'confirmada',
      hotel: 'Piazza DiRoma Hotel',
      date: '2025-01-21'
    },
    {
      id: '3',
      amount: 1200,
      gateway: 'stripe',
      status: 'andamento',
      hotel: 'Spazzio DiRoma Hotel',
      date: '2025-01-22'
    },
    {
      id: '4',
      amount: 1800,
      gateway: 'stone',
      status: 'confirmada',
      hotel: 'Lagoa Eco Towers Hotel',
      date: '2025-01-23'
    }
  ]
  
  // Aplicar filtros
  return mockReservations.filter(item => {
    if (filters.gateway && item.gateway !== filters.gateway) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.hotel && item.hotel !== filters.hotel) return false
    if (filters.startDate && item.date < filters.startDate) return false
    if (filters.endDate && item.date > filters.endDate) return false
    return true
  })
}

function calculateGatewayBreakdown(data: any[]) {
  const breakdown: { [key: string]: { count: number; revenue: number; percentage: number } } = {}
  
  data.forEach(item => {
    if (!breakdown[item.gateway]) {
      breakdown[item.gateway] = { count: 0, revenue: 0, percentage: 0 }
    }
    breakdown[item.gateway].count++
    breakdown[item.gateway].revenue += item.amount
  })
  
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0)
  
  Object.keys(breakdown).forEach(gateway => {
    breakdown[gateway].percentage = totalRevenue > 0 ? 
      (breakdown[gateway].revenue / totalRevenue) * 100 : 0
  })
  
  return breakdown
}

function calculateStatusBreakdown(data: any[]) {
  const breakdown: { [key: string]: { count: number; revenue: number; percentage: number } } = {}
  
  data.forEach(item => {
    if (!breakdown[item.status]) {
      breakdown[item.status] = { count: 0, revenue: 0, percentage: 0 }
    }
    breakdown[item.status].count++
    breakdown[item.status].revenue += item.amount
  })
  
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0)
  
  Object.keys(breakdown).forEach(status => {
    breakdown[status].percentage = totalRevenue > 0 ? 
      (breakdown[status].revenue / totalRevenue) * 100 : 0
  })
  
  return breakdown
}

function calculateDailyData(data: any[]) {
  const dailyMap: { [key: string]: { revenue: number; reservations: number } } = {}
  
  data.forEach(item => {
    if (!dailyMap[item.date]) {
      dailyMap[item.date] = { revenue: 0, reservations: 0 }
    }
    dailyMap[item.date].revenue += item.amount
    dailyMap[item.date].reservations++
  })
  
  return Object.keys(dailyMap).map(date => ({
    date,
    revenue: dailyMap[date].revenue,
    reservations: dailyMap[date].reservations
  })).sort((a, b) => a.date.localeCompare(b.date))
}

function calculateTopHotels(data: any[]) {
  const hotelMap: { [key: string]: { reservations: number; revenue: number } } = {}
  
  data.forEach(item => {
    if (!hotelMap[item.hotel]) {
      hotelMap[item.hotel] = { reservations: 0, revenue: 0 }
    }
    hotelMap[item.hotel].reservations++
    hotelMap[item.hotel].revenue += item.amount
  })
  
  return Object.keys(hotelMap).map(hotel => ({
    name: hotel,
    reservations: hotelMap[hotel].reservations,
    revenue: hotelMap[hotel].revenue
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
}

// Endpoint para exportar relatório em CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters, format = 'csv' } = body
    
    const report = await generateSalesReport(filters)
    
    if (format === 'csv') {
      const csvData = generateCSVReport(report)
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      report
    })
    
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function generateCSVReport(report: SalesReport): string {
  const csvRows = []
  
  // Header
  csvRows.push('Relatório de Vendas - Reservei Viagens')
  csvRows.push('')
  csvRows.push(`Total de Receita,R$ ${report.totalRevenue.toFixed(2)}`)
  csvRows.push(`Total de Reservas,${report.totalReservations}`)
  csvRows.push(`Ticket Médio,R$ ${report.averageTicket.toFixed(2)}`)
  csvRows.push('')
  
  // Gateway breakdown
  csvRows.push('Breakdown por Gateway')
  csvRows.push('Gateway,Quantidade,Receita,Percentual')
  Object.entries(report.gatewayBreakdown).forEach(([gateway, data]) => {
    csvRows.push(`${gateway},${data.count},R$ ${data.revenue.toFixed(2)},${data.percentage.toFixed(2)}%`)
  })
  csvRows.push('')
  
  // Status breakdown
  csvRows.push('Breakdown por Status')
  csvRows.push('Status,Quantidade,Receita,Percentual')
  Object.entries(report.statusBreakdown).forEach(([status, data]) => {
    csvRows.push(`${status},${data.count},R$ ${data.revenue.toFixed(2)},${data.percentage.toFixed(2)}%`)
  })
  
  return csvRows.join('\n')
} 