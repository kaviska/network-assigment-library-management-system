'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Admin {
  id: number
  email: string
  name: string
  createdDate: string
  lastLogin: string | null
  active: boolean
}

interface AuthContextType {
  admin: Admin | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      setToken(savedToken)
      fetchAdminProfile(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchAdminProfile = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const adminData = await response.json()
        setAdmin(adminData)
      } else {
        // Invalid token, remove it
        localStorage.removeItem('authToken')
        setToken(null)
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      localStorage.removeItem('authToken')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setAdmin(data.admin)
        localStorage.setItem('authToken', data.token)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      setToken(null)
      localStorage.removeItem('authToken')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!admin && !!token,
      }}
    >
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