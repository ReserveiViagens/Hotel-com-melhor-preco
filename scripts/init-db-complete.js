const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando população do banco de dados...');

  try {
    // Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@reservei.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@reservei.com',
        password: adminPassword,
        role: 'admin',
        phone: '(11) 99999-9999',
        cpf: '12345678901',
        active: true,
      },
    });

    // Criar usuários clientes
    const clientPassword = await bcrypt.hash('123456', 10);
    const clients = await Promise.all([
      prisma.user.upsert({
        where: { email: 'joao@email.com' },
        update: {},
        create: {
          name: 'João Silva',
          email: 'joao@email.com',
          password: clientPassword,
          role: 'client',
          phone: '(11) 98765-4321',
          cpf: '11111111111',
          birthDate: new Date('1990-01-15'),
          address: 'Rua A, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          active: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'maria@email.com' },
        update: {},
        create: {
          name: 'Maria Santos',
          email: 'maria@email.com',
          password: clientPassword,
          role: 'client',
          phone: '(11) 91234-5678',
          cpf: '22222222222',
          birthDate: new Date('1985-05-20'),
          address: 'Av. B, 456',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000',
          active: true,
        },
      }),
    ]);

    // Criar hotéis
    const hotels = await Promise.all([
      prisma.hotel.upsert({
        where: { email: 'contato@lacquadiroma.com' },
        update: {},
        create: {
          name: 'Lacqua Diroma Hotel',
          description: 'Hotel de luxo com águas termais e spa completo',
          address: 'Rua das Águas, 100 - Caldas Novas, GO',
          phone: '(64) 3453-1234',
          email: 'contato@lacquadiroma.com',
          price: 450.00,
          rating: 4.8,
          amenities: JSON.stringify(['Piscina termal', 'Spa', 'Restaurante', 'Wi-Fi', 'Estacionamento']),
          images: JSON.stringify(['/images/lacqua-diroma-hotel.png']),
          active: true,
        },
      }),
      prisma.hotel.upsert({
        where: { email: 'reservas@piazzadiroma.com' },
        update: {},
        create: {
          name: 'Piazza Diroma Hotel',
          description: 'Hotel familiar com parque aquático e diversão garantida',
          address: 'Av. Orcalino Santos, 1500 - Caldas Novas, GO',
          phone: '(64) 3453-5678',
          email: 'reservas@piazzadiroma.com',
          price: 380.00,
          rating: 4.6,
          amenities: JSON.stringify(['Parque aquático', 'Restaurante', 'Kids club', 'Wi-Fi']),
          images: JSON.stringify(['/images/piazza-diroma-hotel.jpg']),
          active: true,
        },
      }),
    ]);

    // Criar atrações
    const attractions = await Promise.all([
      prisma.attraction.upsert({
        where: { name: 'Hot Park' },
        update: {},
        create: {
          name: 'Hot Park',
          description: 'O maior parque aquático de águas termais do mundo',
          location: 'Caldas Novas, GO',
          duration: 'Dia inteiro',
          price: 89.90,
          rating: 4.7,
          category: 'Parque Aquático',
          highlights: JSON.stringify(['Piscinas termais', 'Toboáguas', 'Rio lento', 'Área kids']),
          images: JSON.stringify(['/images/hot-park.jpeg']),
          active: true,
        },
      }),
      prisma.attraction.upsert({
        where: { name: 'Lagoa Termas Parque' },
        update: {},
        create: {
          name: 'Lagoa Termas Parque',
          description: 'Complexo de lazer com águas termais e diversão',
          location: 'Caldas Novas, GO',
          duration: 'Meio dia',
          price: 65.00,
          rating: 4.5,
          category: 'Termas',
          highlights: JSON.stringify(['Águas termais', 'Piscinas', 'Hidromassagem', 'Bar molhado']),
          images: JSON.stringify(['/images/lagoa-termas-parque.jpeg']),
          active: true,
        },
      }),
    ]);

    // Criar ingressos
    const tickets = await Promise.all([
      prisma.ticket.upsert({
        where: { id: 'ticket-hot-park-1' },
        update: {},
        create: {
          id: 'ticket-hot-park-1',
          attractionId: attractions[0].id,
          name: 'Ingresso Hot Park - Adulto',
          description: 'Ingresso para adulto com acesso completo ao parque',
          date: new Date('2024-12-31'),
          time: '08:00',
          price: 89.90,
          availableTickets: 500,
          totalTickets: 500,
          category: 'Adulto',
          active: true,
        },
      }),
      prisma.ticket.upsert({
        where: { id: 'ticket-lagoa-1' },
        update: {},
        create: {
          id: 'ticket-lagoa-1',
          attractionId: attractions[1].id,
          name: 'Ingresso Lagoa Termas - Adulto',
          description: 'Ingresso para adulto com acesso às termas',
          date: new Date('2024-12-31'),
          time: '09:00',
          price: 65.00,
          availableTickets: 300,
          totalTickets: 300,
          category: 'Adulto',
          active: true,
        },
      }),
    ]);

    // Criar promoções
    const promotions = await Promise.all([
      prisma.promotion.upsert({
        where: { code: 'NATAL2024' },
        update: {},
        create: {
          title: 'Promoção de Natal',
          description: 'Desconto especial para as festas de fim de ano',
          discount: 15.0,
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          code: 'NATAL2024',
          maxUses: 100,
          currentUses: 0,
          active: true,
        },
      }),
      prisma.promotion.upsert({
        where: { code: 'FAMILIA50' },
        update: {},
        create: {
          title: 'Desconto Família',
          description: 'Desconto para famílias com crianças',
          discount: 20.0,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          code: 'FAMILIA50',
          maxUses: 200,
          currentUses: 0,
          active: true,
        },
      }),
    ]);

    // Criar reservas
    const reservations = await Promise.all([
      prisma.reservation.create({
        data: {
          userId: clients[0].id,
          hotelId: hotels[0].id,
          checkIn: new Date('2024-12-20'),
          checkOut: new Date('2024-12-23'),
          adults: 2,
          children: 1,
          babies: 0,
          totalPrice: 1350.00,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'credit_card',
          specialRequests: 'Quarto com vista para o parque',
        },
      }),
      prisma.reservation.create({
        data: {
          userId: clients[1].id,
          hotelId: hotels[1].id,
          checkIn: new Date('2024-12-25'),
          checkOut: new Date('2024-12-28'),
          adults: 2,
          children: 0,
          babies: 0,
          totalPrice: 1140.00,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'pix',
        },
      }),
    ]);

    // Criar pedidos
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          userId: clients[0].id,
          ticketId: tickets[0].id,
          quantity: 2,
          totalPrice: 179.80,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'credit_card',
        },
      }),
      prisma.order.create({
        data: {
          userId: clients[1].id,
          ticketId: tickets[1].id,
          quantity: 3,
          totalPrice: 195.00,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'boleto',
        },
      }),
    ]);

    // Criar pagamentos
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          userId: clients[0].id,
          reservationId: reservations[0].id,
          amount: 1350.00,
          method: 'credit_card',
          gateway: 'stripe',
          status: 'paid',
          gatewayId: 'pi_test_123456789',
          gatewayData: { status: 'succeeded', payment_method: 'card_visa' },
        },
      }),
      prisma.payment.create({
        data: {
          userId: clients[0].id,
          orderId: orders[0].id,
          amount: 179.80,
          method: 'credit_card',
          gateway: 'mercadopago',
          status: 'paid',
          gatewayId: 'mp_test_987654321',
          gatewayData: { status: 'approved', payment_type: 'credit_card' },
        },
      }),
    ]);

    // Criar reviews
    const reviews = await Promise.all([
      prisma.review.create({
        data: {
          userId: clients[0].id,
          hotelId: hotels[0].id,
          rating: 5,
          comment: 'Hotel incrível! Águas termais maravilhosas e atendimento excepcional.',
          active: true,
        },
      }),
      prisma.review.create({
        data: {
          userId: clients[1].id,
          hotelId: hotels[1].id,
          rating: 4,
          comment: 'Muito bom para famílias. As crianças adoraram o parque aquático.',
          active: true,
        },
      }),
    ]);

    // Criar configurações do sistema
    const systemConfigs = await Promise.all([
      prisma.systemConfig.upsert({
        where: { key: 'site_name' },
        update: {},
        create: {
          key: 'site_name',
          value: 'Reservei Viagens',
          type: 'string',
        },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'contact_email' },
        update: {},
        create: {
          key: 'contact_email',
          value: 'contato@reservei.com',
          type: 'string',
        },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'contact_phone' },
        update: {},
        create: {
          key: 'contact_phone',
          value: '(11) 99999-9999',
          type: 'string',
        },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'openai_enabled' },
        update: {},
        create: {
          key: 'openai_enabled',
          value: 'true',
          type: 'boolean',
        },
      }),
    ]);

    // Criar mensagens de chat de exemplo
    const chatMessages = await Promise.all([
      prisma.chatMessage.create({
        data: {
          userId: clients[0].id,
          sessionId: 'session_123',
          message: 'Olá, gostaria de informações sobre hotéis em Caldas Novas',
          response: 'Olá! Temos ótimas opções em Caldas Novas. Recomendo o Lacqua Diroma Hotel e o Piazza Diroma Hotel. Ambos oferecem águas termais e excelente estrutura. Gostaria de mais detalhes sobre algum deles?',
          isAI: false,
        },
      }),
      prisma.chatMessage.create({
        data: {
          userId: clients[1].id,
          sessionId: 'session_456',
          message: 'Qual o melhor parque aquático da região?',
          response: 'O Hot Park é considerado o maior parque aquático de águas termais do mundo! Tem diversas atrações, toboáguas e piscinas termais. É perfeito para toda a família. Posso ajudar você a comprar ingressos?',
          isAI: false,
        },
      }),
    ]);

    console.log('✅ Banco de dados populado com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`- ${1} usuário admin`);
    console.log(`- ${clients.length} clientes`);
    console.log(`- ${hotels.length} hotéis`);
    console.log(`- ${attractions.length} atrações`);
    console.log(`- ${tickets.length} ingressos`);
    console.log(`- ${promotions.length} promoções`);
    console.log(`- ${reservations.length} reservas`);
    console.log(`- ${orders.length} pedidos`);
    console.log(`- ${payments.length} pagamentos`);
    console.log(`- ${reviews.length} avaliações`);
    console.log(`- ${systemConfigs.length} configurações do sistema`);
    console.log(`- ${chatMessages.length} mensagens de chat`);
    console.log('');
    console.log('🔑 Credenciais de acesso:');
    console.log('Admin: admin@reservei.com / admin123');
    console.log('Cliente 1: joao@email.com / 123456');
    console.log('Cliente 2: maria@email.com / 123456');

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 