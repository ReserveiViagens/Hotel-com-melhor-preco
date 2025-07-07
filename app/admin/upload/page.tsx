'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Upload, Search, Filter, Grid, List, Eye, Trash2, Download, Tag, Calendar, FileImage, HardDrive, Image as ImageIcon } from 'lucide-react';

interface UploadedImage {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  tags: string[];
  description: string;
  uploadedAt: string;
}

interface UploadStats {
  totalImages: number;
  totalSize: number;
  categories: { [key: string]: number };
  recentUploads: number;
}

const categories = [
  { value: 'hoteis', label: 'Hotéis' },
  { value: 'atracoes', label: 'Atrações' },
  { value: 'promocoes', label: 'Promoções' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'destinos', label: 'Destinos' },
  { value: 'general', label: 'Geral' },
];

export default function UploadPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [stats, setStats] = useState<UploadStats>({
    totalImages: 0,
    totalSize: 0,
    categories: {},
    recentUploads: 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Estados do formulário de upload
  const [uploadForm, setUploadForm] = useState({
    category: 'general',
    tags: '',
    description: '',
  });

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTags) params.append('tags', selectedTags);

      const response = await fetch(`/api/admin/upload?${params}`);
      const data = await response.json();

      if (data.success) {
        setImages(data.images);
        setTotalPages(data.pagination.pages);
        
        // Calcular estatísticas
        const totalSize = data.images.reduce((sum: number, img: UploadedImage) => sum + img.fileSize, 0);
        const categories = data.images.reduce((acc: any, img: UploadedImage) => {
          acc[img.category] = (acc[img.category] || 0) + 1;
          return acc;
        }, {});
        
        const recentUploads = data.images.filter((img: UploadedImage) => {
          const uploadDate = new Date(img.uploadedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length;

        setStats({
          totalImages: data.pagination.total,
          totalSize,
          categories,
          recentUploads,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar imagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, searchTerm, selectedTags, toast]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadForm.category);
        formData.append('tags', uploadForm.tags);
        formData.append('description', uploadForm.description);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro no upload');
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });

      // Resetar formulário
      setUploadForm({
        category: 'general',
        tags: '',
        description: '',
      });

      // Recarregar imagens
      loadImages();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro no upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/upload?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Imagem removida com sucesso",
        });
        loadImages();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover imagem",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;

    try {
      for (const id of selectedImages) {
        await fetch(`/api/admin/upload?id=${id}`, {
          method: 'DELETE',
        });
      }

      toast({
        title: "Sucesso",
        description: `${selectedImages.length} imagem(ns) removida(s) com sucesso`,
      });

      setSelectedImages([]);
      loadImages();
    } catch (error) {
      console.error('Erro ao remover imagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover imagens",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev =>
      prev.includes(id)
        ? prev.filter(imageId => imageId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galeria de Imagens</h1>
          <p className="text-muted-foreground">Gerencie o upload e organização de imagens</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Imagens</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads Recentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.categories).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Imagens</CardTitle>
              <CardDescription>
                Envie suas imagens para a galeria. Formatos suportados: JPG, PNG, WebP, GIF (máximo 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Tag1, Tag2, Tag3"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição da imagem"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Clique para selecionar arquivos</span>
                    <span className="text-gray-500"> ou arraste e solte aqui</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar imagens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    placeholder="Tag1, Tag2"
                    value={selectedTags}
                    onChange={(e) => setSelectedTags(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Visualização</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações em lote */}
          {selectedImages.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedImages.length} imagem(ns) selecionada(s)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Selecionadas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImages([])}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Galeria */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma imagem encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">Faça upload de algumas imagens para começar.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.filePath}
                          alt={image.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedImages.includes(image.id)}
                          onCheckedChange={() => toggleImageSelection(image.id)}
                        />
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>{image.originalName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img
                                  src={image.filePath}
                                  alt={image.originalName}
                                  className="w-full h-auto max-h-96 object-contain"
                                />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Categoria:</strong> {image.category}
                                  </div>
                                  <div>
                                    <strong>Tamanho:</strong> {formatFileSize(image.fileSize)}
                                  </div>
                                  <div>
                                    <strong>Tipo:</strong> {image.mimeType}
                                  </div>
                                  <div>
                                    <strong>Upload:</strong> {new Date(image.uploadedAt).toLocaleDateString()}
                                  </div>
                                  {image.tags.length > 0 && (
                                    <div className="col-span-2">
                                      <strong>Tags:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {image.tags.map((tag) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {image.description && (
                                    <div className="col-span-2">
                                      <strong>Descrição:</strong> {image.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                        <div className="truncate">{image.originalName}</div>
                        <div className="text-gray-300">{formatFileSize(image.fileSize)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((image) => (
                    <div key={image.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                      />
                      
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={image.filePath}
                          alt={image.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">{image.originalName}</h4>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>{image.originalName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <img
                                    src={image.filePath}
                                    alt={image.originalName}
                                    className="w-full h-auto max-h-96 object-contain"
                                  />
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Categoria:</strong> {image.category}
                                    </div>
                                    <div>
                                      <strong>Tamanho:</strong> {formatFileSize(image.fileSize)}
                                    </div>
                                    <div>
                                      <strong>Tipo:</strong> {image.mimeType}
                                    </div>
                                    <div>
                                      <strong>Upload:</strong> {new Date(image.uploadedAt).toLocaleDateString()}
                                    </div>
                                    {image.tags.length > 0 && (
                                      <div className="col-span-2">
                                        <strong>Tags:</strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {image.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {image.description && (
                                      <div className="col-span-2">
                                        <strong>Descrição:</strong> {image.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{formatFileSize(image.fileSize)}</span>
                          <span>{image.category}</span>
                          <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {image.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 