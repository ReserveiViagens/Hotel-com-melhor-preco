import { PriceComparisonWidget } from '@/components/price-comparison-widget';
import { WeatherWidget } from '@/components/weather-widget';
import { Badge } from '@/components/ui/badge';

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrações Externas</h1>
        <p className="text-gray-600 mt-2">
          Teste as integrações com APIs externas: Booking.com, Previsão do Tempo e Comparação de Preços
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceComparisonWidget />
        <WeatherWidget />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status das Integrações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Status das APIs
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Booking.com API</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">OpenWeather API</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Google Calendar</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stripe Payments</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>
          </div>
        </div>

        {/* Estatísticas de Uso */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estatísticas de Uso</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Requisições Hoje</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Comparações Realizadas</span>
              <span className="font-medium">89</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Previsões Consultadas</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Sucesso</span>
              <span className="font-medium text-green-600">98.5%</span>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cache de Preços</span>
              <Badge variant="outline">15 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sincronização</span>
              <Badge variant="outline">Automática</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retry on Error</span>
              <Badge variant="outline">3x</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Timeout</span>
              <Badge variant="outline">30s</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Documentação das APIs */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Documentação das APIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-600 mb-2">Booking.com API</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Busca de hotéis por localização</li>
              <li>• Verificação de disponibilidade</li>
              <li>• Comparação de preços em tempo real</li>
              <li>• Sincronização automática de dados</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-600 mb-2">OpenWeather API</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clima atual por cidade</li>
              <li>• Previsão de 5 dias</li>
              <li>• Alertas meteorológicos</li>
              <li>• Recomendações de viagem</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-purple-600 mb-2">Google Calendar</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sincronização de reservas</li>
              <li>• Lembretes automáticos</li>
              <li>• Integração com check-in/out</li>
              <li>• Notificações de eventos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-orange-600 mb-2">Stripe Payments</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Processamento de pagamentos</li>
              <li>• Múltiplas formas de pagamento</li>
              <li>• Webhooks para atualizações</li>
              <li>• Relatórios financeiros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 