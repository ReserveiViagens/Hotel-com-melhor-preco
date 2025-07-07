"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Download,
  Eye,
  Plus,
  FolderOpen,
  Search
} from "lucide-react"
import Image from "next/image"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  url: string
  size: string
  dimensions: string
  category: string
  uploadDate: string
}

interface AdminAssetsProps {
  onUpdate: () => void
}

export default function AdminAssets({ onUpdate }: AdminAssetsProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: "1",
      name: "spazzio-diroma.jpg",
      type: "image",
      url: "/images/spazzio-diroma-hotel.jpg",
      size: "245 KB",
      dimensions: "1200x800",
      category: "hoteis",
      uploadDate: "2025-01-20"
    },
    {
      id: "2",
      name: "hot-park.jpg",
      type: "image", 
      url: "/images/hot-park.jpeg",
      size: "312 KB",
      dimensions: "1200x800",
      category: "parques",
      uploadDate: "2025-01-20"
    },
    {
      id: "3",
      name: "promocao-video.mp4",
      type: "video",
      url: "/videos/promocao.mp4", 
      size: "4.2 MB",
      dimensions: "1280x720",
      category: "promocoes",
      uploadDate: "2025-01-20"
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { id: "todos", label: "Todos os Arquivos", count: mediaFiles.length },
    { id: "hoteis", label: "Hotéis", count: mediaFiles.filter(f => f.category === "hoteis").length },
    { id: "parques", label: "Parques", count: mediaFiles.filter(f => f.category === "parques").length },
    { id: "atracoes", label: "Atrações", count: mediaFiles.filter(f => f.category === "atracoes").length },
    { id: "promocoes", label: "Promoções", count: mediaFiles.filter(f => f.category === "promocoes").length }
  ]

  const filteredFiles = mediaFiles.filter(file => {
    const matchesCategory = selectedCategory === "todos" || file.category === selectedCategory
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith("image/") ? "image" : "video"
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
        dimensions: "Carregando...",
        category: selectedCategory === "todos" ? "hoteis" : selectedCategory,
        uploadDate: new Date().toISOString().split('T')[0]
      }

      // Simular obtenção de dimensões
      if (fileType === "image") {
        const img = new window.Image()
        img.onload = () => {
          newFile.dimensions = `${img.width}x${img.height}`
          setMediaFiles(prev => prev.map(f => f.id === newFile.id ? newFile : f))
        }
        img.src = newFile.url
      }

      setMediaFiles(prev => [...prev, newFile])
    })

    onUpdate()
    setIsUploadDialogOpen(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeleteFile = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este arquivo?")) {
      setMediaFiles(files => files.filter(f => f.id !== id))
      onUpdate()
    }
  }

  const handleDownload = (file: MediaFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Fotos & Vídeos</h2>
          <p className="text-gray-600">Upload e organização de assets do site</p>
        </div>
        
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload de Arquivos
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              {category.label}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar arquivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {mediaFiles.filter(f => f.type === "image").length}
            </div>
            <div className="text-sm text-gray-600">Imagens</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {mediaFiles.filter(f => f.type === "video").length}
            </div>
            <div className="text-sm text-gray-600">Vídeos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {mediaFiles.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FolderOpen className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">Categorias</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Arquivos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative group">
              {file.type === "image" ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewFile(file)}
                  className="w-8 h-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteFile(file.id)}
                  className="w-8 h-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge do tipo */}
              <Badge 
                className={`absolute top-2 right-2 ${
                  file.type === "image" ? "bg-blue-500" : "bg-purple-500"
                }`}
              >
                {file.type === "image" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              </Badge>
            </div>

            <CardContent className="p-3">
              <h4 className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </h4>
              <div className="text-xs text-gray-500 mt-1">
                <div>{file.dimensions}</div>
                <div>{file.size}</div>
                <div className="capitalize">{file.category}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum arquivo encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? `Nenhum arquivo corresponde ao termo "${searchTerm}"`
              : "Faça upload de imagens e vídeos para começar"
            }
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload de Arquivos
          </Button>
        </div>
      )}

      {/* Dialog de Upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Categoria</Label>
              <select 
                className="w-full p-2 border rounded-md mt-1"
                value={selectedCategory === "todos" ? "hoteis" : selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="hoteis">Hotéis</option>
                <option value="parques">Parques</option>
                <option value="atracoes">Atrações</option>
                <option value="promocoes">Promoções</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione arquivos para upload
              </h3>
              <p className="text-gray-500 mb-4">
                Imagens (JPG, PNG, WebP) ou Vídeos (MP4, WebM)
              </p>
              
              <Button onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-2" />
                Escolher Arquivos
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <strong>Especificações recomendadas:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Imagens: 1200x800px, máximo 300KB</li>
                <li>Vídeos: 1280x720px, máximo 5MB</li>
                <li>Formatos: JPG, PNG, WebP, MP4, WebM</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {previewFile.type === "image" ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              ) : (
                <video
                  src={previewFile.url}
                  controls
                  className="w-full max-h-96 rounded-lg"
                >
                  Seu navegador não suporta vídeos.
                </video>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label>Dimensões</Label>
                  <div className="font-mono">{previewFile.dimensions}</div>
                </div>
                <div>
                  <Label>Tamanho</Label>
                  <div className="font-mono">{previewFile.size}</div>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <div className="capitalize">{previewFile.category}</div>
                </div>
                <div>
                  <Label>Upload</Label>
                  <div>{previewFile.uploadDate}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleDeleteFile(previewFile.id)
                    setPreviewFile(null)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 