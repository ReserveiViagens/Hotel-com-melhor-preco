import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd() || '', 'config.json');

// Função para carregar configurações
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  // Configurações padrão
  return {
    openaiApiKey: '',
    databaseUrl: '',
    jwtSecret: '',
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPass: ''
  };
}

// Função para salvar configurações
function saveConfig(config: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
}

export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao carregar configurações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    const requiredFields = ['openaiApiKey', 'databaseUrl', 'jwtSecret'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo ${field} é obrigatório` },
          { status: 400 }
        );
      }
    }

    // Salvar configurações
    const success = saveConfig(body);
    
    if (success) {
      return NextResponse.json({ message: 'Configurações salvas com sucesso' });
    } else {
      return NextResponse.json(
        { error: 'Erro ao salvar configurações' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 