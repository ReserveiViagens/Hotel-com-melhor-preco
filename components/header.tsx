'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/hooks/use-client-auth';
import { useModules } from '@/hooks/use-modules';
import { User, LogOut, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { user, isAuthenticated, logout } = useClientAuth();
  const { activeModules, loading } = useModules();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Função para gerar o href baseado no nome do módulo
  const getModuleHref = (moduleName: string) => {
    const hrefMap: { [key: string]: string } = {
      'hoteis': '/hoteis',
      'ingressos': '/ingressos', 
      'atracoes': '/atracoes',
      'eventos': '/eventos',
      'transportes': '/transportes',
      'restaurantes': '/restaurantes',
      'lojas': '/lojas',
      'servicos': '/servicos'
    };
    return hrefMap[moduleName] || `/${moduleName}`;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo-reservei.png"
                alt="Reservei Viagens"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Reservei Viagens
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {!loading && activeModules.map((module) => (
              <Link
                key={module.id}
                href={getModuleHref(module.name)}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {module.label}
              </Link>
            ))}
            <Link
              href="/promocoes"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Promoções
            </Link>
            <Link
              href="/contato"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/cadastro">
                  <Button>Criar Conta</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {!loading && activeModules.map((module) => (
                <Link
                  key={module.id}
                  href={getModuleHref(module.name)}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {module.label}
                </Link>
              ))}
              <Link
                href="/promocoes"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Promoções
              </Link>
              <Link
                href="/contato"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </Link>
              
              {/* Mobile Auth */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="flex items-center px-3 py-2">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{user?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="ml-auto"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/cadastro" className="block">
                      <Button className="w-full justify-start">
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 