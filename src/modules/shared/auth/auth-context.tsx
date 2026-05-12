"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin" | "owner"
  phone?: string // FIX: idinagdag na yung phone number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  // FIX: Inupdate natin parameters para tanggapin yung middle name at phone!
  signup: (firstName: string, lastName: string, email: string, password: string, middleName?: string, phone?: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// MGA DEFAULT ACCOUNTS NATIN (I-note mo 'to baks kung maglo-login ka!)
const defaultDemoUsers = [
  { id: "1", name: "John Doe", email: "user@oneestela.com", password: "user123", avatar: "/placeholder.svg?height=40&width=40", role: "user" as const, phone: "+639123456789" },
  { id: "2", name: "Demo Admin", email: "demo@oneestela.com", password: "demo123", avatar: "/placeholder.svg?height=40&width=40", role: "admin" as const, phone: "+639123456789" },
  { id: "3", name: "Admin User", email: "admin@oneestela.com", password: "admin123", avatar: "/placeholder.svg?height=40&width=40", role: "admin" as const, phone: "+639123456789" },
  { id: "4", name: "Owner", email: "owner@oneestela.com", password: "owner123", avatar: "/placeholder.svg?height=40&width=40", role: "owner" as const, phone: "+639123456789" },
]

// BULLETPROOF DATABASE LOADER
const getDbUsers = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mock_users_db")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch(e) {}
    }
    localStorage.setItem("mock_users_db", JSON.stringify(defaultDemoUsers))
    return defaultDemoUsers
  }
  return []
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      getDbUsers() // Init DB to ensure it's alive

      const savedLocal = localStorage.getItem("user")
      const savedSession = sessionStorage.getItem("user")
      const savedUser = savedLocal || savedSession

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser && parsedUser.name && parsedUser.email) {
            setUser(parsedUser)
          } else {
            localStorage.removeItem("user")
            sessionStorage.removeItem("user")
          }
        } catch (error) {
          localStorage.removeItem("user")
          sessionStorage.removeItem("user")
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const usersDb = getDbUsers()
    const cleanEmail = email.trim().toLowerCase()
    
    // Check if user exists sa local Database
    const foundUser = usersDb.find((u: any) => u.email.toLowerCase() === cleanEmail && u.password === password)

    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
        role: foundUser.role,
        phone: foundUser.phone
      }

      setUser(userSession)

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userSession))
        localStorage.setItem("rememberedEmail", email)
      } else {
        sessionStorage.setItem("user", JSON.stringify(userSession))
      }

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const signup = async (firstName: string, lastName: string, email: string, password: string, middleName?: string, phone?: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const usersDb = getDbUsers()
    const cleanEmail = email.trim().toLowerCase()
    
    // Check kung may gumagamit na ba nung email
    const existingUser = usersDb.find((u: any) => u.email.toLowerCase() === cleanEmail)

    if (existingUser) {
      setIsLoading(false)
      return false
    }

    // Format ang name
    const fullName = middleName ? `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}` : `${firstName.trim()} ${lastName.trim()}`

    const newUser = {
      id: "user_" + Date.now().toString(),
      name: fullName,
      email: cleanEmail,
      password: password,
      phone: phone || "",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user" as const,
    }

    // I-save ang BAGONG user sa database natin
    const updatedDb = [...usersDb, newUser]
    localStorage.setItem("mock_users_db", JSON.stringify(updatedDb))

    const { password: _, ...userSession } = newUser

    setUser(userSession)
    localStorage.setItem("user", JSON.stringify(userSession))

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    window.location.replace("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}