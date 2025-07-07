import { GamificationWidget } from '@/components/gamification-widget';

export default function GamificationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Gamificação</h1>
        <p className="text-gray-600 mt-2">
          Teste o sistema de gamificação com pontos, conquistas e ranking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GamificationWidget />
        
        <div className="space-y-6">
          {/* Informações do Sistema */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos por Reserva:</span>
                <span className="font-medium">100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos por Avaliação:</span>
                <span className="font-medium">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos por Compartilhamento:</span>
                <span className="font-medium">25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos por Login Diário:</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">XP por Nível:</span>
                <span className="font-medium">1000</span>
              </div>
            </div>
          </div>

          {/* Conquistas Disponíveis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Conquistas Disponíveis</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">🏨</span>
                <div>
                  <div className="font-medium">Primeira Reserva</div>
                  <div className="text-sm text-gray-600">Faça sua primeira reserva</div>
                  <div className="text-xs text-blue-600">+500 pontos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-2xl">👑</span>
                <div>
                  <div className="font-medium">Mestre das Reservas</div>
                  <div className="text-sm text-gray-600">Faça 10 reservas</div>
                  <div className="text-xs text-green-600">+1000 pontos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-medium">Crítico</div>
                  <div className="text-sm text-gray-600">Deixe 5 avaliações</div>
                  <div className="text-xs text-yellow-600">+250 pontos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl">🗺️</span>
                <div>
                  <div className="font-medium">Explorador</div>
                  <div className="text-sm text-gray-600">Visite 3 atrações diferentes</div>
                  <div className="text-xs text-purple-600">+300 pontos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="font-medium">Cliente Fiel</div>
                  <div className="text-sm text-gray-600">Faça reservas por 3 meses consecutivos</div>
                  <div className="text-xs text-red-600">+1000 pontos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recompensas por Nível */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recompensas por Nível</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 1-4</div>
                  <div className="text-sm text-gray-600">Iniciante</div>
                </div>
                <span className="text-sm text-gray-500">Sem desconto</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 5-9</div>
                  <div className="text-sm text-gray-600">Explorador</div>
                </div>
                <span className="text-sm text-blue-600 font-medium">5% desconto</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 10-19</div>
                  <div className="text-sm text-gray-600">Viajante</div>
                </div>
                <span className="text-sm text-green-600 font-medium">10% desconto</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 20-29</div>
                  <div className="text-sm text-gray-600">Aventureiro</div>
                </div>
                <span className="text-sm text-yellow-600 font-medium">15% desconto</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 30-49</div>
                  <div className="text-sm text-gray-600">Mestre</div>
                </div>
                <span className="text-sm text-purple-600 font-medium">20% desconto</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium">Nível 50+</div>
                  <div className="text-sm text-gray-600">Lenda</div>
                </div>
                <span className="text-sm text-red-600 font-medium">25% desconto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 