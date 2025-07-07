"use client"

import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface AdminContatoProps {
  onUpdate: () => void
}

export default function AdminContato({ onUpdate }: AdminContatoProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informações de Contato</h2>
          <p className="text-gray-600">Edite as informações de contato da agência</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
      </div>
    </div>
  )
} 