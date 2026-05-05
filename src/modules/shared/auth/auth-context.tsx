"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin" | "owner"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  googleSignIn: () => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultDemoUsers = [
  { id: "1", name: "John Doe", email: "user@oneestela.com", password: "user123", avatar: "/placeholder.svg?height=40&width=40", role: "user" as const },
  { id: "2", name: "Demo Admin", email: "demo@oneestela.com", password: "demo123", avatar: "/placeholder.svg?height=40&width=40", role: "admin" as const },
  { id: "3", name: "Admin User", email: "admin@oneestela.com", password: "admin123", avatar: "/placeholder.svg?height=40&width=40", role: "admin" as const },
  { id: "4", name: "Owner", email: "owner@oneestela.com", password: "owner123", avatar: "/placeholder.svg?height=40&width=40", role: "owner" as const },
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
    const foundUser = usersDb.find((u: any) => u.email.toLowerCase() === cleanEmail && u.password === password)

    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
        role: foundUser.role,
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

  const signup = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const usersDb = getDbUsers()
    const cleanEmail = email.trim().toLowerCase()
    const existingUser = usersDb.find((u: any) => u.email.toLowerCase() === cleanEmail)

    if (existingUser) {
      setIsLoading(false)
      return false
    }

    const newUser = {
      id: "user_" + Date.now().toString(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: cleanEmail,
      password: password,
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user" as const,
    }

    // SOLID SAVE TO DB
    const updatedDb = [...usersDb, newUser]
    localStorage.setItem("mock_users_db", JSON.stringify(updatedDb))

    const { password: _, ...userSession } = newUser

    setUser(userSession)
    localStorage.setItem("user", JSON.stringify(userSession))

    setIsLoading(false)
    return true
  }

  const googleSignIn = async (): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const googleUser = {
      id: "google_" + Date.now(),
      name: "Google User",
      email: "google.user@gmail.com",
      password: "google_oauth_mock",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user" as const,
    }

    const usersDb = getDbUsers()
    const updatedDb = [...usersDb, googleUser]
    localStorage.setItem("mock_users_db", JSON.stringify(updatedDb))

    const { password: _, ...userSession } = googleUser
    setUser(userSession)
    localStorage.setItem("user", JSON.stringify(userSession))

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    localStorage.removeItem("mock_client_id")
    localStorage.removeItem("mock_guest_id")
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, googleSignIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}