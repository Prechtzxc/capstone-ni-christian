"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { VirtualTour } from "@/src/modules/client/components/virtual-tour" // FIX: Diretso na sa tamang file!
import { Camera } from "lucide-react"

interface TourButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function TourButton({ children, className, size, variant }: TourButtonProps) {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <Button className={className} size={size} variant={variant} onClick={() => setShowTour(true)}>
        <Camera className="mr-2 h-4 w-4" />
        {children}
      </Button>

      {/* Bubukas agad ang tour, walang login na haharang! */}
      <VirtualTour open={showTour} onOpenChange={setShowTour} />
    </>
  )
}