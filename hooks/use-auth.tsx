"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'client'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'admin' | 'client'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há um token salvo
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Decodificar o token e obter informações do usuário
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.userId,
          name: payload.name || 'Admin',
          email: payload.email,
          role: payload.role
        })
      } catch (error) {
        console.error('Erro ao decodificar token:', error)
        localStorage.removeItem('adminToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer login')
      }

      const data = await response.json()
      localStorage.setItem('adminToken', data.token)
      
      // Decodificar o token para obter informações do usuário
      const payload = JSON.parse(atob(data.token.split('.')[1]))
      setUser({
        id: payload.userId,
        name: payload.name || 'Admin',
        email: payload.email,
        role: payload.role
      })

      router.push('/admin')
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setUser(null)
    router.push('/admin/login')
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar conta')
      }

      const result = await response.json()
      
      // Fazer login automaticamente após o cadastro
      await login(data.email, data.password)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 