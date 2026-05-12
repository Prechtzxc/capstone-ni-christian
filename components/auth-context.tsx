"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mockDatabase, type User } from "@/lib/mock-db"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  googleSignIn: () => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Read from the mock database
    const foundUser = mockDatabase.users.find((u) => u.email === email && u.password === password)

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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const existingUser = mockDatabase.users.find((u) => u.email === email)
    if (existingUser) {
      setIsLoading(false)
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: `${firstName} ${lastName}`,
      email,
      password,
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user",
    }

    // Write to the mock database
    mockDatabase.users.push(newUser)

    const { password: _, ...userSession } = newUser
    
    setUser(userSession)
    localStorage.setItem("user", JSON.stringify(userSession))

    setIsLoading(false)
    return true
  }

  const googleSignIn = async (): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const googleUser: User = {
      id: "google_" + Date.now(),
      name: "Google User",
      email: "google.user@gmail.com",
      password: "google_oauth_mock", 
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user",
    }

    mockDatabase.users.push(googleUser)

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
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        googleSignIn,
        isLoading,
      }}
    >
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