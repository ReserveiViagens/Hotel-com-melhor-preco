import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const tags = formData.get('tags') as string || '';
    const description = formData.get('description') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Validar tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadDir, fileName);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Preparar tags como string JSON
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const tagsJson = JSON.stringify(tagsArray);

    // Salvar informações no banco
    const imageRecord = await prisma.uploadedImage.create({
      data: {
        fileName,
        originalName: file.name,
        filePath: `/uploads/${category}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        category,
        tags: tagsJson,
        description,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      file: {
        id: imageRecord.id,
        fileName: imageRecord.fileName,
        originalName: imageRecord.originalName,
        url: imageRecord.filePath,
        size: imageRecord.fileSize,
        type: imageRecord.mimeType,
        category: imageRecord.category,
        tags: JSON.parse(imageRecord.tags),
        description: imageRecord.description,
        uploadedAt: imageRecord.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.uploadedImage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.uploadedImage.count({ where }),
    ]);

    // Converter tags de JSON string para array
    const imagesWithParsedTags = images.map(image => ({
      ...image,
      tags: JSON.parse(image.tags),
    }));

    return NextResponse.json({
      success: true,
      images: imagesWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da imagem é obrigatório' }, { status: 400 });
    }

    const image = await prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }

    // Remover arquivo do sistema
    const fs = require('fs');
    const fullPath = join(process.cwd(), 'public', image.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remover do banco
    await prisma.uploadedImage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Imagem removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 