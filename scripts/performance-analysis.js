const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Iniciando análise completa de performance...');

// ========================================
// CONFIGURAÇÕES
// ========================================
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = 'performance-reports';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// Criar diretório de relatórios
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ========================================
// ANÁLISE DE BUNDLE
// ========================================
console.log('📦 Analisando bundle da aplicação...');

try {
    // Build da aplicação
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído');
} catch (error) {
    console.log('⚠️ Erro no build:', error.message);
}

// ========================================
// ANÁLISE DE LIGHTHOUSE
// ========================================
console.log('🏆 Executando Lighthouse...');

const PAGES = ['/', '/hoteis', '/atracoes', '/promocoes', '/contato'];

PAGES.forEach(page => {
    console.log(`📄 Analisando página: ${page}`);
    
    try {
        const outputPath = path.join(OUTPUT_DIR, `lighthouse-${page.replace('/', '')}-${TIMESTAMP}.json`);
        execSync(`npx lighthouse "${SITE_URL}${page}" --output=json --output-path="${outputPath}" --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance,accessibility,best-practices,seo`, { stdio: 'inherit' });
    } catch (error) {
        console.log(`⚠️ Erro ao analisar ${page}:`, error.message);
    }
});

console.log('✅ Análise Lighthouse concluída');

// ========================================
// ANÁLISE DE REDE
// ========================================
console.log('🌐 Analisando performance de rede...');

try {
    const networkTestPath = path.join(OUTPUT_DIR, `network-test-${TIMESTAMP}.txt`);
    execSync(`curl -w "@curl-format.txt" -o /dev/null -s "${SITE_URL}" > "${networkTestPath}"`, { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Erro no teste de rede:', error.message);
}

console.log('✅ Análise de rede concluída');

// ========================================
// ANÁLISE DE BANCO DE DADOS
// ========================================
console.log('🗄️ Analisando performance do banco de dados...');

try {
    const dbTestPath = path.join(OUTPUT_DIR, `database-performance-${TIMESTAMP}.txt`);
    execSync(`node scripts/test-database-performance.js > "${dbTestPath}"`, { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Erro na análise do banco:', error.message);
}

console.log('✅ Análise de banco concluída');

// ========================================
// ANÁLISE DE IMAGENS
// ========================================
console.log('🖼️ Analisando otimização de imagens...');

try {
    const imageAnalysisPath = path.join(OUTPUT_DIR, `image-analysis-${TIMESTAMP}.txt`);
    const imagesDir = path.join('public', 'images');
    
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file)).slice(0, 20);
        
        let analysis = '';
        imageFiles.forEach(file => {
            const filePath = path.join(imagesDir, file);
            const stats = fs.statSync(filePath);
            analysis += `Imagem: ${file}\n`;
            analysis += `Tamanho: ${(stats.size / 1024).toFixed(2)} KB\n`;
            analysis += `---\n`;
        });
        
        fs.writeFileSync(imageAnalysisPath, analysis);
    }
} catch (error) {
    console.log('⚠️ Erro na análise de imagens:', error.message);
}

console.log('✅ Análise de imagens concluída');

// ========================================
// ANÁLISE DE SEO
// ========================================
console.log('🔍 Analisando SEO...');

try {
    const seoAnalysisPath = path.join(OUTPUT_DIR, `seo-analysis-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}" | findstr /i "<title> <meta" > "${seoAnalysisPath}"`, { stdio: 'inherit' });
    
    // Verificar sitemap
    const sitemapPath = path.join(OUTPUT_DIR, `sitemap-${TIMESTAMP}.xml`);
    execSync(`curl -s "${SITE_URL}/sitemap.xml" > "${sitemapPath}"`, { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Erro na análise de SEO:', error.message);
}

console.log('✅ Análise de SEO concluída');

// ========================================
// ANÁLISE DE SEGURANÇA
// ========================================
console.log('🛡️ Analisando segurança...');

try {
    const securityHeadersPath = path.join(OUTPUT_DIR, `security-headers-${TIMESTAMP}.txt`);
    execSync(`curl -I "${SITE_URL}" > "${securityHeadersPath}"`, { stdio: 'inherit' });
    
    const securityAuditPath = path.join(OUTPUT_DIR, `security-audit-${TIMESTAMP}.json`);
    execSync(`npm audit --json > "${securityAuditPath}"`, { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Erro na análise de segurança:', error.message);
}

console.log('✅ Análise de segurança concluída');

// ========================================
// GERAR RELATÓRIO FINAL
// ========================================
console.log('📋 Gerando relatório final...');

const reportContent = `# Relatório de Performance - Reservei Viagens
**Data:** ${new Date().toLocaleString('pt-BR')}
**URL:** ${SITE_URL}

## 📊 Resumo Executivo

### Métricas Principais
- **Performance Score:** [Verificar Lighthouse]
- **First Contentful Paint:** [Verificar Lighthouse]
- **Largest Contentful Paint:** [Verificar Lighthouse]
- **Cumulative Layout Shift:** [Verificar Lighthouse]
- **First Input Delay:** [Verificar Lighthouse]

### Recomendações
1. **Otimizações de Imagem:** [Verificar análise de imagens]
2. **Otimizações de Bundle:** [Verificar análise de bundle]
3. **Otimizações de Cache:** [Verificar análise de cache]
4. **Otimizações de Banco:** [Verificar análise de banco]

## 📁 Arquivos de Análise
- Lighthouse Reports: \`lighthouse-*-${TIMESTAMP}.json\`
- Network Tests: \`network-test-${TIMESTAMP}.txt\`
- Database Performance: \`database-performance-${TIMESTAMP}.txt\`
- Image Analysis: \`image-analysis-${TIMESTAMP}.txt\`
- SEO Analysis: \`seo-analysis-${TIMESTAMP}.txt\`
- Security Audit: \`security-audit-${TIMESTAMP}.json\`

## 🚀 Próximos Passos
1. Revisar relatórios detalhados
2. Implementar otimizações recomendadas
3. Re-executar análise após otimizações
4. Monitorar performance continuamente
`;

const reportPath = path.join(OUTPUT_DIR, `performance-report-${TIMESTAMP}.md`);
fs.writeFileSync(reportPath, reportContent);

console.log(`✅ Relatório final gerado: ${reportPath}`);

// ========================================
// ENVIAR NOTIFICAÇÕES
// ========================================
console.log('📢 Enviando notificações...');

if (process.env.SLACK_WEBHOOK_URL) {
    try {
        const message = {
            text: '📊 Análise de Performance Concluída',
            attachments: [{
                color: 'good',
                fields: [
                    { title: 'Projeto', value: 'Reservei Viagens', short: true },
                    { title: 'Timestamp', value: new Date().toLocaleString('pt-BR'), short: true },
                    { title: 'Relatórios', value: OUTPUT_DIR, short: false }
                ]
            }]
        };
        
        execSync(`curl -X POST "${process.env.SLACK_WEBHOOK_URL}" -H "Content-Type: application/json" -d '${JSON.stringify(message)}'`, { stdio: 'inherit' });
    } catch (error) {
        console.log('⚠️ Erro ao enviar notificação:', error.message);
    }
}

// ========================================
// FINALIZAÇÃO
// ========================================
console.log('🎉 Análise de performance concluída!');
console.log(`📁 Relatórios salvos em: ${OUTPUT_DIR}/`);
console.log(`📋 Relatório principal: ${reportPath}`);
console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);

console.log('✅ Script de análise de performance finalizado'); 