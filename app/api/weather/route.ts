import { NextRequest, NextResponse } from 'next/server';
import { weatherAPI } from '@/lib/weather-api';

// GET /api/weather - Obter clima atual
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!city && (!lat || !lon)) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: city ou lat/lon' },
        { status: 400 }
      );
    }

    let weather;
    if (lat && lon) {
      weather = await weatherAPI.getWeatherByCoordinates(parseFloat(lat), parseFloat(lon));
    } else {
      weather = await weatherAPI.getCurrentWeather(city!, country || undefined);
    }

    if (!weather) {
      return NextResponse.json(
        { error: 'Não foi possível obter dados do clima' },
        { status: 404 }
      );
    }

    return NextResponse.json(weather);
  } catch (error) {
    console.error('Erro ao obter clima:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/weather/forecast - Obter previsão
export async function POST(request: NextRequest) {
  try {
    const { city, country, checkIn, checkOut } = await request.json();

    if (!city || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: city, checkIn, checkOut' },
        { status: 400 }
      );
    }

    // Obter previsão
    const forecast = await weatherAPI.getForecast(city, country);

    if (!forecast) {
      return NextResponse.json(
        { error: 'Não foi possível obter previsão do tempo' },
        { status: 404 }
      );
    }

    // Obter recomendações de viagem
    const recommendations = await weatherAPI.getTravelRecommendations(city, {
      start: checkIn,
      end: checkOut
    });

    return NextResponse.json({
      forecast,
      recommendations
    });
  } catch (error) {
    console.error('Erro ao obter previsão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 