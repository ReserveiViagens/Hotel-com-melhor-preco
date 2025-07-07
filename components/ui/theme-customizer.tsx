'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone, 
  Tablet,
  Save,
  RotateCcw,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  spacing: number;
  animationSpeed: number;
  shadows: boolean;
  gradients: boolean;
  darkMode: boolean;
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

interface PresetTheme {
  name: string;
  config: ThemeConfig;
  preview: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: 8,
  fontSize: 16,
  spacing: 16,
  animationSpeed: 300,
  shadows: true,
  gradients: true,
  darkMode: false,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
};

const presetThemes: PresetTheme[] = [
  {
    name: 'Reservei Clássico',
    config: {
      ...defaultTheme,
      primaryColor: '#2563eb',
      accentColor: '#f59e0b',
    },
    preview: 'bg-blue-500'
  },
  {
    name: 'Reservei Verde',
    config: {
      ...defaultTheme,
      primaryColor: '#059669',
      accentColor: '#10b981',
    },
    preview: 'bg-green-500'
  },
  {
    name: 'Reservei Roxo',
    config: {
      ...defaultTheme,
      primaryColor: '#7c3aed',
      accentColor: '#a855f7',
    },
    preview: 'bg-purple-500'
  },
  {
    name: 'Reservei Escuro',
    config: {
      ...defaultTheme,
      darkMode: true,
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      primaryColor: '#3b82f6',
    },
    preview: 'bg-gray-800'
  },
  {
    name: 'Reservei Minimalista',
    config: {
      ...defaultTheme,
      compactMode: true,
      shadows: false,
      gradients: false,
      borderRadius: 4,
    },
    preview: 'bg-gray-100'
  },
  {
    name: 'Reservei Acessível',
    config: {
      ...defaultTheme,
      highContrast: true,
      fontSize: 18,
      reducedMotion: true,
    },
    preview: 'bg-yellow-500'
  }
];

export function ThemeCustomizer() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    
    // Cores
    root.style.setProperty('--primary', config.primaryColor);
    root.style.setProperty('--secondary', config.secondaryColor);
    root.style.setProperty('--accent', config.accentColor);
    root.style.setProperty('--background', config.backgroundColor);
    root.style.setProperty('--foreground', config.textColor);
    
    // Dimensões
    root.style.setProperty('--radius', `${config.borderRadius}px`);
    root.style.setProperty('--font-size', `${config.fontSize}px`);
    root.style.setProperty('--spacing', `${config.spacing}px`);
    root.style.setProperty('--animation-duration', `${config.animationSpeed}ms`);
    
    // Modos
    if (config.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (config.compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
    
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (config.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (!config.shadows) {
      root.classList.add('no-shadows');
    } else {
      root.classList.remove('no-shadows');
    }
    
    if (!config.gradients) {
      root.classList.add('no-gradients');
    } else {
      root.classList.remove('no-gradients');
    }
  };

  const applyPreset = (preset: PresetTheme) => {
    setTheme(preset.config);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const saveTheme = () => {
    localStorage.setItem('reservei-theme', JSON.stringify(theme));
    // Aqui você pode implementar salvamento no backend
  };

  const loadTheme = () => {
    const saved = localStorage.getItem('reservei-theme');
    if (saved) {
      setTheme(JSON.parse(saved));
    }
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reservei-theme-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string);
          setTheme(importedTheme);
        } catch (error) {
          console.error('Erro ao importar tema:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalizador de Tema</h2>
          <p className="text-muted-foreground">
            Personalize a aparência do Reservei Viagens
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Sair' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTheme}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Cores</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="presets">Temas</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Cores Principais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      id="primary-color"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      id="secondary-color"
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      id="accent-color"
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="background-color">Cor de Fundo</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      id="background-color"
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Border Radius: {theme.borderRadius}px</Label>
                <Slider
                  value={[theme.borderRadius]}
                  onValueChange={([value]) => setTheme({...theme, borderRadius: value})}
                  max={20}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Tamanho da Fonte: {theme.fontSize}px</Label>
                <Slider
                  value={[theme.fontSize]}
                  onValueChange={([value]) => setTheme({...theme, fontSize: value})}
                  max={24}
                  min={12}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Espaçamento: {theme.spacing}px</Label>
                <Slider
                  value={[theme.spacing]}
                  onValueChange={([value]) => setTheme({...theme, spacing: value})}
                  max={32}
                  min={8}
                  step={2}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Velocidade de Animação: {theme.animationSpeed}ms</Label>
                <Slider
                  value={[theme.animationSpeed]}
                  onValueChange={([value]) => setTheme({...theme, animationSpeed: value})}
                  max={1000}
                  min={100}
                  step={50}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="shadows">Sombras</Label>
                <Switch
                  id="shadows"
                  checked={theme.shadows}
                  onCheckedChange={(checked) => setTheme({...theme, shadows: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="gradients">Gradientes</Label>
                <Switch
                  id="gradients"
                  checked={theme.gradients}
                  onCheckedChange={(checked) => setTheme({...theme, gradients: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temas Pré-definidos</CardTitle>
              <CardDescription>
                Escolha um tema pronto ou crie o seu próprio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {presetThemes.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className={`w-full h-16 rounded mb-2 ${preset.preview}`}></div>
                    <h3 className="font-medium text-sm">{preset.name}</h3>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Acessibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <Switch
                  id="dark-mode"
                  checked={theme.darkMode}
                  onCheckedChange={(checked) => setTheme({...theme, darkMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Modo Compacto</Label>
                <Switch
                  id="compact-mode"
                  checked={theme.compactMode}
                  onCheckedChange={(checked) => setTheme({...theme, compactMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">Alto Contraste</Label>
                <Switch
                  id="high-contrast"
                  checked={theme.highContrast}
                  onCheckedChange={(checked) => setTheme({...theme, highContrast: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Movimento Reduzido</Label>
                <Switch
                  id="reduced-motion"
                  checked={theme.reducedMotion}
                  onCheckedChange={(checked) => setTheme({...theme, reducedMotion: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button onClick={saveTheme}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Tema
          </Button>
          <Button variant="outline" onClick={loadTheme}>
            <Upload className="h-4 w-4 mr-2" />
            Carregar
          </Button>
          <Button variant="outline" onClick={exportTheme}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        
        <input
          type="file"
          accept=".json"
          onChange={importTheme}
          className="hidden"
          id="import-theme"
        />
        <Button variant="outline" onClick={() => document.getElementById('import-theme')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
      </div>
    </div>
  );
} 