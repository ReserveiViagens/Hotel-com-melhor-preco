const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inicializando banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reservei.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@reservei.com',
      password: adminPassword,
      role: 'admin',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00'
    }
  });

  // Criar hotéis de exemplo
  const hotels = await Promise.all([
    prisma.hotel.upsert({
      where: { email: 'contato@spazziodiroma.com' },
      update: {},
      create: {
        name: 'Spazzio DiRoma',
        description: 'Hotel com piscinas termais e Acqua Park exclusivo',
        address: 'Av. das Termas, 123 - Caldas Novas, GO',
        phone: '(64) 3453-1234',
        email: 'contato@spazziodiroma.com',
        price: 450.00,
        rating: 4.5,
        amenities: JSON.stringify(['Piscina Termal', 'Acqua Park', 'Restaurante', 'Wi-Fi', 'Estacionamento']),
        images: JSON.stringify(['/images/spazzio-diroma-hotel.jpg']),
        active: true
      }
    }),
    prisma.hotel.upsert({
      where: { email: 'reservas@lagoaecotowers.com' },
      update: {},
      create: {
        name: 'Lagoa Eco Towers',
        description: 'Hotel sustentável com vista para o lago',
        address: 'Rua do Lago, 456 - Caldas Novas, GO',
        phone: '(64) 3453-5678',
        email: 'reservas@lagoaecotowers.com',
        price: 380.00,
        rating: 4.2,
        amenities: JSON.stringify(['Piscina', 'Restaurante', 'Wi-Fi', 'Estacionamento', 'Spa']),
        images: JSON.stringify(['/images/lagoa-eco-towers-hotel.jpeg']),
        active: true
      }
    }),
    prisma.hotel.upsert({
      where: { email: 'reservas@piazzadiroma.com' },
      update: {},
      create: {
        name: 'Piazza DiRoma',
        description: 'Hotel com arquitetura italiana e águas termais',
        address: 'Piazza Termale, 789 - Caldas Novas, GO',
        phone: '(64) 3453-9012',
        email: 'reservas@piazzadiroma.com',
        price: 520.00,
        rating: 4.7,
        amenities: JSON.stringify(['Piscina Termal', 'Restaurante Italiano', 'Wi-Fi', 'Estacionamento', 'Acqua Park']),
        images: JSON.stringify(['/images/piazza-diroma-hotel.jpg']),
        active: true
      }
    })
  ]);

  // Criar atrações de exemplo
  const attractions = await Promise.all([
    prisma.attraction.upsert({
      where: { name: 'Hot Park' },
      update: {},
      create: {
        name: 'Hot Park',
        description: 'O maior parque aquático da América Latina com mais de 50 atrações',
        location: 'Caldas Novas, GO',
        duration: 'Dia inteiro',
        price: 120.00,
        rating: 4.8,
        category: 'Parque Aquático',
        highlights: JSON.stringify(['Tobogãs', 'Piscinas Termais', 'Shows', 'Restaurantes']),
        images: JSON.stringify(['/images/hot-park.jpeg']),
        active: true
      }
    }),
    prisma.attraction.upsert({
      where: { name: 'DiRoma Acqua Park' },
      update: {},
      create: {
        name: 'DiRoma Acqua Park',
        description: 'Parque aquático exclusivo do Hotel DiRoma com águas termais',
        location: 'Caldas Novas, GO',
        duration: '4 horas',
        price: 80.00,
        rating: 4.5,
        category: 'Parque Aquático',
        highlights: JSON.stringify(['Águas Termais', 'Tobogãs', 'Piscinas']),
        images: JSON.stringify(['/images/diroma-acqua-park.jpeg']),
        active: true
      }
    })
  ]);

  // Criar ingressos de exemplo
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        attractionId: attractions[0].id,
        name: 'Hot Park - Dia Inteiro',
        description: 'Acesso completo ao parque aquático com todas as atrações',
        date: new Date('2024-02-15'),
        time: '09:00',
        price: 120.00,
        availableTickets: 150,
        totalTickets: 200,
        category: 'Parque Aquático',
        active: true
      }
    }),
    prisma.ticket.create({
      data: {
        attractionId: attractions[1].id,
        name: 'DiRoma Acqua Park',
        description: 'Passeio no parque aquático do Hotel DiRoma',
        date: new Date('2024-02-20'),
        time: '10:00',
        price: 80.00,
        availableTickets: 80,
        totalTickets: 100,
        category: 'Parque Aquático',
        active: true
      }
    })
  ]);

  // Criar promoções de exemplo
  const promotions = await Promise.all([
    prisma.promotion.create({
      data: {
        title: 'Fim de Semana Dourado',
        description: 'Desconto especial para reservas de fim de semana',
        discount: 20,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-29'),
        code: 'FIMDESEMANA20',
        maxUses: 100,
        currentUses: 0,
        active: true
      }
    }),
    prisma.promotion.create({
      data: {
        title: 'Pacote Família Completa',
        description: 'Desconto para famílias com crianças',
        discount: 15,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-03-15'),
        code: 'FAMILIA15',
        maxUses: 50,
        currentUses: 0,
        active: true
      }
    })
  ]);

  // Criar configurações do sistema
  const configs = await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: 'openai_api_key' },
      update: {},
      create: {
        key: 'openai_api_key',
        value: '',
        type: 'string'
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'email_host' },
      update: {},
      create: {
        key: 'email_host',
        value: 'smtp.gmail.com',
        type: 'string'
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'email_port' },
      update: {},
      create: {
        key: 'email_port',
        value: '587',
        type: 'number'
      }
    })
  ]);

  console.log('Banco de dados inicializado com sucesso!');
  console.log('Admin criado:', admin.email);
  console.log('Hotéis criados:', hotels.length);
  console.log('Atrações criadas:', attractions.length);
  console.log('Ingressos criados:', tickets.length);
  console.log('Promoções criadas:', promotions.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 