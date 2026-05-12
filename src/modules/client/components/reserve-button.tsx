"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReserveDialog } from "@/components/reserve-dialog"
import { LoginDialog } from "@/src/modules/shared/auth/login-dialog"
import { useAuth } from "@/src/modules/shared/auth/auth-context"

interface ReserveButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ReserveButton({ children, className, size, variant }: ReserveButtonProps) {
  const [showReserve, setShowReserve] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { user } = useAuth() // FIX: I-check kung may naka login ba

  const handleClick = () => {
    if (user) {
      // Kung may user na naka-login, buksan agad ang Booking form
      setShowReserve(true)
    } else {
      // Kung WALANG user, buksan ang Login Dialog!
      setShowLogin(true)
    }
  }

  return (
    <>
      <Button className={className} size={size} variant={variant} onClick={handleClick}>
        {children}
      </Button>

      {/* Renders the correct dialog depending on the user's state */}
      {user ? (
        <ReserveDialog open={showReserve} onOpenChange={setShowReserve} />
      ) : (
        // FIX: Gumawa ako ng maliit na hack para ma-control yung pagbukas ng LoginDialog
        // Kasi wala siyang "open" at "onOpenChange" props natively from labas unless baguhin natin yung code nun.
        // Pero the best way is using CustomEvent na ginawa natin kanina!
        <span 
          style={{ display: 'none' }} 
          ref={(el) => {
             if (el && showLogin) {
               window.dispatchEvent(new Event("openLoginDialog"));
               setShowLogin(false);
             }
          }} 
        />
      )}
    </>
  )
}