"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export interface Booking {
  id: string
  userId: string
  userName: string
  userEmail: string
  eventName: string
  date: string
  startTime: string
  endTime: string
  guests: number
  status: BookingStatus
  createdAt: string
  paymentStatus?: "pending" | "partial" | "paid"
}

interface BookingContextType {
  bookings: Booking[]
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Promise<void>
  updateBookingStatus: (id: string, status: BookingStatus) => void
  getUserBookings: (userId: string) => Booking[]
  cancelBooking: (id: string) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const STORAGE_KEY = "oneestela_global_bookings"

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const { toast } = useToast()

  // Load bookings on mount
  useEffect(() => {
    const loadBookings = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setBookings(JSON.parse(stored))
      }
    }
    loadBookings()

    // Listen for cross-tab updates (fixes the sync issue)
    window.addEventListener("storage", loadBookings)
    window.addEventListener("bookingsUpdated", loadBookings)
    return () => {
      window.removeEventListener("storage", loadBookings)
      window.removeEventListener("bookingsUpdated", loadBookings)
    }
  }, [])

  const addBooking = async (bookingData: Omit<Booking, "id" | "createdAt" | "status">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      paymentStatus: "pending"
    }

    const updatedBookings = [...bookings, newBooking]
    setBookings(updatedBookings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings))
    
    // Dispatch event to force other components (like Admin Dashboard) to update immediately
    window.dispatchEvent(new Event("bookingsUpdated"))
  }

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    const updatedBookings = bookings.map(b => (b.id === id ? { ...b, status } : b))
    setBookings(updatedBookings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings))
    window.dispatchEvent(new Event("bookingsUpdated"))
  }

  const cancelBooking = (id: string) => {
    updateBookingStatus(id, "cancelled")
    toast({ title: "Booking Cancelled", description: "The reservation has been cancelled." })
  }

  const getUserBookings = (userId: string) => {
    return bookings.filter(b => b.userId === userId)
  }

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBookingStatus, getUserBookings, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider")
  }
  return context
}