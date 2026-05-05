"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/avatar"
import { Menu, X, User, FileText, HelpCircle, LogOut, LayoutDashboard, Loader2 } from "lucide-react"

import { useAuth } from "@/src/modules/shared/auth/auth-context" 

import { LoginDialog } from "@shared/auth/login-dialog"
import { SignupDialog } from "@shared/auth/signup-dialog"
import { ReserveButton } from "@client/components/reserve-button"
import { UnifiedChatWidget } from "@shared/components/unified-chat-widget"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const { user, logout, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 1. UPDATED ROUTE GUARD: Instantly pushes ALL logged-in users to their portals
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "owner") {
        router.push("/dashboard")
      } else {
        router.push("/portal")
      }
    }
  }, [user, router])

  const navItems = [
    { name: "Home", href: "/#home" },
    { name: "About", href: "/#about" },
    { name: "FAQs", href: "/#faqs" },
    { name: "Contact", href: "/#contact" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault()
      const elementId = href.replace("/#", "#")
      const element = document.querySelector(elementId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        setIsMobileMenuOpen(false)
      }
    }
  }

  const handleLogout = () => {
    logout()
  }

  // 2. UPDATED FOUC PREVENTER: Completely hides the landing page the millisecond ANY user logs in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black">
              One Estela Place
            </Link>

            <nav className="hidden space-x-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm font-medium transition-all duration-300 hover:text-orange-600 relative group text-gray-700 cursor-pointer"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full w-0"></span>
                </a>
              ))}
            </nav>

            <div className="hidden items-center space-x-4 md:flex">
              {isLoading ? (
                <div className="flex items-center px-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LoginDialog trigger={<Button variant="ghost">Login</Button>} />
                  <SignupDialog trigger={<Button className="bg-blue-600 hover:bg-blue-700 text-white">Reserve Now</Button>} />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="border-t py-4 md:hidden">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-sm font-medium text-gray-700"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <LoginDialog trigger={<Button variant="outline" className="w-full">Login</Button>} />
                  <SignupDialog trigger={<Button className="w-full bg-blue-600 text-white">Reserve Now</Button>} />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} One Estela Place. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}