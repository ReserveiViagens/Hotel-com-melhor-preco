"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"

interface AdminAtracoesProps {
  onUpdate: () => void
}

export default function AdminAtracoes({ onUpdate }: AdminAtracoesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Atrações</h2>
          <p className="text-gray-600">Adicione, edite ou remova atrações turísticas</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Atração
        </Button>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
      </div>
    </div>
  )
} 