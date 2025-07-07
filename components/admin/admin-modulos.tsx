"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Save, Key, Globe, Facebook, Apple, MessageCircle } from "lucide-react"

interface Module {
  id: string
  name: string
  label: string
  icon: string
  active: boolean
  order: number
  config: any
}

export default function AdminModulos() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [apiKeys, setApiKeys] = useState({
    googleClientId: "",
    googleClientSecret: "",
    facebookAppId: "",
    facebookAppSecret: "",
    appleServiceId: "",
    appleKeyId: "",
    whatsappPhone: "",
    whatsappToken: ""
  })

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/modules")
      const data = await res.json()
      setModules(data)
    } catch (e) {
      setError("Erro ao carregar módulos")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (mod: Module) => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mod, active: !mod.active })
      })
      if (res.ok) {
        setSuccess(`Módulo ${mod.label} atualizado!`)
        fetchModules()
      } else {
        setError("Erro ao atualizar módulo")
      }
    } catch {
      setError("Erro ao atualizar módulo")
    } finally {
      setLoading(false)
    }
  }

  const handleApiKeyChange = (field: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveApiKeys = () => {
    // Aqui você pode integrar com backend/config
    setSuccess("Chaves de API salvas com sucesso!")
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 && <p>Nenhum módulo encontrado.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mod.icon}</span>
                  <span className="font-semibold">{mod.label}</span>
                </div>
                <Switch checked={mod.active} onCheckedChange={() => handleToggle(mod)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações Sociais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="googleClientId">Google Client ID</Label>
              <Input id="googleClientId" value={apiKeys.googleClientId} onChange={e => handleApiKeyChange("googleClientId", e.target.value)} placeholder="Google Client ID" />
              <Label htmlFor="googleClientSecret">Google Client Secret</Label>
              <Input id="googleClientSecret" value={apiKeys.googleClientSecret} onChange={e => handleApiKeyChange("googleClientSecret", e.target.value)} placeholder="Google Client Secret" />
            </div>
            <div>
              <Label htmlFor="facebookAppId">Facebook App ID</Label>
              <Input id="facebookAppId" value={apiKeys.facebookAppId} onChange={e => handleApiKeyChange("facebookAppId", e.target.value)} placeholder="Facebook App ID" />
              <Label htmlFor="facebookAppSecret">Facebook App Secret</Label>
              <Input id="facebookAppSecret" value={apiKeys.facebookAppSecret} onChange={e => handleApiKeyChange("facebookAppSecret", e.target.value)} placeholder="Facebook App Secret" />
            </div>
            <div>
              <Label htmlFor="appleServiceId">Apple Service ID</Label>
              <Input id="appleServiceId" value={apiKeys.appleServiceId} onChange={e => handleApiKeyChange("appleServiceId", e.target.value)} placeholder="Apple Service ID" />
              <Label htmlFor="appleKeyId">Apple Key ID</Label>
              <Input id="appleKeyId" value={apiKeys.appleKeyId} onChange={e => handleApiKeyChange("appleKeyId", e.target.value)} placeholder="Apple Key ID" />
            </div>
            <div>
              <Label htmlFor="whatsappPhone">WhatsApp Phone</Label>
              <Input id="whatsappPhone" value={apiKeys.whatsappPhone} onChange={e => handleApiKeyChange("whatsappPhone", e.target.value)} placeholder="WhatsApp Phone" />
              <Label htmlFor="whatsappToken">WhatsApp Token</Label>
              <Input id="whatsappToken" value={apiKeys.whatsappToken} onChange={e => handleApiKeyChange("whatsappToken", e.target.value)} placeholder="WhatsApp Token" />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSaveApiKeys}>
            <Save className="w-4 h-4 mr-2" /> Salvar Chaves de API
          </Button>
          {success && <div className="text-green-600 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  )
} 