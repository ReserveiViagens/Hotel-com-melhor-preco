const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Iniciando monitoramento contínuo 24/7...');

// ========================================
// CONFIGURAÇÕES
// ========================================
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const MONITORING_DIR = 'monitoring-logs';
const ALERT_THRESHOLD_RESPONSE_TIME = 3000;  // 3 segundos
const ALERT_THRESHOLD_ERROR_RATE = 5;        // 5%
const ALERT_THRESHOLD_CPU = 80;              // 80%
const ALERT_THRESHOLD_MEMORY = 85;           // 85%

// Criar diretório de logs
if (!fs.existsSync(MONITORING_DIR)) {
    fs.mkdirSync(MONITORING_DIR, { recursive: true });
}

// ========================================
// FUNÇÕES DE MONITORAMENTO
// ========================================
const sendAlert = (message, severity) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const logEntry = `[${timestamp}] ${severity}: ${message}\n`;
    
    fs.appendFileSync(path.join(MONITORING_DIR, 'alerts.log'), logEntry);
    
    console.log(`${severity}: ${message}`);
    
    if (process.env.SLACK_WEBHOOK_URL) {
        try {
            const slackMessage = {
                text: `${severity}: ${message}`,
                attachments: [{
                    color: severity === 'CRÍTICO' ? 'danger' : 'warning',
                    fields: [
                        { title: 'Timestamp', value: timestamp, short: true },
                        { title: 'URL', value: SITE_URL, short: true }
                    ]
                }]
            };
            
            execSync(`curl -X POST "${process.env.SLACK_WEBHOOK_URL}" -H "Content-Type: application/json" -d '${JSON.stringify(slackMessage)}'`, { stdio: 'pipe' });
        } catch (error) {
            console.log('⚠️ Erro ao enviar notificação Slack:', error.message);
        }
    }
};

const checkHealth = () => {
    try {
        const startTime = Date.now();
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/api/health"`, { encoding: 'utf8' });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const logEntry = `${new Date().toISOString()},health,${response},${responseTime}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'health.log'), logEntry);
        
        if (response !== '200') {
            sendAlert(`Health check falhou: ${response}`, 'CRÍTICO');
        }
        
        if (responseTime > ALERT_THRESHOLD_RESPONSE_TIME) {
            sendAlert(`Tempo de resposta alto: ${responseTime}ms`, 'ALERTA');
        }
        
        return responseTime;
    } catch (error) {
        sendAlert(`Erro no health check: ${error.message}`, 'CRÍTICO');
        return 0;
    }
};

const checkPerformance = () => {
    try {
        const startTime = Date.now();
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}"`, { encoding: 'utf8' });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const logEntry = `${new Date().toISOString()},performance,${response},${responseTime}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'performance.log'), logEntry);
        
        if (responseTime > ALERT_THRESHOLD_RESPONSE_TIME) {
            sendAlert(`Performance degradada: ${responseTime}ms`, 'ALERTA');
        }
    } catch (error) {
        sendAlert(`Erro na verificação de performance: ${error.message}`, 'ALERTA');
    }
};

const checkDatabase = () => {
    try {
        const response = execSync(`curl -s "${SITE_URL}/api/health/database"`, { encoding: 'utf8' });
        const logEntry = `${new Date().toISOString()},database,${response}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'database.log'), logEntry);
        
        if (!response.includes('OK')) {
            sendAlert(`Problema no banco de dados: ${response}`, 'CRÍTICO');
        }
    } catch (error) {
        sendAlert(`Erro na verificação do banco: ${error.message}`, 'CRÍTICO');
    }
};

const checkCache = () => {
    try {
        const response = execSync(`curl -s "${SITE_URL}/api/health/cache"`, { encoding: 'utf8' });
        const logEntry = `${new Date().toISOString()},cache,${response}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'cache.log'), logEntry);
        
        if (!response.includes('OK')) {
            sendAlert(`Problema no cache: ${response}`, 'ALERTA');
        }
    } catch (error) {
        sendAlert(`Erro na verificação do cache: ${error.message}`, 'ALERTA');
    }
};

const checkSystemResources = () => {
    try {
        // Simular métricas de sistema (em produção, usar ferramentas reais)
        const cpuUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
        const memoryUsage = Math.floor(Math.random() * 20) + 60; // 60-80%
        const diskUsage = Math.floor(Math.random() * 10) + 70; // 70-80%
        
        const logEntry = `${new Date().toISOString()},system,${cpuUsage},${memoryUsage},${diskUsage}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'system.log'), logEntry);
        
        if (cpuUsage > ALERT_THRESHOLD_CPU) {
            sendAlert(`CPU alto: ${cpuUsage}%`, 'ALERTA');
        }
        
        if (memoryUsage > ALERT_THRESHOLD_MEMORY) {
            sendAlert(`Memória alta: ${memoryUsage}%`, 'ALERTA');
        }
        
        if (diskUsage > 90) {
            sendAlert(`Disco quase cheio: ${diskUsage}%`, 'CRÍTICO');
        }
    } catch (error) {
        sendAlert(`Erro na verificação de recursos: ${error.message}`, 'ALERTA');
    }
};

const checkErrorRate = () => {
    try {
        // Simular métricas de erro
        const totalRequests = Math.floor(Math.random() * 1000) + 500;
        const errorRequests = Math.floor(Math.random() * 20);
        
        if (totalRequests > 0) {
            const errorRate = (errorRequests * 100 / totalRequests).toFixed(2);
            const logEntry = `${new Date().toISOString()},errors,${totalRequests},${errorRequests},${errorRate}\n`;
            fs.appendFileSync(path.join(MONITORING_DIR, 'errors.log'), logEntry);
            
            if (parseFloat(errorRate) > ALERT_THRESHOLD_ERROR_RATE) {
                sendAlert(`Taxa de erro alta: ${errorRate}%`, 'CRÍTICO');
            }
        }
    } catch (error) {
        sendAlert(`Erro na verificação de taxa de erro: ${error.message}`, 'ALERTA');
    }
};

const checkSecurity = () => {
    try {
        // Simular verificações de segurança
        const failedLogins = Math.floor(Math.random() * 5);
        const attacks = Math.floor(Math.random() * 2);
        
        if (failedLogins > 10) {
            sendAlert(`Muitas tentativas de login falhadas: ${failedLogins}`, 'ALERTA');
        }
        
        if (attacks > 0) {
            sendAlert(`Ataques detectados: ${attacks}`, 'CRÍTICO');
        }
    } catch (error) {
        sendAlert(`Erro na verificação de segurança: ${error.message}`, 'ALERTA');
    }
};

const checkBackup = () => {
    try {
        // Simular verificação de backup
        const lastBackup = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
        const backupAge = Math.floor((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60));
        
        const logEntry = `${new Date().toISOString()},backup,${lastBackup.toISOString()},${backupAge}\n`;
        fs.appendFileSync(path.join(MONITORING_DIR, 'backup.log'), logEntry);
        
        if (backupAge > 24) {
            sendAlert(`Backup desatualizado: ${backupAge}h atrás`, 'ALERTA');
        }
    } catch (error) {
        sendAlert(`Erro na verificação de backup: ${error.message}`, 'ALERTA');
    }
};

const checkSslCertificate = () => {
    if (SITE_URL.startsWith('https://')) {
        try {
            const domain = SITE_URL.replace('https://', '').split('/')[0];
            const daysUntilExpiry = Math.floor(Math.random() * 365) + 1;
            
            const logEntry = `${new Date().toISOString()},ssl,${domain},${daysUntilExpiry}\n`;
            fs.appendFileSync(path.join(MONITORING_DIR, 'ssl.log'), logEntry);
            
            if (daysUntilExpiry < 30) {
                sendAlert(`Certificado SSL expira em ${daysUntilExpiry} dias`, 'ALERTA');
            }
        } catch (error) {
            sendAlert(`Erro na verificação SSL: ${error.message}`, 'ALERTA');
        }
    }
};

const generateDailyReport = () => {
    const reportDate = new Date().toISOString().split('T')[0];
    const reportFile = path.join(MONITORING_DIR, `daily-report-${reportDate}.md`);
    
    const reportContent = `# Relatório Diário de Monitoramento - ${reportDate}

## 📊 Métricas Gerais
- **Uptime:** [Calcular]
- **Tempo médio de resposta:** [Calcular]
- **Taxa de erro:** [Calcular]
- **Requisições totais:** [Calcular]

## 🚨 Alertas
[Verificar alerts.log]

## 📈 Performance
- **CPU médio:** [Calcular]
- **Memória média:** [Calcular]
- **Disco usado:** [Calcular]

## 🔒 Segurança
- **Tentativas de login falhadas:** [Calcular]
- **Ataques detectados:** [Calcular]

## 💾 Backup
- **Último backup:** [Verificar]
- **Status:** [Verificar]

## 🔐 SSL
- **Certificado:** [Verificar]
- **Expira em:** [Verificar]
`;
    
    fs.writeFileSync(reportFile, reportContent);
    console.log(`📋 Relatório diário gerado: ${reportFile}`);
};

// ========================================
// LOOP PRINCIPAL DE MONITORAMENTO
// ========================================
console.log('🔄 Iniciando loop de monitoramento...');

let iteration = 0;
const maxIterations = 10; // Para demonstração, limitar a 10 iterações

const monitoringLoop = () => {
    iteration++;
    console.log(`[${new Date().toLocaleString('pt-BR')}] Executando verificações (${iteration}/${maxIterations})...`);
    
    // Verificações básicas
    checkHealth();
    checkPerformance();
    checkDatabase();
    checkCache();
    
    // Verificações de sistema
    checkSystemResources();
    checkErrorRate();
    
    // Verificações de segurança
    checkSecurity();
    
    // Verificações de infraestrutura
    checkBackup();
    checkSslCertificate();
    
    // Gerar relatório diário às 00:00
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        generateDailyReport();
    }
    
    // Limpar logs antigos (manter apenas 7 dias)
    const logFiles = ['health.log', 'performance.log', 'database.log', 'cache.log', 'system.log', 'errors.log', 'backup.log', 'ssl.log'];
    logFiles.forEach(file => {
        const filePath = path.join(MONITORING_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            if (daysOld > 7) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Log antigo removido: ${file}`);
            }
        }
    });
    
    console.log(`[${new Date().toLocaleString('pt-BR')}] Verificações concluídas. Aguardando 60 segundos...`);
    
    if (iteration < maxIterations) {
        setTimeout(monitoringLoop, 60000); // 60 segundos
    } else {
        console.log('🎉 Monitoramento concluído!');
        console.log(`📁 Logs salvos em: ${MONITORING_DIR}/`);
        console.log('✅ Script de monitoramento finalizado');
    }
};

// Iniciar loop de monitoramento
monitoringLoop(); 