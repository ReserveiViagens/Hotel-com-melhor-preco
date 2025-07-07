"use client"

import { useEffect, useState } from 'react'
import { useModules } from '@/hooks/use-modules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Star, Calendar, Users } from 'lucide-react'

interface DynamicModulePageProps {
  moduleName: string
  title?: string
  description?: string
}

export default function DynamicModulePage({ moduleName, title, description }: DynamicModulePageProps) {
  const { getActiveModuleByName, loading } = useModules()
  const [moduleData, setModuleData] = useState<any[]>([])
  const [moduleLoading, setModuleLoading] = useState(true)

  const module = getActiveModuleByName(moduleName)

  useEffect(() => {
    if (module) {
      fetchModuleData()
    }
  }, [module])

  const fetchModuleData = async () => {
    setModuleLoading(true)
    try {
      // Buscar dados específicos do módulo
      const response = await fetch(`/api/${moduleName}`)
      if (response.ok) {
        const data = await response.json()
        setModuleData(data)
      }
    } catch (error) {
      console.error(`Erro ao carregar dados do módulo ${moduleName}:`, error)
    } finally {
      setModuleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Módulo não encontrado
          </h1>
          <p className="text-gray-600">
            O módulo "{moduleName}" não está ativo ou não foi encontrado.
          </p>
        </div>
      </div>
    )
  }

  const renderModuleContent = () => {
    switch (moduleName) {
      case 'hoteis':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))
            ) : (
              moduleData.map((hotel: any) => (
                <Card key={hotel.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={hotel.image || '/placeholder.jpg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{hotel.rating} ({hotel.reviews} avaliações)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {hotel.price}
                        </p>
                        <p className="text-sm text-gray-600">por noite</p>
                      </div>
                      <Button>Ver detalhes</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )

      case 'ingressos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))
            ) : (
              moduleData.map((ticket: any) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={ticket.image || '/placeholder.jpg'}
                      alt={ticket.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{ticket.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{ticket.capacity} vagas</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {ticket.price}
                        </p>
                        <p className="text-sm text-gray-600">por pessoa</p>
                      </div>
                      <Button>Comprar ingresso</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )

      case 'atracoes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))
            ) : (
              moduleData.map((attraction: any) => (
                <Card key={attraction.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={attraction.image || '/placeholder.jpg'}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{attraction.location}</span>
                    </div>
                    <div className="flex gap-2">
                      {attraction.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {attraction.description}
                    </p>
                    <Button className="w-full">Ver detalhes</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Conteúdo do módulo {module.label}
            </h2>
            <p className="text-gray-600">
              Este módulo está ativo e pronto para receber conteúdo personalizado.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title || module.label}
        </h1>
        <p className="text-gray-600">
          {description || `Explore as melhores opções de ${module.label.toLowerCase()} em Caldas Novas.`}
        </p>
      </div>

      {renderModuleContent()}
    </div>
  )
} 