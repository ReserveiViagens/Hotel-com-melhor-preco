const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛡️ Iniciando testes completos de segurança...');

// ========================================
// CONFIGURAÇÕES
// ========================================
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = 'security-reports';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// Criar diretório de relatórios
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ========================================
// AUDITORIA DE DEPENDÊNCIAS
// ========================================
console.log('📦 Auditando dependências...');

try {
    // Verificar vulnerabilidades conhecidas
    const npmAuditPath = path.join(OUTPUT_DIR, `npm-audit-${TIMESTAMP}.txt`);
    execSync(`npm audit --audit-level moderate > "${npmAuditPath}"`, { stdio: 'inherit' });
    
    // Verificar dependências desatualizadas
    const npmOutdatedPath = path.join(OUTPUT_DIR, `npm-outdated-${TIMESTAMP}.txt`);
    execSync(`npm outdated > "${npmOutdatedPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Auditoria de dependências concluída');
} catch (error) {
    console.log('⚠️ Erro na auditoria:', error.message);
}

// ========================================
// TESTES DE HEADERS DE SEGURANÇA
// ========================================
console.log('🔒 Testando headers de segurança...');

try {
    // Verificar headers de segurança
    const securityHeadersPath = path.join(OUTPUT_DIR, `security-headers-${TIMESTAMP}.txt`);
    execSync(`curl -I "${SITE_URL}" > "${securityHeadersPath}"`, { stdio: 'inherit' });
    
    // Verificar CSP
    const cspCheckPath = path.join(OUTPUT_DIR, `csp-check-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}" | findstr /i "content-security-policy" > "${cspCheckPath}"`, { stdio: 'inherit' });
    
    // Verificar HSTS
    const hstsCheckPath = path.join(OUTPUT_DIR, `hsts-check-${TIMESTAMP}.txt`);
    execSync(`curl -I "${SITE_URL}" | findstr /i "strict-transport-security" > "${hstsCheckPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Headers de segurança verificados');
} catch (error) {
    console.log('⚠️ Erro nos headers:', error.message);
}

// ========================================
// TESTES DE INJEÇÃO
// ========================================
console.log('💉 Testando vulnerabilidades de injeção...');

const SQL_PAYLOADS = ["' OR 1=1--", "' UNION SELECT * FROM users--", "'; DROP TABLE users--"];
const XSS_PAYLOADS = ["<script>alert('XSS')</script>", "javascript:alert('XSS')", "<img src=x onerror=alert('XSS')>"];

try {
    // Teste de SQL Injection
    const sqlInjectionPath = path.join(OUTPUT_DIR, `sql-injection-test-${TIMESTAMP}.txt`);
    SQL_PAYLOADS.forEach(payload => {
        console.log(`Testando SQL Injection: ${payload}`);
        execSync(`curl -s "${SITE_URL}/api/search?q=${encodeURIComponent(payload)}" >> "${sqlInjectionPath}"`, { stdio: 'inherit' });
    });
    
    // Teste de XSS
    const xssTestPath = path.join(OUTPUT_DIR, `xss-test-${TIMESTAMP}.txt`);
    XSS_PAYLOADS.forEach(payload => {
        console.log(`Testando XSS: ${payload}`);
        execSync(`curl -s -X POST "${SITE_URL}/api/contact" -H "Content-Type: application/json" -d "{\\"message\\":\\"${payload}\\"}" >> "${xssTestPath}"`, { stdio: 'inherit' });
    });
    
    console.log('✅ Testes de injeção concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de injeção:', error.message);
}

// ========================================
// TESTES DE AUTENTICAÇÃO
// ========================================
console.log('🔐 Testando autenticação...');

try {
    // Teste de força bruta
    const bruteForcePath = path.join(OUTPUT_DIR, `brute-force-test-${TIMESTAMP}.txt`);
    for (let i = 1; i <= 5; i++) {
        console.log(`Tentativa de login ${i}`);
        execSync(`curl -s -X POST "${SITE_URL}/api/auth/login" -H "Content-Type: application/json" -d "{\\"email\\":\\"test@test.com\\",\\"password\\":\\"wrongpassword${i}\\"}" >> "${bruteForcePath}"`, { stdio: 'inherit' });
    }
    
    // Teste de bypass de autenticação
    const authBypassPath = path.join(OUTPUT_DIR, `auth-bypass-test-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}/admin" > "${authBypassPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Testes de autenticação concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de autenticação:', error.message);
}

// ========================================
// TESTES DE RATE LIMITING
// ========================================
console.log('⏱️ Testando rate limiting...');

try {
    const rateLimitPath = path.join(OUTPUT_DIR, `rate-limit-test-${TIMESTAMP}.txt`);
    for (let i = 1; i <= 20; i++) {
        console.log(`Requisição ${i}`);
        execSync(`curl -s "${SITE_URL}/api/hotels" >> "${rateLimitPath}"`, { stdio: 'inherit' });
    }
    
    console.log('✅ Testes de rate limiting concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de rate limiting:', error.message);
}

// ========================================
// TESTES DE CORS
// ========================================
console.log('🌐 Testando CORS...');

try {
    const corsTestPath = path.join(OUTPUT_DIR, `cors-test-${TIMESTAMP}.txt`);
    execSync(`curl -H "Origin: https://malicious-site.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "${SITE_URL}/api/users" > "${corsTestPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Testes de CORS concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de CORS:', error.message);
}

// ========================================
// TESTES DE PATH TRAVERSAL
// ========================================
console.log('📁 Testando path traversal...');

const PATHS = ["../../../etc/passwd", "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts", "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"];

try {
    const pathTraversalPath = path.join(OUTPUT_DIR, `path-traversal-test-${TIMESTAMP}.txt`);
    PATHS.forEach(path => {
        console.log(`Testando path: ${path}`);
        execSync(`curl -s "${SITE_URL}/api/files/${path}" >> "${pathTraversalPath}"`, { stdio: 'inherit' });
    });
    
    console.log('✅ Testes de path traversal concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de path traversal:', error.message);
}

// ========================================
// TESTES DE COMMAND INJECTION
// ========================================
console.log('💻 Testando command injection...');

const COMMANDS = ["; ls -la", "| whoami", "`id`", "$(cat /etc/passwd)"];

try {
    const commandInjectionPath = path.join(OUTPUT_DIR, `command-injection-test-${TIMESTAMP}.txt`);
    COMMANDS.forEach(cmd => {
        console.log(`Testando comando: ${cmd}`);
        execSync(`curl -s "${SITE_URL}/api/search?q=test${encodeURIComponent(cmd)}" >> "${commandInjectionPath}"`, { stdio: 'inherit' });
    });
    
    console.log('✅ Testes de command injection concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de command injection:', error.message);
}

// ========================================
// TESTES DE CSRF
// ========================================
console.log('🔄 Testando CSRF...');

try {
    const csrfTestPath = path.join(OUTPUT_DIR, `csrf-test-${TIMESTAMP}.txt`);
    execSync(`curl -s -X POST "${SITE_URL}/api/users/update" -H "Content-Type: application/json" -d "{\\"email\\":\\"attacker@evil.com\\"}" -H "Referer: https://malicious-site.com" > "${csrfTestPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Testes de CSRF concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de CSRF:', error.message);
}

// ========================================
// TESTES DE SENSITIVE DATA EXPOSURE
// ========================================
console.log('🔍 Testando exposição de dados sensíveis...');

try {
    const sensitiveDataPath = path.join(OUTPUT_DIR, `sensitive-data-test-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}" | findstr /i "password secret key token" > "${sensitiveDataPath}"`, { stdio: 'inherit' });
    
    // Verificar arquivos de configuração
    const envExposurePath = path.join(OUTPUT_DIR, `env-exposure-test-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}/.env" > "${envExposurePath}"`, { stdio: 'inherit' });
    
    const configExposurePath = path.join(OUTPUT_DIR, `config-exposure-test-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}/config.json" > "${configExposurePath}"`, { stdio: 'inherit' });
    
    console.log('✅ Testes de dados sensíveis concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de dados sensíveis:', error.message);
}

// ========================================
// TESTES DE SSL/TLS
// ========================================
console.log('🔐 Testando SSL/TLS...');

if (SITE_URL.startsWith('https://')) {
    try {
        const domain = SITE_URL.replace('https://', '').split('/')[0];
        const sslTestPath = path.join(OUTPUT_DIR, `ssl-test-${TIMESTAMP}.txt`);
        execSync(`echo | openssl s_client -servername "${domain}" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -dates > "${sslTestPath}"`, { stdio: 'inherit' });
        
        console.log('✅ Testes de SSL/TLS concluídos');
    } catch (error) {
        console.log('⚠️ Erro nos testes de SSL/TLS:', error.message);
    }
}

// ========================================
// TESTES DE LOGOUT
// ========================================
console.log('🚪 Testando logout...');

try {
    const logoutTestPath = path.join(OUTPUT_DIR, `logout-test-${TIMESTAMP}.txt`);
    execSync(`curl -s -X POST "${SITE_URL}/api/auth/logout" > "${logoutTestPath}"`, { stdio: 'inherit' });
    
    // Verificar se sessão foi invalidada
    const sessionInvalidationPath = path.join(OUTPUT_DIR, `session-invalidation-test-${TIMESTAMP}.txt`);
    execSync(`curl -s "${SITE_URL}/admin" > "${sessionInvalidationPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Testes de logout concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de logout:', error.message);
}

// ========================================
// TESTES DE VALIDAÇÃO DE INPUT
// ========================================
console.log('✅ Testando validação de input...');

const MALICIOUS_INPUTS = ["<script>alert('XSS')</script>", "'; DROP TABLE users; --", "../../../etc/passwd", "javascript:alert('XSS')"];

try {
    const inputValidationPath = path.join(OUTPUT_DIR, `input-validation-test-${TIMESTAMP}.txt`);
    MALICIOUS_INPUTS.forEach(input => {
        console.log(`Testando input: ${input}`);
        execSync(`curl -s -X POST "${SITE_URL}/api/contact" -H "Content-Type: application/json" -d "{\\"name\\":\\"${input}\\",\\"email\\":\\"${input}\\",\\"message\\":\\"${input}\\"}" >> "${inputValidationPath}"`, { stdio: 'inherit' });
    });
    
    console.log('✅ Testes de validação de input concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de validação de input:', error.message);
}

// ========================================
// TESTES DE PERMISSÕES
// ========================================
console.log('🔑 Testando permissões...');

const PROTECTED_ROUTES = ['/admin', '/api/admin/users', '/api/admin/settings', '/admin/dashboard'];

try {
    const permissionsPath = path.join(OUTPUT_DIR, `permissions-test-${TIMESTAMP}.txt`);
    PROTECTED_ROUTES.forEach(route => {
        console.log(`Testando rota protegida: ${route}`);
        execSync(`curl -s "${SITE_URL}${route}" >> "${permissionsPath}"`, { stdio: 'inherit' });
    });
    
    console.log('✅ Testes de permissões concluídos');
} catch (error) {
    console.log('⚠️ Erro nos testes de permissões:', error.message);
}

// ========================================
// GERAR RELATÓRIO DE SEGURANÇA
// ========================================
console.log('📋 Gerando relatório de segurança...');

const reportContent = `# Relatório de Segurança - Reservei Viagens
**Data:** ${new Date().toLocaleString('pt-BR')}
**URL:** ${SITE_URL}

## 🛡️ Resumo Executivo

### Vulnerabilidades Encontradas
- **Críticas:** [Verificar relatórios]
- **Altas:** [Verificar relatórios]
- **Médias:** [Verificar relatórios]
- **Baixas:** [Verificar relatórios]

### Status de Segurança
- **Headers de Segurança:** [Verificar security-headers]
- **Autenticação:** [Verificar auth tests]
- **Validação de Input:** [Verificar input validation]
- **Rate Limiting:** [Verificar rate limit tests]

## 📁 Arquivos de Teste
- NPM Audit: \`npm-audit-${TIMESTAMP}.txt\`
- Security Headers: \`security-headers-${TIMESTAMP}.txt\`
- SQL Injection: \`sql-injection-test-${TIMESTAMP}.txt\`
- XSS Tests: \`xss-test-${TIMESTAMP}.txt\`
- Brute Force: \`brute-force-test-${TIMESTAMP}.txt\`
- Rate Limiting: \`rate-limit-test-${TIMESTAMP}.txt\`
- CORS Tests: \`cors-test-${TIMESTAMP}.txt\`
- Path Traversal: \`path-traversal-test-${TIMESTAMP}.txt\`
- Command Injection: \`command-injection-test-${TIMESTAMP}.txt\`
- CSRF Tests: \`csrf-test-${TIMESTAMP}.txt\`
- Sensitive Data: \`sensitive-data-test-${TIMESTAMP}.txt\`
- SSL/TLS: \`ssl-test-${TIMESTAMP}.txt\`
- Logout: \`logout-test-${TIMESTAMP}.txt\`
- Input Validation: \`input-validation-test-${TIMESTAMP}.txt\`
- Permissions: \`permissions-test-${TIMESTAMP}.txt\`

## 🚨 Recomendações
1. **Atualizar dependências vulneráveis**
2. **Implementar headers de segurança**
3. **Melhorar validação de input**
4. **Configurar rate limiting**
5. **Implementar CSRF protection**
6. **Auditar permissões de acesso**

## 🔧 Próximos Passos
1. Revisar todos os relatórios
2. Corrigir vulnerabilidades críticas
3. Implementar medidas de segurança
4. Re-executar testes após correções
5. Configurar monitoramento contínuo
`;

const reportPath = path.join(OUTPUT_DIR, `security-report-${TIMESTAMP}.md`);
fs.writeFileSync(reportPath, reportContent);

console.log(`✅ Relatório de segurança gerado: ${reportPath}`);

// ========================================
// ENVIAR NOTIFICAÇÕES
// ========================================
console.log('📢 Enviando notificações de segurança...');

if (process.env.SLACK_WEBHOOK_URL) {
    try {
        const message = {
            text: '🛡️ Testes de Segurança Concluídos',
            attachments: [{
                color: 'warning',
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
console.log('🎉 Testes de segurança concluídos!');
console.log(`📁 Relatórios salvos em: ${OUTPUT_DIR}/`);
console.log(`📋 Relatório principal: ${reportPath}`);
console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);

console.log('✅ Script de testes de segurança finalizado'); 