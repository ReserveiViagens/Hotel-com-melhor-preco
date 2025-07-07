const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inicializando módulos do sistema...');

  // Módulos padrão do sistema
  const modules = [
    {
      name: 'hoteis',
      label: 'Hotéis',
      icon: '🏨',
      active: true,
      order: 1,
      config: {
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#60A5FA'
        },
        layout: 'grid',
        filters: ['price', 'rating', 'amenities', 'location'],
        seo: {
          title: 'Hotéis em Caldas Novas - Reservei Viagens',
          description: 'Encontre os melhores hotéis em Caldas Novas com águas termais e conforto garantido.'
        }
      }
    },
    {
      name: 'ingressos',
      label: 'Ingressos',
      icon: '🎫',
      active: true,
      order: 2,
      config: {
        colors: {
          primary: '#10B981',
          secondary: '#059669',
          accent: '#34D399'
        },
        layout: 'cards',
        filters: ['price', 'category', 'date', 'location'],
        seo: {
          title: 'Ingressos para Parques - Reservei Viagens',
          description: 'Compre ingressos para os melhores parques aquáticos e atrações de Caldas Novas.'
        }
      }
    },
    {
      name: 'atracoes',
      label: 'Atrações',
      icon: '🏞️',
      active: true,
      order: 3,
      config: {
        colors: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#FBBF24'
        },
        layout: 'list',
        filters: ['category', 'price', 'duration', 'location'],
        seo: {
          title: 'Atrações Turísticas - Reservei Viagens',
          description: 'Descubra as melhores atrações turísticas de Caldas Novas e região.'
        }
      }
    },
    {
      name: 'eventos',
      label: 'Eventos',
      icon: '🎪',
      active: false,
      order: 4,
      config: {
        colors: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#A78BFA'
        },
        layout: 'timeline',
        filters: ['date', 'category', 'price', 'location'],
        seo: {
          title: 'Eventos e Shows - Reservei Viagens',
          description: 'Confira os melhores eventos e shows em Caldas Novas.'
        }
      }
    },
    {
      name: 'transportes',
      label: 'Transportes',
      icon: '🚗',
      active: false,
      order: 5,
      config: {
        colors: {
          primary: '#EF4444',
          secondary: '#DC2626',
          accent: '#F87171'
        },
        layout: 'grid',
        filters: ['type', 'price', 'capacity', 'location'],
        seo: {
          title: 'Transportes e Transfer - Reservei Viagens',
          description: 'Serviços de transporte e transfer em Caldas Novas.'
        }
      }
    },
    {
      name: 'restaurantes',
      label: 'Restaurantes',
      icon: '🍽️',
      active: false,
      order: 6,
      config: {
        colors: {
          primary: '#EC4899',
          secondary: '#DB2777',
          accent: '#F472B6'
        },
        layout: 'cards',
        filters: ['cuisine', 'price', 'rating', 'location'],
        seo: {
          title: 'Restaurantes - Reservei Viagens',
          description: 'Os melhores restaurantes de Caldas Novas.'
        }
      }
    },
    {
      name: 'lojas',
      label: 'Lojas',
      icon: '🛍️',
      active: false,
      order: 7,
      config: {
        colors: {
          primary: '#06B6D4',
          secondary: '#0891B2',
          accent: '#22D3EE'
        },
        layout: 'grid',
        filters: ['category', 'price', 'rating', 'location'],
        seo: {
          title: 'Lojas e Comércio - Reservei Viagens',
          description: 'Lojas e comércio em Caldas Novas.'
        }
      }
    },
    {
      name: 'servicos',
      label: 'Serviços',
      icon: '🏥',
      active: false,
      order: 8,
      config: {
        colors: {
          primary: '#84CC16',
          secondary: '#65A30D',
          accent: '#A3E635'
        },
        layout: 'list',
        filters: ['category', 'price', 'rating', 'location'],
        seo: {
          title: 'Serviços - Reservei Viagens',
          description: 'Serviços diversos em Caldas Novas.'
        }
      }
    }
  ];

  // Criar ou atualizar módulos
  for (const moduleData of modules) {
    const module = await prisma.module.upsert({
      where: { name: moduleData.name },
      update: {
        label: moduleData.label,
        icon: moduleData.icon,
        active: moduleData.active,
        order: moduleData.order,
        config: moduleData.config
      },
      create: moduleData
    });

    console.log(`✅ Módulo "${module.label}" ${module.active ? 'ativado' : 'desativado'}`);
  }

  console.log('\n🎉 Módulos inicializados com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- Total de módulos: ${modules.length}`);
  console.log(`- Módulos ativos: ${modules.filter(m => m.active).length}`);
  console.log(`- Módulos inativos: ${modules.filter(m => !m.active).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao inicializar módulos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 