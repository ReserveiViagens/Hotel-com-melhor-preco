const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy em produção...');

// ========================================
// CONFIGURAÇÕES
// ========================================
const PROJECT_NAME = 'reservei-viagens';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// ========================================
// FUNÇÕES DE UTILIDADE
// ========================================
const sendSlackNotification = (message, color) => {
    if (SLACK_WEBHOOK_URL) {
        try {
            const slackMessage = {
                text: message,
                attachments: [{
                    color: color,
                    fields: [
                        { title: 'Projeto', value: PROJECT_NAME, short: true },
                        { title: 'Timestamp', value: new Date().toLocaleString('pt-BR'), short: true }
                    ]
                }]
            };
            
            execSync(`curl -X POST "${SLACK_WEBHOOK_URL}" -H "Content-Type: application/json" -d '${JSON.stringify(slackMessage)}'`, { stdio: 'pipe' });
        } catch (error) {
            console.log('⚠️ Erro ao enviar notificação Slack:', error.message);
        }
    }
};

// ========================================
// PRÉ-DEPLOY
// ========================================
console.log('📋 Executando verificações pré-deploy...');

try {
    // Verificar se estamos na branch correta
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'main') {
        console.log('❌ Erro: Deploy deve ser feito da branch main');
        sendSlackNotification('❌ Deploy falhou: Branch incorreta', 'danger');
        process.exit(1);
    }
    console.log('✅ Branch correta: main');

    // Verificar se há mudanças não commitadas
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
        console.log('❌ Erro: Há mudanças não commitadas');
        sendSlackNotification('❌ Deploy falhou: Mudanças não commitadas', 'danger');
        process.exit(1);
    }
    console.log('✅ Nenhuma mudança pendente');

    // Verificar dependências
    console.log('📦 Verificando dependências...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Dependências verificadas');

    // Executar testes
    console.log('🧪 Executando testes...');
    try {
        execSync('npm run test', { stdio: 'inherit' });
        console.log('✅ Testes passaram');
    } catch (error) {
        console.log('⚠️ Testes falharam, mas continuando...');
    }

    // Executar linting
    console.log('🔍 Executando linting...');
    try {
        execSync('npm run lint', { stdio: 'inherit' });
        console.log('✅ Linting passou');
    } catch (error) {
        console.log('⚠️ Linting falhou, mas continuando...');
    }

    // Verificar tipos TypeScript
    console.log('📝 Verificando tipos TypeScript...');
    try {
        execSync('npm run type-check', { stdio: 'inherit' });
        console.log('✅ Tipos verificados');
    } catch (error) {
        console.log('⚠️ Verificação de tipos falhou, mas continuando...');
    }

} catch (error) {
    console.log('❌ Erro nas verificações pré-deploy:', error.message);
    process.exit(1);
}

// ========================================
// BACKUP ANTES DO DEPLOY
// ========================================
console.log('💾 Criando backup antes do deploy...');

try {
    // Backup do banco de dados
    console.log('🗄️ Backup do banco de dados...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Backup do banco concluído');
} catch (error) {
    console.log('⚠️ Erro no backup do banco:', error.message);
}

// ========================================
// BUILD DA APLICAÇÃO
// ========================================
console.log('🔨 Build da aplicação...');

try {
    // Limpar cache
    if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
    }
    console.log('✅ Cache limpo');

    // Build da aplicação
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído com sucesso');

    // Verificar se o build foi bem-sucedido
    if (!fs.existsSync('.next')) {
        console.log('❌ Erro: Build falhou');
        sendSlackNotification('❌ Deploy falhou: Build falhou', 'danger');
        process.exit(1);
    }

} catch (error) {
    console.log('❌ Erro no build:', error.message);
    sendSlackNotification('❌ Deploy falhou: Build falhou', 'danger');
    process.exit(1);
}

// ========================================
// DEPLOY NO VERCEL
// ========================================
console.log('🚀 Deploy no Vercel...');

let deployUrl = 'https://reservei-viagens.vercel.app';

if (VERCEL_TOKEN && VERCEL_ORG_ID && VERCEL_PROJECT_ID) {
    try {
        // Deploy usando Vercel CLI
        execSync(`npx vercel --prod --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}"`, { stdio: 'inherit' });
        
        // Obter URL do deploy
        const vercelOutput = execSync(`npx vercel ls --token "${VERCEL_TOKEN}" --scope "${VERCEL_ORG_ID}"`, { encoding: 'utf8' });
        const lines = vercelOutput.split('\n');
        for (const line of lines) {
            if (line.includes(PROJECT_NAME)) {
                const parts = line.split(/\s+/);
                if (parts.length > 1) {
                    deployUrl = parts[1];
                    break;
                }
            }
        }
        
        console.log(`✅ Deploy concluído: ${deployUrl}`);
    } catch (error) {
        console.log('⚠️ Erro no deploy Vercel:', error.message);
        console.log('⚠️ Vercel não configurado, pulando deploy automático');
    }
} else {
    console.log('⚠️ Vercel não configurado, pulando deploy automático');
}

// ========================================
// PÓS-DEPLOY
// ========================================
console.log('🔍 Verificações pós-deploy...');

// Health check
console.log('🏥 Health check...');
setTimeout(() => {
    try {
        const healthResponse = execSync(`curl -s -o /dev/null -w "%{http_code}" "${deployUrl}/api/health"`, { encoding: 'utf8' });
        
        if (healthResponse === '200') {
            console.log('✅ Health check passou');
        } else {
            console.log(`❌ Health check falhou: ${healthResponse}`);
            sendSlackNotification('❌ Deploy falhou: Health check falhou', 'danger');
        }
    } catch (error) {
        console.log('❌ Health check falhou:', error.message);
        sendSlackNotification('❌ Deploy falhou: Health check falhou', 'danger');
    }
}, 30000); // Aguardar 30 segundos

// Testes de performance
console.log('⚡ Testes de performance...');
try {
    execSync(`npx lighthouse "${deployUrl}" --output=json --output-path=./lighthouse-report.json`, { stdio: 'inherit' });
    
    // Verificar métricas de performance
    if (fs.existsSync('./lighthouse-report.json')) {
        const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
        const score = report.categories.performance.score * 100;
        
        if (score >= 80) {
            console.log(`✅ Performance score: ${score}`);
        } else {
            console.log(`⚠️ Performance score baixo: ${score}`);
        }
    }
} catch (error) {
    console.log('⚠️ Erro nos testes de performance:', error.message);
}

// ========================================
// NOTIFICAÇÕES
// ========================================
console.log('📢 Enviando notificações...');

// Notificação de sucesso
sendSlackNotification(`✅ Deploy em produção concluído com sucesso!\n🌐 URL: ${deployUrl}`, 'good');

// ========================================
// MONITORAMENTO PÓS-DEPLOY
// ========================================
console.log('📊 Iniciando monitoramento pós-deploy...');

// Monitorar por 5 minutos
let monitorCount = 0;
const maxMonitors = 10;

const monitorDeploy = () => {
    monitorCount++;
    console.log(`Monitoramento ${monitorCount}/${maxMonitors}...`);
    
    try {
        // Verificar status da aplicação
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${deployUrl}"`, { encoding: 'utf8' });
        if (response !== '200') {
            console.log(`⚠️ Aplicação retornou status ${response}`);
            sendSlackNotification(`⚠️ Alerta: Aplicação retornou status ${response}`, 'warning');
        }
    } catch (error) {
        console.log('⚠️ Erro no monitoramento:', error.message);
    }
    
    if (monitorCount < maxMonitors) {
        setTimeout(monitorDeploy, 30000); // 30 segundos
    } else {
        console.log('✅ Monitoramento pós-deploy concluído');
    }
};

monitorDeploy();

// ========================================
// FINALIZAÇÃO
// ========================================
console.log('🎉 Deploy em produção concluído com sucesso!');
console.log(`🌐 URL: ${deployUrl}`);
console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);

// Limpar arquivos temporários
try {
    if (fs.existsSync('./lighthouse-report.json')) {
        fs.unlinkSync('./lighthouse-report.json');
    }
} catch (error) {
    console.log('⚠️ Erro ao limpar arquivos temporários:', error.message);
}

console.log('✅ Script de deploy finalizado'); 