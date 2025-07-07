"use client"

import { useState, useEffect } from 'react'

interface Module {
  id: string
  name: string
  label: string
  icon: string
  active: boolean
  order: number
  config: {
    colors: {
      primary: string
      secondary: string
      accent: string
    }
    layout: string
    filters: string[]
    seo: {
      title: string
      description: string
    }
  }
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([])
  const [activeModules, setActiveModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/modules')
      if (!response.ok) {
        throw new Error('Erro ao carregar módulos')
      }
      const data = await response.json()
      setModules(data)
      setActiveModules(data.filter((module: Module) => module.active))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getModuleByName = (name: string) => {
    return modules.find(module => module.name === name)
  }

  const getActiveModuleByName = (name: string) => {
    return activeModules.find(module => module.name === name)
  }

  const isModuleActive = (name: string) => {
    return activeModules.some(module => module.name === name)
  }

  return {
    modules,
    activeModules,
    loading,
    error,
    fetchModules,
    getModuleByName,
    getActiveModuleByName,
    isModuleActive
  }
} 