"use client"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useChat } from "@/src/modules/shared/contexts/chat-context"
import { LayoutDashboard, Calendar, CreditCard, User, LogOut, MessageSquare } from "lucide-react"

// Chat widget import
import { UnifiedChatWidget } from "@/src/modules/shared/components/unified-chat-widget"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  
  // FIX: Kinuha natin ang unreadClientCount para sa Red Dot
  const { unreadClientCount } = useChat()

  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/portal",
      icon: LayoutDashboard,
    },
    {
      title: "My Bookings",
      href: "/portal/bookings",
      icon: Calendar,
    },
    {
      title: "My Transactions",
      href: "/portal/payments",
      icon: CreditCard,
    },
    {
      title: "Chat with Admin",
      href: "/portal/chat",
      icon: MessageSquare,
      hasDotBadge: unreadClientCount > 0 // Ito ang magti-trigger ng red dot
    },
    {
      title: "Profile",
      href: "/portal/profile",
      icon: User,
    },
  ]

  // STRICT AUTH GUARD: Waits for loading to finish before kicking to homepage
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Show a loading spinner while verifying session so it doesn't flicker
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Return nothing while checking auth to prevent layout flickering
  if (!user) {
    return null 
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">One Estela Place</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-blue-700" : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                    {item.title}

                    {/* RED DOT NOTIFICATION INDICATOR */}
                    {item.hasDotBadge && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm ml-auto"></span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              // FIX LOGOUT BUG: Buburahin lang natin ang temporary IDs
              localStorage.removeItem("mock_client_id")
              localStorage.removeItem("mock_guest_id")
              
              logout()
              router.push("/")
            }}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Hide the floating widget if the user is on the full-screen chat page */}
      {pathname !== "/portal/chat" && <UnifiedChatWidget />}
    </div>
  )
}