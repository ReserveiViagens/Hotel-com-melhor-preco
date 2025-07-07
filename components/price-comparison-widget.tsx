'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface PriceComparison {
  hotelId: string;
  hotelName: string;
  ourPrice: number;
  bookingPrice: number;
  difference: number;
  percentage: number;
  cheaper: boolean;
  savings: number;
  available: boolean;
}

interface ComparisonSummary {
  totalHotels: number;
  cheaperOnOurSite: number;
  totalSavings: number;
  averageSavings: number;
}

export function PriceComparisonWidget() {
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const handleCompare = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      alert('Por favor, preencha as datas de check-in e check-out');
      return;
    }

    setLoading(true);
    try {
      // Simular IDs de hotéis para teste
      const hotelIds = ['hotel_1', 'hotel_2', 'hotel_3'];
      
      const response = await fetch('/api/price-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelIds,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparisons(data.comparisons);
        setSummary(data.summary);
      } else {
        console.error('Erro na comparação de preços');
      }
    } catch (error) {
      console.error('Erro ao comparar preços:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Comparação de Preços
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Buscar</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="guests">Hóspedes</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleCompare} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Comparando...' : 'Comparar Preços'}
            </Button>

            <div className="text-sm text-gray-500 text-center">
              Compare preços entre nossa plataforma e o Booking.com
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {summary && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Resumo da Comparação</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-blue-600 font-medium">Total de Hotéis</div>
                    <div className="text-2xl font-bold text-blue-900">{summary.totalHotels}</div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">Mais Baratos Aqui</div>
                    <div className="text-2xl font-bold text-green-900">{summary.cheaperOnOurSite}</div>
                  </div>
                  <div>
                    <div className="text-purple-600 font-medium">Economia Total</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(summary.totalSavings)}
                    </div>
                  </div>
                  <div>
                    <div className="text-orange-600 font-medium">Economia Média</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(summary.averageSavings)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {comparisons.length > 0 ? (
              <div className="space-y-4">
                {comparisons.map((comparison, index) => (
                  <Card key={comparison.hotelId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{comparison.hotelName}</h4>
                        <Badge variant={comparison.cheaper ? "default" : "secondary"}>
                          {comparison.cheaper ? 'Mais Barato Aqui' : 'Mais Barato Lá'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600 font-medium">Nosso Preço</div>
                          <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(comparison.ourPrice)}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium">Booking.com</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(comparison.bookingPrice)}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm text-purple-600 font-medium">
                            {comparison.cheaper ? 'Economia' : 'Diferença'}
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {formatCurrency(comparison.savings)}
                          </div>
                          <div className="text-sm text-purple-600">
                            ({formatPercentage(comparison.percentage)})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {comparison.available ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Disponível</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Indisponível</span>
                            </>
                          )}
                        </div>

                        {comparison.cheaper && (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Economize {formatCurrency(comparison.savings)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Nenhuma comparação realizada ainda. 
                  Use a aba "Buscar" para comparar preços.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 