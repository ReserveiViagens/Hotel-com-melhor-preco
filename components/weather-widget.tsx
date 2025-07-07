'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer,
  MapPin,
  Calendar,
  Umbrella,
  Sunscreen,
  Coffee
} from 'lucide-react';

interface WeatherData {
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

interface WeatherRecommendation {
  destination: string;
  bestTime: string;
  weatherScore: number;
  activities: string[];
  packingList: string[];
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<WeatherRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('céu limpo') || desc.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (desc.includes('nublado') || desc.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (desc.includes('chuva') || desc.includes('rain')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGetWeather = async () => {
    if (!city) {
      alert('Por favor, insira uma cidade');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {
        console.error('Erro ao obter clima');
      }
    } catch (error) {
      console.error('Erro ao obter clima:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!city || !checkIn || !checkOut) {
      alert('Por favor, preencha cidade e datas');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, checkIn, checkOut })
      });

      if (response.ok) {
        const data = await response.json();
        setWeather(data.forecast);
        setRecommendations(data.recommendations);
      } else {
        console.error('Erro ao obter recomendações');
      }
    } catch (error) {
      console.error('Erro ao obter recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          Previsão do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Atual</TabsTrigger>
            <TabsTrigger value="forecast">Previsão</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite a cidade..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetWeather()}
              />
              <Button onClick={handleGetWeather} disabled={loading}>
                {loading ? 'Carregando...' : 'Buscar'}
              </Button>
            </div>

            {weather && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <h3 className="text-lg font-semibold">{weather.location}</h3>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {getWeatherIcon(weather.current.description)}
                    <div>
                      <div className="text-4xl font-bold text-gray-900">
                        {weather.current.temperature}°C
                      </div>
                      <div className="text-sm text-gray-600">
                        Sensação: {weather.current.feelsLike}°C
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-700 mb-4">
                    {weather.current.description}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Umidade</span>
                      </div>
                      <div className="text-gray-600">{weather.current.humidity}%</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wind className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Vento</span>
                      </div>
                      <div className="text-gray-600">{weather.current.windSpeed} km/h</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">UV</span>
                      </div>
                      <div className="text-gray-600">{weather.current.uvIndex}</div>
                    </div>
                  </div>
                </div>

                {weather.alerts && weather.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700">Alertas Meteorológicos</h4>
                    {weather.alerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm">{alert.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite a cidade..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Button onClick={handleGetWeather} disabled={loading}>
                {loading ? 'Carregando...' : 'Previsão 5 Dias'}
              </Button>
            </div>

            {weather && weather.forecast && weather.forecast.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {weather.forecast.map((day, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-3">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        {new Date(day.date).toLocaleDateString('pt-BR', { 
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(day.description)}
                      </div>
                      
                      <div className="text-lg font-bold text-gray-900">
                        {day.high}°C
                      </div>
                      <div className="text-sm text-gray-600">
                        {day.low}°C
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {day.description}
                      </div>
                      
                      {day.precipitation > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-600">
                          <Umbrella className="h-3 w-3" />
                          {Math.round(day.precipitation * 100)}%
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="recCity">Cidade</Label>
                <Input
                  id="recCity"
                  placeholder="Destino..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recCheckIn">Check-in</Label>
                <Input
                  id="recCheckIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recCheckOut">Check-out</Label>
                <Input
                  id="recCheckOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">
              {loading ? 'Analisando...' : 'Obter Recomendações'}
            </Button>

            {recommendations && (
              <div className="space-y-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{recommendations.destination}</h3>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Score: {recommendations.weatherScore}/100
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Melhor Época</span>
                      </div>
                      <p className="text-gray-600">{recommendations.bestTime}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          Atividades Recomendadas
                        </h4>
                        <ul className="space-y-1">
                          {recommendations.activities.map((activity, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-brown-500" />
                          O que Levar
                        </h4>
                        <ul className="space-y-1">
                          {recommendations.packingList.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 