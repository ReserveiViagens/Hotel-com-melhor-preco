import { NextResponse } from 'next/server'

// Usar any para evitar problemas de tipagem com Node.js
const nodeProcess = process as any

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: boolean
    memory: boolean
    disk: boolean
  }
}

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Verificações básicas de saúde
    const checks = {
      database: true, // Em produção, verificar conexão com banco
      memory: checkMemoryUsage(),
      disk: checkDiskUsage()
    }
    
    // Determinar status geral
    const isHealthy = Object.values(checks).every(check => check === true)
    
    const healthStatus: HealthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks
    }
    
    // Retornar status HTTP apropriado
    const statusCode = isHealthy ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    console.error('Erro no health check:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 })
  }
}

function checkMemoryUsage(): boolean {
  try {
    const used = process.memoryUsage()
    const totalMemory = used.heapTotal
    const usedMemory = used.heapUsed
    const memoryUsagePercent = (usedMemory / totalMemory) * 100
    
    // Considerar saudável se uso de memória < 90%
    return memoryUsagePercent < 90
  } catch (error) {
    console.error('Erro ao verificar uso de memória:', error)
    return false
  }
}

function checkDiskUsage(): boolean {
  try {
    // Em produção, você pode usar uma biblioteca como 'diskusage'
    // Por enquanto, retornando true como placeholder
    return true
  } catch (error) {
    console.error('Erro ao verificar uso de disco:', error)
    return false
  }
}

// Endpoint para health check detalhado (apenas para admins)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body
    
    // Verificar token de admin (simplificado)
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Health check detalhado
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      checks: {
        database: true,
        memory: checkMemoryUsage(),
        disk: checkDiskUsage(),
        apis: await checkAPIs()
      }
    }
    
    return NextResponse.json(detailedHealth)
    
  } catch (error) {
    console.error('Erro no health check detalhado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkAPIs(): Promise<boolean> {
  try {
    // Verificar se as APIs principais estão funcionando
    const apis = [
      '/api/payments',
      '/api/vouchers/generate',
      '/api/reports/sales'
    ]
    
    // Em produção, você pode fazer requests reais para verificar
    // Por enquanto, retornando true como placeholder
    return true
  } catch (error) {
    console.error('Erro ao verificar APIs:', error)
    return false
  }
} 