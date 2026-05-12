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
import { 
  Menu, X, User, FileText, HelpCircle, LogOut, LayoutDashboard, Loader2, 
  Facebook, Instagram, MapPin, Phone, Mail 
} from "lucide-react"

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

  const handleLogout = () => {
    logout()
  }

  // Smooth scroll handler na gagamitin natin para sa links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault()
      const elementId = href.replace("/#", "#")
      const element = document.querySelector(elementId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        setIsMobileMenuOpen(false)
      }
    } else {
      // Kung wala sa landing page, hayaang mag-navigate normal
      router.push(href)
    }
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
    <div className="min-h-screen flex flex-col bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black">
              One Estela Place
            </Link>

            <div className="hidden items-center space-x-4 md:flex">
              {isLoading ? (
                <div className="flex items-center px-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LoginDialog trigger={<Button variant="ghost">Login</Button>} />
                  <SignupDialog trigger={<Button className="bg-amber-700 hover:bg-amber-800 text-white">Reserve Now</Button>} />
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
                <div className="flex flex-col gap-2">
                  <LoginDialog trigger={<Button variant="outline" className="w-full">Login</Button>} />
                  <SignupDialog trigger={<Button className="w-full bg-amber-700 text-white hover:bg-amber-800">Reserve Now</Button>} />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16 flex-grow">{children}</main>

      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold tracking-tight">One Estela Place</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Creating unforgettable moments for your special events. The perfect place for weddings, birthdays, and corporate gatherings.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm flex flex-col items-start">
              <li>
                <a href="/#home" onClick={(e) => handleNavClick(e, "/#home")} className="hover:text-amber-500 transition-colors cursor-pointer">Home</a>
              </li>
              <li>
                <a href="/#about" onClick={(e) => handleNavClick(e, "/#about")} className="hover:text-amber-500 transition-colors cursor-pointer">About Us</a>
              </li>
              <li>
                <a href="/#faqs" onClick={(e) => handleNavClick(e, "/#faqs")} className="hover:text-amber-500 transition-colors cursor-pointer">FAQs</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <span>123 Event Street, City, State 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <span>info@oneestela.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} One Estela Place. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/#faqs" onClick={(e) => handleNavClick(e, "/#faqs")} className="hover:text-white transition-colors cursor-pointer">FAQs</a>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}