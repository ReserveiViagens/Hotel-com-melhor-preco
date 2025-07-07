'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestCuponsPage() {
  const [cupomCode, setCupomCode] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testCupom = async () => {
    if (!cupomCode || !orderValue) {
      setError('Preencha o código do cupom e o valor do pedido');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: cupomCode,
          orderValue: parseFloat(orderValue),
          module: 'hoteis'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erro ao validar cupom');
      }
    } catch (error) {
      setError('Erro de conexão');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teste de Cupons</h1>
        <p className="text-gray-600">Teste a validação de cupons e promoções</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validador de Cupom</CardTitle>
          <CardDescription>
            Digite um código de cupom e valor do pedido para testar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cupom">Código do Cupom</Label>
              <Input
                id="cupom"
                placeholder="Ex: VERAO2024"
                value={cupomCode}
                onChange={(e) => setCupomCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor do Pedido (R$)</Label>
              <Input
                id="valor"
                type="number"
                placeholder="0.00"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={testCupom} 
            disabled={loading || !cupomCode || !orderValue}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar Cupom'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={result.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Cupom Válido
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Cupom Inválido
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Código</Label>
                <p className="text-lg font-mono">{result.code}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-lg">{result.name}</p>
              </div>
            </div>

            {result.valid && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo de Desconto</Label>
                    <Badge variant="outline">
                      {result.type === 'percentage' ? 'Percentual' : 
                       result.type === 'fixed' ? 'Valor Fixo' : 'Frete Grátis'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Valor do Desconto</Label>
                    <p className="text-lg font-semibold text-green-600">
                      {result.type === 'percentage' ? `${result.value}%` :
                       result.type === 'fixed' ? formatCurrency(result.value) :
                       'Frete Grátis'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Valor Original</Label>
                    <p className="text-lg">{formatCurrency(parseFloat(orderValue))}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Desconto Aplicado</Label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(result.discountAmount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Valor Final</Label>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(result.finalValue)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Economia</Label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(result.savings)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!result.valid && result.reason && (
              <div>
                <Label className="text-sm font-medium">Motivo da Invalidação</Label>
                <p className="text-red-800">{result.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cupons de Teste Disponíveis</CardTitle>
          <CardDescription>
            Use estes códigos para testar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">VERAO2024</h4>
              <p className="text-sm text-gray-600">15% de desconto, mínimo R$ 100</p>
              <p className="text-xs text-gray-500">Válido até 28/02/2024</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">PRIMEIRACOMPRA</h4>
              <p className="text-sm text-gray-600">R$ 50 de desconto, mínimo R$ 200</p>
              <p className="text-xs text-gray-500">Válido até 31/12/2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 