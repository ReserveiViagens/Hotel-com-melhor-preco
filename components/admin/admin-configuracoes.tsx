"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminConfiguracoesProps {
  onUpdate: () => void
}

export default function AdminConfiguracoes({ onUpdate }: AdminConfiguracoesProps) {
  const [keys, setKeys] = useState({
    mercadoPago: "",
    pagarme: "",
    stone: "",
    stripe: ""
  })

  const [splitConfig, setSplitConfig] = useState({
    mercadoPago: { percentual: 0, contaDestino: "" },
    pagarme: { percentual: 0, contaDestino: "" },
    stone: { percentual: 0, contaDestino: "" },
    stripe: { percentual: 0, contaDestino: "" }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({ ...keys, [e.target.name]: e.target.value })
    onUpdate()
  }

  const handleSplitChange = (gateway: string, field: string, value: string) => {
    setSplitConfig({
      ...splitConfig,
      [gateway]: { ...splitConfig[gateway as keyof typeof splitConfig], [field]: value }
    })
    onUpdate()
  }

  const handleSave = () => {
    // Aqui você pode integrar com backend ou localStorage
    alert("Configurações salvas com sucesso!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Configure as opções gerais do site</p>
        </div>
        <Button className="bg-gray-600 hover:bg-gray-700" onClick={handleSave}>
          <Settings className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="mercadoPago">Chave Mercado Pago</Label>
          <Input id="mercadoPago" name="mercadoPago" placeholder="Insira a chave do Mercado Pago" value={keys.mercadoPago} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="pagarme">Chave Pagarme</Label>
          <Input id="pagarme" name="pagarme" placeholder="Insira a chave do Pagarme" value={keys.pagarme} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="stone">Chave Stone</Label>
          <Input id="stone" name="stone" placeholder="Insira a chave da Stone" value={keys.stone} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="stripe">Chave Stripe</Label>
          <Input id="stripe" name="stripe" placeholder="Insira a chave do Stripe" value={keys.stripe} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuração de Split de Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Mercado Pago - Percentual de Comissão (%)</Label>
            <Input 
              type="number" 
              placeholder="Ex: 10" 
              value={splitConfig.mercadoPago.percentual} 
              onChange={(e) => handleSplitChange("mercadoPago", "percentual", e.target.value)} 
            />
            <Label>Conta de Destino</Label>
            <Input 
              placeholder="Email ou ID da conta" 
              value={splitConfig.mercadoPago.contaDestino} 
              onChange={(e) => handleSplitChange("mercadoPago", "contaDestino", e.target.value)} 
            />
          </div>
          <div>
            <Label>Pagarme - Percentual de Comissão (%)</Label>
            <Input 
              type="number" 
              placeholder="Ex: 10" 
              value={splitConfig.pagarme.percentual} 
              onChange={(e) => handleSplitChange("pagarme", "percentual", e.target.value)} 
            />
            <Label>Conta de Destino</Label>
            <Input 
              placeholder="Email ou ID da conta" 
              value={splitConfig.pagarme.contaDestino} 
              onChange={(e) => handleSplitChange("pagarme", "contaDestino", e.target.value)} 
            />
          </div>
          <div>
            <Label>Stone - Percentual de Comissão (%)</Label>
            <Input 
              type="number" 
              placeholder="Ex: 10" 
              value={splitConfig.stone.percentual} 
              onChange={(e) => handleSplitChange("stone", "percentual", e.target.value)} 
            />
            <Label>Conta de Destino</Label>
            <Input 
              placeholder="Email ou ID da conta" 
              value={splitConfig.stone.contaDestino} 
              onChange={(e) => handleSplitChange("stone", "contaDestino", e.target.value)} 
            />
          </div>
          <div>
            <Label>Stripe - Percentual de Comissão (%)</Label>
            <Input 
              type="number" 
              placeholder="Ex: 10" 
              value={splitConfig.stripe.percentual} 
              onChange={(e) => handleSplitChange("stripe", "percentual", e.target.value)} 
            />
            <Label>Conta de Destino</Label>
            <Input 
              placeholder="Email ou ID da conta" 
              value={splitConfig.stripe.contaDestino} 
              onChange={(e) => handleSplitChange("stripe", "contaDestino", e.target.value)} 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 