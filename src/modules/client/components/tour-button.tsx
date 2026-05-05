"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { VirtualTour } from "@/components/virtual-tour"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Camera, X } from "lucide-react"

interface TourButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function TourButton({ children, className, size, variant }: TourButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showTour, setShowTour] = useState(false)
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false)

  // Show welcome notification when tour is opened by a logged-in user
  useEffect(() => {
    if (showTour && user && !showWelcomeNotification) {
      setShowWelcomeNotification(true)
    }
  }, [showTour, user, showWelcomeNotification])

  const handleTourClick = () => {
    setShowTour(true)
    if (user) {
      setShowWelcomeNotification(true)
    }
  }

  const dismissWelcomeNotification = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    setShowWelcomeNotification(false)
  }

  return (
    <>
      <Button className={className} size={size} variant={variant} onClick={handleTourClick}>
        <Camera className="mr-2 h-4 w-4" />
        {children}
      </Button>

      <VirtualTour open={showTour} onOpenChange={setShowTour} />

      {/* Welcome Notification - Only shows for logged-in users when tour is active */}
      {showTour && showWelcomeNotification && user && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md">
          <div className="flex items-center">
            <Camera className="mr-3 h-5 w-5" />
            <div>
              <p className="font-medium">Welcome to the virtual tour!</p>
              <p className="text-sm text-blue-100">Explore our venue with the 360-degree experience.</p>
            </div>
          </div>
          <button
            onClick={dismissWelcomeNotification}
            className="ml-4 p-1 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
