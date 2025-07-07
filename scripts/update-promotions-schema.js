const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePromotionsSchema() {
  console.log('🔄 Atualizando schema das promoções...');

  try {
    // Verificar se a tabela promotions existe
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='promotions'
    `;

    if (tableExists.length === 0) {
      console.log('✅ Tabela promotions não existe, será criada automaticamente');
      return;
    }

    // Verificar se as novas colunas já existem
    const columns = await prisma.$queryRaw`
      PRAGMA table_info(promotions)
    `;

    const columnNames = columns.map(col => col.name);
    console.log('Colunas existentes:', columnNames);

    // Verificar e adicionar colunas que faltam
    const newColumns = [];

    if (!columnNames.includes('name')) {
      newColumns.push('ADD COLUMN name TEXT');
    }
    if (!columnNames.includes('type')) {
      newColumns.push('ADD COLUMN type TEXT');
    }
    if (!columnNames.includes('discountType')) {
      newColumns.push('ADD COLUMN discountType TEXT');
    }
    if (!columnNames.includes('discountValue')) {
      newColumns.push('ADD COLUMN discountValue REAL');
    }
    if (!columnNames.includes('minValue')) {
      newColumns.push('ADD COLUMN minValue REAL');
    }
    if (!columnNames.includes('maxDiscount')) {
      newColumns.push('ADD COLUMN maxDiscount REAL');
    }
    if (!columnNames.includes('validFrom')) {
      newColumns.push('ADD COLUMN validFrom DATETIME');
    }
    if (!columnNames.includes('validUntil')) {
      newColumns.push('ADD COLUMN validUntil DATETIME');
    }
    if (!columnNames.includes('applicableModules')) {
      newColumns.push('ADD COLUMN applicableModules TEXT');
    }
    if (!columnNames.includes('conditions')) {
      newColumns.push('ADD COLUMN conditions TEXT');
    }
    if (!columnNames.includes('status')) {
      newColumns.push('ADD COLUMN status TEXT DEFAULT "active"');
    }

    // Executar alterações se necessário
    if (newColumns.length > 0) {
      console.log('Adicionando colunas:', newColumns);
      for (const column of newColumns) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE promotions ${column}`);
          console.log(`✅ Coluna adicionada: ${column}`);
        } catch (error) {
          console.log(`⚠️  Erro ao adicionar coluna ${column}:`, error.message);
        }
      }
    } else {
      console.log('✅ Todas as colunas já existem');
    }

    // Migrar dados existentes se necessário
    const existingPromotions = await prisma.promotion.findMany();
    
    for (const promotion of existingPromotions) {
      const updates = {};
      
      // Migrar title para name se necessário
      if (promotion.title && !promotion.name) {
        updates.name = promotion.title;
      }
      
      // Migrar discount para discountValue se necessário
      if (promotion.discount && !promotion.discountValue) {
        updates.discountValue = promotion.discount;
        updates.discountType = 'percentage';
        updates.type = 'percentage';
      }
      
      // Migrar startDate/endDate para validFrom/validUntil se necessário
      if (promotion.startDate && !promotion.validFrom) {
        updates.validFrom = promotion.startDate;
      }
      if (promotion.endDate && !promotion.validUntil) {
        updates.validUntil = promotion.endDate;
      }
      
      // Migrar active para status se necessário
      if (promotion.active !== undefined && !promotion.status) {
        updates.status = promotion.active ? 'active' : 'inactive';
      }
      
      // Aplicar atualizações se houver
      if (Object.keys(updates).length > 0) {
        await prisma.promotion.update({
          where: { id: promotion.id },
          data: updates
        });
        console.log(`✅ Promoção ${promotion.id} migrada`);
      }
    }

    console.log('🎉 Schema das promoções atualizado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao atualizar schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePromotionsSchema(); 