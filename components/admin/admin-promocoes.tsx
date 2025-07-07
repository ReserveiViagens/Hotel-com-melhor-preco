"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AdminPromocoesProps {
  onUpdate: () => void
}

export default function AdminPromocoes({ onUpdate }: AdminPromocoesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Promoções</h2>
          <p className="text-gray-600">Adicione, edite ou remova promoções e pacotes</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Promoção
        </Button>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
      </div>
    </div>
  )
} 