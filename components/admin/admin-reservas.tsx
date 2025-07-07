"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Users,
  CreditCard,
  Smartphone,
  FileText,
  Download,
  Printer,
  Mail,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  Trash2,
  BarChart3,
  User,
  Hotel
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { v4 as uuidv4 } from 'uuid'

interface Hospede {
  id?: string
  nome?: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
}

interface Pagamento {
  id: string
  metodo: "Cartão Crédito" | "Cartão Débito" | "PIX" | "Boleto" | "Dinheiro" | "Transferência"
  valor: number
  status: "Pendente" | "Confirmado" | "Cancelado"
  data: Date
  comprovante?: string
}

interface Reserva {
  id?: string
  numero?: string
  status?: string
  hospede?: Hospede
  user?: { name?: string; email?: string; phone?: string }
  hotel?: any
  apartment?: any
  quarto?: string
  checkIn?: Date | string
  checkOut?: Date | string
  adultos?: number
  criancas?: number
  babies?: number
  valorTotal?: number
  valorPago?: number
  totalPrice?: number
  paidAmount?: number
  remainingAmount?: number
  pagamentos?: Pagamento[]
  payments?: any[]
  paymentStatus?: string
  paymentMethod?: string
  canal?: string
  realEstateAgent?: string
  isCota?: boolean
  cotaInfo?: any
  notes?: string
  observacoes?: string
  criadoEm?: Date | string
  atualizadoEm?: Date | string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  confirmada: {
    label: "Confirmada",
    color: "bg-green-500",
    icon: CheckCircle
  },
  cancelada: {
    label: "Cancelada", 
    color: "bg-red-500",
    icon: XCircle
  },
  andamento: {
    label: "Em Andamento",
    color: "bg-yellow-500",
    icon: Clock
  }
}

export default function AdminReservas({ onUpdate }: { onUpdate: () => void }) {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"todas" | "confirmada" | "cancelada" | "andamento">("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [paymentData, setPaymentData] = useState({
    gateway: "",
    amount: 0,
    installments: 1
  })

  useEffect(() => {
    loadReservas()
  }, [])

  async function loadReservas() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reservas", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setReservas(data)
    } catch (e) {
      setReservas([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveReservaApi(reserva: Reserva) {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reservas", {
        method: reserva.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reserva)
      })
      await loadReservas()
    } catch (e) {
      // erro
    } finally {
      setLoading(false)
      setIsDialogOpen(false)
      setEditingReserva(null)
      onUpdate()
    }
  }

  function handleSaveReserva() {
    if (!editingReserva) return
    handleSaveReservaApi(editingReserva)
  }

  // Filtrar reservas
  const filteredReservas = reservas.filter(reserva => {
    const matchesStatus = filterStatus === "todas" || reserva.status === filterStatus
    const matchesSearch = 
      reserva.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.hospede?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.hotel?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  function handleNovaReserva() {
    setEditingReserva({
      id: uuidv4(),
      numero: `RES-${new Date().getFullYear()}-${String(reservas.length + 1).padStart(4, '0')}`,
      status: "andamento",
      hospede: {
        id: uuidv4(),
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        endereco: "",
        cidade: "",
        estado: ""
      },
      hotel: "",
      quarto: "",
      checkIn: new Date(),
      checkOut: new Date(),
      adultos: 2,
      criancas: 0,
      valorTotal: 0,
      valorPago: 0,
      pagamentos: [],
      observacoes: "",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      canal: "Site"
    })
    setIsDialogOpen(true)
  }

  function handleEditReserva(reserva: Reserva) {
    setEditingReserva({ ...reserva })
    setIsDialogOpen(true)
  }

  const handlePayment = async (reserva: Reserva) => {
    setSelectedReserva(reserva)
    setPaymentData({
      gateway: "",
      amount: reserva.valorTotal - reserva.valorPago,
      installments: 1
    })
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    if (!selectedReserva || !paymentData.gateway) return

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: 'BRL',
          gateway: paymentData.gateway,
          reservationId: selectedReserva.id,
          customer: {
            name: selectedReserva.hospede?.nome,
            email: selectedReserva.hospede?.email,
            cpf: selectedReserva.hospede?.cpf,
            phone: selectedReserva.hospede?.telefone
          },
          description: `Reserva ${selectedReserva.numero} - ${selectedReserva.hotel}`
        })
      })

      const result = await response.json()

      if (result.success) {
        // Atualizar reserva com novo pagamento
        const updatedReservas = reservas.map(r => 
          r.id === selectedReserva.id 
            ? { ...r, valorPago: r.valorPago + paymentData.amount }
            : r
        )
        setReservas(updatedReservas)
        
        // Gerar voucher automaticamente se pagamento completo
        if (selectedReserva.valorPago + paymentData.amount >= selectedReserva.valorTotal) {
          await generateVoucher(selectedReserva, result.transactionId)
        }

        alert('Pagamento processado com sucesso!')
        setShowPaymentModal(false)
        onUpdate()
      } else {
        alert('Erro ao processar pagamento: ' + result.message)
      }
    } catch (error) {
      alert('Erro ao processar pagamento')
      console.error(error)
    }
  }

  const generateVoucher = async (reserva: Reserva, transactionId: string) => {
    try {
      const response = await fetch('/api/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reserva.id,
          customerName: reserva.hospede?.nome,
          hotelName: reserva.hotel,
          checkIn: (typeof reserva.checkIn === 'string' ? reserva.checkIn : reserva.checkIn?.toISOString()?.split('T')[0]) ?? '',
          checkOut: (typeof reserva.checkOut === 'string' ? reserva.checkOut : reserva.checkOut?.toISOString()?.split('T')[0]) ?? '',
          roomType: reserva.quarto,
          guests: {
            adults: reserva.adultos,
            children: reserva.criancas
          },
          totalAmount: reserva.valorTotal,
          transactionId
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Voucher gerado com sucesso!')
        // Aqui você pode abrir o voucher em nova aba ou fazer download
        window.open(result.voucherUrl, '_blank')
      }
    } catch (error) {
      console.error('Erro ao gerar voucher:', error)
    }
  }

  const downloadVoucher = (reserva: Reserva) => {
    // Implementar download do voucher
    alert('Download do voucher iniciado')
  }

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports/sales')
      const result = await response.json()

      if (result.success) {
        setShowReportsModal(true)
        // Aqui você pode exibir os dados do relatório
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Reservas</h2>
          <p className="text-gray-600">Gerencie reservas, pagamentos e vouchers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowReportsModal(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Button variant={filterStatus === "todas" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("todas")}>Todas</Button>
        <Button variant={filterStatus === "confirmada" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("confirmada")}>Confirmadas</Button>
        <Button variant={filterStatus === "andamento" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("andamento")}>Em Andamento</Button>
        <Button variant={filterStatus === "cancelada" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("cancelada")}>Canceladas</Button>
        <Input placeholder="Buscar por número, hóspede ou hotel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-xs ml-4" />
      </div>
      <div className="space-y-4">
        {filteredReservas.length === 0 && (
          <div className="text-center text-gray-500 py-8">Nenhuma reserva encontrada.</div>
        )}
        {filteredReservas.map((reserva) => {
          const StatusIcon = statusConfig[reserva.status].icon
          return (
            <Card key={reserva.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[reserva.status]?.color || 'bg-gray-400'}>
                        {statusConfig[reserva.status]?.label || reserva.status}
                      </Badge>
                      {reserva.isCota && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          Cota
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono text-gray-500">{reserva.numero}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(reserva.valorPago || 0) < (reserva.valorTotal || 0) && (
                      <Button size="sm" variant="outline" onClick={() => handlePayment(reserva)}>
                        <CreditCard className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cliente */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{reserva.hospede?.nome}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{reserva.hospede?.email}</p>
                      <p>{reserva.hospede?.telefone}</p>
                    </div>
                  </div>
                  {/* Reserva */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{reserva.hotel}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Apto: {reserva.quarto}</p>
                    </div>
                  </div>
                  {/* Datas e valores */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Período</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Check-in: {reserva.checkIn ? format(new Date(reserva.checkIn), 'dd/MM/yyyy') : '-'}</p>
                      <p>Check-out: {reserva.checkOut ? format(new Date(reserva.checkOut), 'dd/MM/yyyy') : '-'}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Valor Total:</span>
                        <span className="font-medium">{(reserva.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Valor Pago:</span>
                        <span className="font-medium text-green-600">{(reserva.valorPago || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Restante:</span>
                        <span className="font-medium text-red-600">{reserva.remainingAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Informações adicionais */}
                {(reserva.observacoes || reserva.isCota || reserva.cotaInfo) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {reserva.observacoes && (
                        <div>
                          <span className="font-medium text-gray-700">Observações:</span>
                          <p className="text-gray-600 mt-1">{reserva.observacoes}</p>
                        </div>
                      )}
                      {reserva.isCota && reserva.cotaInfo && (
                        <div>
                          <span className="font-medium text-gray-700">Informações da Cota:</span>
                          <pre className="text-gray-600 mt-1">{JSON.stringify(reserva.cotaInfo, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Pagamentos */}
                {Array.isArray(reserva.pagamentos) && reserva.pagamentos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-medium text-gray-700">Pagamentos:</span>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      {reserva.pagamentos.map((p: any) => (
                        <li key={p.id}>
                          {p.metodo} - {p.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {p.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReserva?.id ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
          </DialogHeader>
          {editingReserva && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveReserva(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Hóspede</Label>
                  <Input value={editingReserva.hospede?.nome} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, nome: e.target.value } } : null)} required />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={editingReserva.hospede?.cpf} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, cpf: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={editingReserva.hospede?.telefone} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, telefone: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editingReserva.hospede?.email} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, email: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={editingReserva.hospede?.endereco} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, endereco: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={editingReserva.hospede?.cidade} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, cidade: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={editingReserva.hospede?.estado} onChange={e => setEditingReserva(r => r ? { ...r, hospede: { ...r.hospede, estado: e.target.value } } : null)} />
                </div>
                <div>
                  <Label>Hotel</Label>
                  <Input value={editingReserva.hotel} onChange={e => setEditingReserva(r => r ? { ...r, hotel: e.target.value } : null)} />
                </div>
                <div>
                  <Label>Quarto</Label>
                  <Input value={editingReserva.quarto} onChange={e => setEditingReserva(r => r ? { ...r, quarto: e.target.value } : null)} />
                </div>
                <div>
                  <Label>Check-in</Label>
                  <Input type="date" value={format(editingReserva.checkIn, 'yyyy-MM-dd')} onChange={e => setEditingReserva(r => r ? { ...r, checkIn: new Date(e.target.value) } : null)} />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input type="date" value={format(editingReserva.checkOut, 'yyyy-MM-dd')} onChange={e => setEditingReserva(r => r ? { ...r, checkOut: new Date(e.target.value) } : null)} />
                </div>
                <div>
                  <Label>Adultos</Label>
                  <Input type="number" min={1} value={editingReserva.adultos} onChange={e => setEditingReserva(r => r ? { ...r, adultos: Number(e.target.value) } : null)} />
                </div>
                <div>
                  <Label>Crianças</Label>
                  <Input type="number" min={0} value={editingReserva.criancas} onChange={e => setEditingReserva(r => r ? { ...r, criancas: Number(e.target.value) } : null)} />
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <Input type="number" min={0} value={editingReserva.valorTotal} onChange={e => setEditingReserva(r => r ? { ...r, valorTotal: Number(e.target.value) } : null)} />
                </div>
                <div>
                  <Label>Valor Pago</Label>
                  <Input type="number" min={0} value={editingReserva.valorPago} onChange={e => setEditingReserva(r => r ? { ...r, valorPago: Number(e.target.value) } : null)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea value={editingReserva.observacoes} onChange={e => setEditingReserva(r => r ? { ...r, observacoes: e.target.value } : null)} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar Reserva</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {showPaymentModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Processar Pagamento</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Gateway de Pagamento</Label>
                <Input value={paymentData.gateway} onChange={(e) => setPaymentData({...paymentData, gateway: e.target.value})} />
              </div>
              
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  value={paymentData.installments}
                  onChange={(e) => setPaymentData({...paymentData, installments: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={processPayment} className="flex-1">
                Processar Pagamento
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Relatórios de Vendas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Receita Total</p>
                      <p className="text-2xl font-bold text-green-600">R$ 6.500,00</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Reservas</p>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Médio</p>
                      <p className="text-2xl font-bold text-purple-600">R$ 270,83</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => window.open('/api/reports/sales?format=csv', '_blank')}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={() => setShowReportsModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 