"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReserveDialog } from "@/components/reserve-dialog"

interface ReserveButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ReserveButton({ children, className, size, variant }: ReserveButtonProps) {
  const [showReserve, setShowReserve] = useState(false)

  return (
    <>
      <Button className={className} size={size} variant={variant} onClick={() => setShowReserve(true)}>
        {children}
      </Button>
      <ReserveDialog open={showReserve} onOpenChange={setShowReserve} />
    </>
  )
}
