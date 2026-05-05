"use client"

import type React from "react"
import { useEffect, useMemo } from "react" 
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Star,
  Users,
  LogOut,
  BookOpen,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { usePaymentProof } from "@/components/payment-proof-context"

// IN-IMPORT NATIN YUNG BOOKING CONTEXT DITO BAKS!
import { useBookings } from "@/components/booking-context"

import { useAuth } from "../auth/auth-context"
import { useChat } from "../contexts/chat-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const { logout, user, isLoading } = useAuth() 
  const { getPendingPaymentProofs } = usePaymentProof()
  const { messages, unreadCount } = useChat()

  // KINUHA NATIN YUNG BOOKINGS PARA MA-CHECK KUNG MAY PENDING
  const { bookings } = useBookings()
  const hasPendingBookings = bookings?.some((b: any) => b.status === "pending")

  const pendingPayments = getPendingPaymentProofs().length

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
      } else if (user.role === "user" && pathname.startsWith("/dashboard")) {
        router.push("/portal")
      }
    }
  }, [user, isLoading, router, pathname])

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { 
      name: "Booking Management", 
      href: "/dashboard/bookings", 
      icon: BookOpen,
      // DINAGDAG NATIN TONG PING BADGE PARA SA PENDING BOOKINGS
      hasPingBadge: hasPendingBookings 
    },
    { 
      name: "Customer Chat", 
      href: "/dashboard/chat", 
      icon: MessageSquare,
      hasDotBadge: unreadCount > 0 
    },
    {
      name: "Payment Verification",
      href: "/dashboard/payments",
      icon: CreditCard,
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
    { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Staff Management", href: "/dashboard/staff", icon: UserCheck },
    { name: "CMS Settings", href: "/dashboard/cms", icon: Settings },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Users Information", href: "/users", icon: Users },
  ]

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    
    // Safe remove na lang ng temporary chat IDs para hindi ma-nuke ang database.
    localStorage.removeItem("mock_client_id")
    localStorage.removeItem("mock_guest_id")
    
    logout()
    router.push("/")
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 min-w-[1024px]">
        <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col p-4 space-y-8 animate-pulse">
          <div className="h-6 w-3/4 bg-gray-200 rounded mx-auto mt-2"></div>
          <div className="space-y-3 mt-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-100 rounded-md"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8 space-y-8 flex flex-col">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden min-w-[1024px] bg-gray-50">
      <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col shadow-sm">
        <div className="flex items-center px-6 border-b h-16">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            One Estela Place
          </h1>
        </div>
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  {item.name}
                </div>
                
                {/* DITO NATIN NILAGAY YUNG LOGIC PARA SA PING EFFECT */}
                {item.hasPingBadge ? (
                  <span className="relative flex h-2.5 w-2.5 ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                ) : item.hasDotBadge ? (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm ml-auto"></span>
                ) : item.badge ? (
                  <Badge className="bg-red-500 text-white border-none text-[10px] h-5 min-w-[20px] flex items-center justify-center ml-auto">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4 bg-gray-50/50">
          <div className="mb-4 px-3 py-2 rounded-lg bg-white border border-gray-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                {user.name?.charAt(0) || "U"}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate capitalize">{user.role}</p>
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="flex w-full items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-9" 
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <main className={pathname === "/dashboard/chat" ? "p-0 flex-1 flex flex-col" : "p-8 flex-1"}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout