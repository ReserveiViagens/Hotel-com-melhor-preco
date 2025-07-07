"use client"

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AuthProvider } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Hotel, 
  Ticket, 
  MapPin, 
  Gift, 
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Shield,
  MessageSquare,
  Mail,
  Database,
  Activity,
  Zap,
  Upload,
  Calendar,
  Package
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  children?: MenuItem[];
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin'
    },
    {
      id: 'gestao',
      label: 'Gestão',
      icon: Package,
      href: '#',
      children: [
        {
          id: 'hoteis',
          label: 'Hotéis',
          icon: Hotel,
          href: '/admin/hoteis'
        },
        {
          id: 'ingressos',
          label: 'Ingressos',
          icon: Ticket,
          href: '/admin/ingressos'
        },
        {
          id: 'atracoes',
          label: 'Atrações',
          icon: MapPin,
          href: '/admin/atracoes'
        },
        {
          id: 'promocoes',
          label: 'Promoções',
          icon: Gift,
          href: '/admin/promocoes'
        },
        {
          id: 'upload',
          label: 'Upload',
          icon: Upload,
          href: '/admin/upload'
        }
      ]
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      href: '/admin/clientes',
      badge: 23
    },
    {
      id: 'reservas',
      label: 'Reservas',
      icon: Calendar,
      href: '/admin/reservas',
      badge: 5
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: CreditCard,
      href: '#',
      children: [
        {
          id: 'pagamentos',
          label: 'Pagamentos',
          icon: CreditCard,
          href: '/admin/pagamentos'
        },
        {
          id: 'vouchers',
          label: 'Vouchers',
          icon: FileText,
          href: '/admin/vouchers'
        }
      ]
    },
    {
      id: 'comunicacao',
      label: 'Comunicação',
      icon: MessageSquare,
      href: '#',
      children: [
        {
          id: 'chat',
          label: 'Chat IA',
          icon: MessageSquare,
          href: '/admin/chat'
        },
        {
          id: 'email-marketing',
          label: 'Email Marketing',
          icon: Mail,
          href: '/admin/email-marketing'
        }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      href: '/admin/relatorios'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      href: '/admin/analytics'
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: Shield,
      href: '#',
      children: [
        {
          id: 'monitoramento',
          label: 'Monitoramento',
          icon: Activity,
          href: '/admin/monitoramento'
        },
        {
          id: 'backup',
          label: 'Backup',
          icon: Database,
          href: '/admin/backup'
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: Settings,
          href: '/admin/configuracoes'
        }
      ]
    }
  ];

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // Se estiver na página de login, não mostrar o layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Reservei Admin</h1>
                <p className="text-xs text-gray-500">Painel Administrativo</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Busca */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>

            {/* Notificações */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Menu do usuário */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@reservei.com</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } fixed lg:relative h-screen z-40`}>
          <ScrollArea className="h-full">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && <ChevronRight className="h-4 w-4" />}
                      </div>
                      {!isCollapsed && (
                        <div className="ml-6 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                pathname === child.href
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <child.icon className="h-4 w-4" />
                              <span>{child.label}</span>
                              {child.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <Badge variant="secondary">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Conteúdo principal */}
        <main className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AuthProvider>
  );
} 