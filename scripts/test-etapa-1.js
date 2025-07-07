const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEtapa1() {
  console.log('🧪 Testando Etapa 1 - Sistema Modular Reativo + Login Social\n');

  try {
    // 1. Testar módulos no banco de dados
    console.log('1️⃣ Testando módulos no banco de dados...');
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`   ✅ ${modules.length} módulos encontrados:`);
    modules.forEach(module => {
      console.log(`      - ${module.icon} ${module.label} (${module.active ? 'Ativo' : 'Inativo'})`);
    });

    // 2. Testar módulos ativos
    console.log('\n2️⃣ Testando módulos ativos...');
    const activeModules = modules.filter(m => m.active);
    console.log(`   ✅ ${activeModules.length} módulos ativos:`);
    activeModules.forEach(module => {
      console.log(`      - ${module.icon} ${module.label}`);
    });

    // 3. Testar configurações dos módulos
    console.log('\n3️⃣ Testando configurações dos módulos...');
    const modulesWithConfig = await prisma.module.findMany();
    
    console.log(`   ✅ ${modulesWithConfig.length} módulos com configurações:`);
    modulesWithConfig.forEach(module => {
      const hasConfig = module.config && typeof module.config === 'object' && Object.keys(module.config).length > 0;
      console.log(`      - ${module.icon} ${module.label}: ${hasConfig ? '✅ Configurado' : '❌ Sem configuração'}`);
    });

    // 4. Testar estrutura de autenticação social
    console.log('\n4️⃣ Testando estrutura de autenticação social...');
    const socialAccounts = await prisma.socialAccount.findMany();
    console.log(`   ✅ ${socialAccounts.length} contas sociais registradas`);

    const socialAuthLogs = await prisma.socialAuthLog.findMany();
    console.log(`   ✅ ${socialAuthLogs.length} logs de autenticação social`);

    // 5. Testar usuários
    console.log('\n5️⃣ Testando usuários...');
    const users = await prisma.user.findMany();
    console.log(`   ✅ ${users.length} usuários registrados`);

    const usersWithSocial = await prisma.user.findMany({
      include: {
        socialAccounts: true
      }
    });
    
    const usersWithSocialAccounts = usersWithSocial.filter(u => u.socialAccounts.length > 0);
    console.log(`   ✅ ${usersWithSocialAccounts.length} usuários com contas sociais`);

    // 6. Resumo final
    console.log('\n🎯 RESUMO DA ETAPA 1:');
    console.log(`   📊 Total de módulos: ${modules.length}`);
    console.log(`   ✅ Módulos ativos: ${activeModules.length}`);
    console.log(`   🔐 Contas sociais: ${socialAccounts.length}`);
    console.log(`   👥 Usuários: ${users.length}`);
    console.log(`   📝 Logs de auth: ${socialAuthLogs.length}`);

    // 7. Verificar se há módulos essenciais
    const essentialModules = ['hoteis', 'ingressos', 'atracoes'];
    const missingModules = essentialModules.filter(name => 
      !modules.some(m => m.name === name)
    );

    if (missingModules.length > 0) {
      console.log(`\n⚠️  Módulos essenciais faltando: ${missingModules.join(', ')}`);
    } else {
      console.log('\n✅ Todos os módulos essenciais estão presentes!');
    }

    // 8. Verificar configurações de cores
    console.log('\n6️⃣ Verificando configurações de cores...');
    modulesWithConfig.forEach(module => {
      if (module.config && module.config.colors) {
        console.log(`   🎨 ${module.label}: ${module.config.colors.primary}`);
      }
    });

    console.log('\n🎉 Teste da Etapa 1 concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Acesse http://localhost:3000/admin/configuracoes');
    console.log('   2. Vá para a aba "Módulos & Integrações"');
    console.log('   3. Configure as chaves das APIs sociais');
    console.log('   4. Teste o login social em http://localhost:3000/login');
    console.log('   5. Verifique se o header mostra apenas módulos ativos');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEtapa1(); 