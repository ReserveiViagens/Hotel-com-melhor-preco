import axios from 'axios';

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
    precipitation: number;
    humidity: number;
  }>;
  alerts?: Array<{
    type: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface WeatherRecommendation {
  destination: string;
  bestTime: string;
  weatherScore: number;
  activities: string[];
  packingList: string[];
}

class WeatherAPI {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
  }

  // Verificar se a API está configurada
  private isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Obter clima atual
  async getCurrentWeather(city: string, country?: string): Promise<WeatherData | null> {
    if (!this.isConfigured()) {
      return this.getMockWeather(city);
    }

    try {
      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      });

      return this.transformCurrentWeather(response.data);
    } catch (error) {
      console.error('Erro ao obter clima atual:', error);
      return this.getMockWeather(city);
    }
  }

  // Obter previsão de 5 dias
  async getForecast(city: string, country?: string): Promise<WeatherData | null> {
    if (!this.isConfigured()) {
      return this.getMockForecast(city);
    }

    try {
      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      });

      return this.transformForecast(response.data);
    } catch (error) {
      console.error('Erro ao obter previsão:', error);
      return this.getMockForecast(city);
    }
  }

  // Obter clima por coordenadas
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    if (!this.isConfigured()) {
      return this.getMockWeather('Localização');
    }

    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      });

      return this.transformCurrentWeather(response.data);
    } catch (error) {
      console.error('Erro ao obter clima por coordenadas:', error);
      return null;
    }
  }

  // Comparar clima entre destinos
  async compareDestinations(destinations: string[]): Promise<Map<string, WeatherData>> {
    const weatherMap = new Map<string, WeatherData>();

    for (const destination of destinations) {
      try {
        const weather = await this.getCurrentWeather(destination);
        if (weather) {
          weatherMap.set(destination, weather);
        }
      } catch (error) {
        console.error(`Erro ao obter clima para ${destination}:`, error);
      }
    }

    return weatherMap;
  }

  // Obter recomendações de viagem baseadas no clima
  async getTravelRecommendations(destination: string, travelDates: {
    start: string;
    end: string;
  }): Promise<WeatherRecommendation> {
    const forecast = await this.getForecast(destination);
    
    if (!forecast) {
      return this.getMockRecommendation(destination);
    }

    // Analisar clima durante o período de viagem
    const travelPeriod = forecast.forecast.filter(day => 
      day.date >= travelDates.start && day.date <= travelDates.end
    );

    const avgTemp = travelPeriod.reduce((sum, day) => sum + day.high, 0) / travelPeriod.length;
    const avgPrecipitation = travelPeriod.reduce((sum, day) => sum + day.precipitation, 0) / travelPeriod.length;
    const sunnyDays = travelPeriod.filter(day => day.description.includes('céu limpo')).length;

    // Calcular score do clima (0-100)
    let weatherScore = 100;
    if (avgTemp < 15 || avgTemp > 35) weatherScore -= 20;
    if (avgPrecipitation > 5) weatherScore -= 30;
    if (sunnyDays < travelPeriod.length * 0.6) weatherScore -= 15;

    // Determinar melhor época
    const bestTime = this.getBestTimeToVisit(destination, avgTemp, avgPrecipitation);

    // Sugerir atividades
    const activities = this.suggestActivities(avgTemp, avgPrecipitation, sunnyDays);

    // Lista de itens para levar
    const packingList = this.suggestPackingList(avgTemp, avgPrecipitation);

    return {
      destination,
      bestTime,
      weatherScore: Math.max(0, weatherScore),
      activities,
      packingList
    };
  }

  // Transformar dados do clima atual
  private transformCurrentWeather(data: any): WeatherData {
    return {
      location: data.name,
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s para km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        uvIndex: data.uvi || 0
      },
      forecast: [],
      alerts: data.alerts?.map((alert: any) => ({
        type: alert.event,
        title: alert.event,
        description: alert.description,
        severity: this.getSeverity(alert.severity)
      })) || []
    };
  }

  // Transformar dados da previsão
  private transformForecast(data: any): WeatherData {
    const dailyForecast = this.groupForecastByDay(data.list);
    
    return {
      location: data.city.name,
      current: {
        temperature: Math.round(data.list[0].main.temp),
        feelsLike: Math.round(data.list[0].main.feels_like),
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed * 3.6),
        description: data.list[0].weather[0].description,
        icon: data.list[0].weather[0].icon,
        uvIndex: 0
      },
      forecast: dailyForecast.map(day => ({
        date: day.date,
        high: Math.round(day.maxTemp),
        low: Math.round(day.minTemp),
        description: day.description,
        icon: day.icon,
        precipitation: Math.round(day.precipitation * 100) / 100,
        humidity: Math.round(day.humidity)
      }))
    };
  }

  // Agrupar previsão por dia
  private groupForecastByDay(forecastList: any[]): any[] {
    const dailyData: { [key: string]: any } = {};

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          maxTemp: -Infinity,
          minTemp: Infinity,
          precipitation: 0,
          humidity: 0,
          count: 0,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      }

      const day = dailyData[date];
      day.maxTemp = Math.max(day.maxTemp, item.main.temp);
      day.minTemp = Math.min(day.minTemp, item.main.temp);
      day.precipitation += item.pop || 0;
      day.humidity += item.main.humidity;
      day.count++;
    });

    // Calcular médias
    Object.values(dailyData).forEach((day: any) => {
      day.precipitation /= day.count;
      day.humidity /= day.count;
    });

    return Object.values(dailyData);
  }

  // Obter severidade do alerta
  private getSeverity(severity: string): 'low' | 'medium' | 'high' {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'low';
      case 'moderate':
        return 'medium';
      case 'severe':
      case 'extreme':
        return 'high';
      default:
        return 'medium';
    }
  }

  // Determinar melhor época para visitar
  private getBestTimeToVisit(destination: string, avgTemp: number, avgPrecipitation: number): string {
    if (avgTemp >= 20 && avgTemp <= 30 && avgPrecipitation < 3) {
      return 'Período ideal para visitar!';
    } else if (avgTemp >= 15 && avgTemp <= 35 && avgPrecipitation < 5) {
      return 'Bom período para visitar';
    } else if (avgPrecipitation > 5) {
      return 'Período chuvoso, considere adiar';
    } else if (avgTemp < 15) {
      return 'Período frio, leve roupas quentes';
    } else {
      return 'Período quente, prepare-se para o calor';
    }
  }

  // Sugerir atividades baseadas no clima
  private suggestActivities(avgTemp: number, avgPrecipitation: number, sunnyDays: number): string[] {
    const activities: string[] = [];

    if (avgTemp >= 25 && sunnyDays > 0) {
      activities.push('Praia e atividades ao ar livre');
      activities.push('Passeios de barco');
    }

    if (avgTemp >= 15 && avgTemp <= 30) {
      activities.push('Caminhadas e trilhas');
      activities.push('Passeios turísticos');
    }

    if (avgPrecipitation > 3) {
      activities.push('Museus e atrações indoor');
      activities.push('Shopping centers');
    }

    if (avgTemp < 20) {
      activities.push('Spa e bem-estar');
      activities.push('Restaurantes e gastronomia');
    }

    return activities.length > 0 ? activities : ['Atividades gerais'];
  }

  // Sugerir itens para levar
  private suggestPackingList(avgTemp: number, avgPrecipitation: number): string[] {
    const items: string[] = [];

    if (avgTemp >= 25) {
      items.push('Protetor solar');
      items.push('Roupas leves');
      items.push('Boné ou chapéu');
    }

    if (avgTemp < 20) {
      items.push('Casaco ou jaqueta');
      items.push('Roupas quentes');
    }

    if (avgPrecipitation > 3) {
      items.push('Guarda-chuva');
      items.push('Casaco impermeável');
      items.push('Calçados impermeáveis');
    }

    items.push('Documentos');
    items.push('Carregador de celular');
    items.push('Kit de primeiros socorros');

    return items;
  }

  // Dados mock para desenvolvimento
  private getMockWeather(city: string): WeatherData {
    return {
      location: city,
      current: {
        temperature: Math.floor(Math.random() * 20) + 15,
        feelsLike: Math.floor(Math.random() * 20) + 15,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        description: 'céu limpo',
        icon: '01d',
        uvIndex: Math.floor(Math.random() * 10) + 1
      },
      forecast: [],
      alerts: []
    };
  }

  private getMockForecast(city: string): WeatherData {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: Math.floor(Math.random() * 15) + 20,
        low: Math.floor(Math.random() * 10) + 10,
        description: 'céu limpo',
        icon: '01d',
        precipitation: Math.random() * 5,
        humidity: Math.floor(Math.random() * 40) + 40
      });
    }

    return {
      location: city,
      current: {
        temperature: Math.floor(Math.random() * 20) + 15,
        feelsLike: Math.floor(Math.random() * 20) + 15,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        description: 'céu limpo',
        icon: '01d',
        uvIndex: Math.floor(Math.random() * 10) + 1
      },
      forecast,
      alerts: []
    };
  }

  private getMockRecommendation(destination: string): WeatherRecommendation {
    return {
      destination,
      bestTime: 'Período ideal para visitar!',
      weatherScore: 85,
      activities: ['Praia e atividades ao ar livre', 'Passeios turísticos'],
      packingList: ['Protetor solar', 'Roupas leves', 'Documentos']
    };
  }
}

export const weatherAPI = new WeatherAPI(); 