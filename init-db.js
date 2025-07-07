const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inicializando banco de dados...');

  // Criar admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reservei.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@reservei.com',
      password: hashedPassword,
      role: 'admin',
      active: true,
    },
  });

  console.log('Admin criado:', admin.email);

  // Criar alguns hotéis de exemplo
  const hotels = await Promise.all([
    prisma.hotel.upsert({
      where: { email: 'spazzio@diroma.com' },
      update: {},
      create: {
        name: 'Spazzio DiRoma',
        description: 'Hotel luxuoso com vista para o lago',
        address: 'Rua das Palmeiras, 123 - Caldas Novas',
        phone: '(64) 3455-1234',
        email: 'spazzio@diroma.com',
        price: 450.00,
        rating: 4.8,
        amenities: JSON.stringify(['Wi-Fi', 'Piscina', 'Spa', 'Restaurante', 'Estacionamento']),
        images: JSON.stringify(['/images/spazzio-diroma-hotel.jpeg']),
        active: true,
      },
    }),
    prisma.hotel.upsert({
      where: { email: 'piazza@diroma.com' },
      update: {},
      create: {
        name: 'Piazza DiRoma',
        description: 'Hotel familiar com parque aquático',
        address: 'Av. das Águas, 456 - Caldas Novas',
        phone: '(64) 3455-5678',
        email: 'piazza@diroma.com',
        price: 380.00,
        rating: 4.6,
        amenities: JSON.stringify(['Wi-Fi', 'Parque Aquático', 'Playground', 'Restaurante']),
        images: JSON.stringify(['/images/piazza-diroma-hotel.jpg']),
        active: true,
      },
    }),
  ]);

  console.log('Hotéis criados:', hotels.length);

  // Criar algumas atrações
  const attractions = await Promise.all([
    prisma.attraction.upsert({
      where: { name: 'Hot Park' },
      update: {},
      create: {
        name: 'Hot Park',
        description: 'O maior parque aquático de águas termais do mundo',
        location: 'Caldas Novas - GO',
        duration: '1 dia',
        price: 120.00,
        rating: 4.9,
        category: 'Parque Aquático',
        highlights: JSON.stringify(['Águas termais', 'Tobogãs', 'Piscinas', 'Shows']),
        images: JSON.stringify(['/images/hot-park.jpeg']),
        active: true,
      },
    }),
    prisma.attraction.upsert({
      where: { name: 'DiRoma Acqua Park' },
      update: {},
      create: {
        name: 'DiRoma Acqua Park',
        description: 'Parque aquático com águas termais naturais',
        location: 'Caldas Novas - GO',
        duration: '1 dia',
        price: 95.00,
        rating: 4.7,
        category: 'Parque Aquático',
        highlights: JSON.stringify(['Águas termais', 'Tobogãs', 'Piscinas infantis']),
        images: JSON.stringify(['/images/diroma-acqua-park.jpeg']),
        active: true,
      },
    }),
  ]);

  console.log('Atrações criadas:', attractions.length);

  // Criar alguns ingressos
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        attractionId: attractions[0].id,
        name: 'Ingresso Hot Park - Adulto',
        description: 'Acesso completo ao parque aquático',
        date: new Date('2024-12-25'),
        time: '09:00',
        price: 120.00,
        availableTickets: 100,
        totalTickets: 100,
        category: 'Adulto',
        active: true,
      },
    }),
    prisma.ticket.create({
      data: {
        attractionId: attractions[1].id,
        name: 'Ingresso DiRoma - Adulto',
        description: 'Acesso completo ao parque aquático',
        date: new Date('2024-12-25'),
        time: '09:00',
        price: 95.00,
        availableTickets: 80,
        totalTickets: 80,
        category: 'Adulto',
        active: true,
      },
    }),
  ]);

  console.log('Ingressos criados:', tickets.length);

  // Criar algumas promoções
  const promotions = await Promise.all([
    prisma.promotion.upsert({
      where: { code: 'FIMDEANO2024' },
      update: {},
      create: {
        title: 'Promoção Fim de Ano',
        description: 'Desconto especial para viagens de fim de ano',
        discount: 15.0,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        code: 'FIMDEANO2024',
        maxUses: 100,
        currentUses: 0,
        active: true,
      },
    }),
    prisma.promotion.upsert({
      where: { code: 'PRIMEIRACOMPRA' },
      update: {},
      create: {
        title: 'Primeira Compra',
        description: 'Desconto para novos clientes',
        discount: 10.0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        code: 'PRIMEIRACOMPRA',
        maxUses: 500,
        currentUses: 0,
        active: true,
      },
    }),
  ]);

  console.log('Promoções criadas:', promotions.length);

  console.log('Banco de dados inicializado com sucesso!');
  console.log('Credenciais do admin: admin@reservei.com / admin123');
}

main()
  .catch((e) => {
    console.error('Erro ao inicializar banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 