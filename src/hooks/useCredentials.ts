import { useCallback, useState } from 'react'
import type { Credentials } from '../types'

const STORAGE_KEY = 'greenApi:credentials'

const isCredentials = (value: unknown): value is Credentials => {
  if (!value || typeof value !== 'object') return false
  const { apiUrl, idInstance, apiTokenInstance } = value as Record<string, unknown>
  return typeof apiUrl === 'string' && typeof idInstance === 'string' && typeof apiTokenInstance === 'string'
}

const readCredentials = (): Credentials | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useCredentials = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(readCredentials)

  const login = useCallback((next: Credentials) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setCredentials(next)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
  }, [])

  return { credentials, login, logout }
}
