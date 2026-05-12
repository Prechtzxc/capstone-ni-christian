"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// FIX: DINAGDAG ANG "incomplete_downpayment" SA STATUS TYPES!
export type BookingStatus = "pending" | "verifying" | "confirmed" | "completed" | "cancelled" | "declined" | "cancellation_requested" | "incomplete_downpayment"

export interface Booking {
  id: string
  userId: string
  venueId?: string
  venue?: string
  eventName: string
  eventType: string
  guestCount: number
  date: string
  time?: string
  startTime: string
  endTime: string
  specialRequests?: string
  status: BookingStatus
  createdAt: string
  userInfo?: {
    name: string
    email: string
    phone: string
  }
  cancellationReason?: string
  previousStatus?: BookingStatus 
}

interface BookingContextType {
  bookings: Booking[]
  maintenanceDates: string[] 
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Promise<void>
  updateBookingStatus: (id: string, status: BookingStatus) => void
  cancelBooking: (id: string) => void
  deleteBooking: (id: string) => void
  getUserBookings: (userId: string) => Booking[]
  requestCancellation: (id: string, reason: string) => void
  rejectCancellation: (id: string) => void
  toggleMaintenanceDate: (date: string, venueId: string) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const BOOKINGS_STORAGE_KEY = "oneestela_global_bookings_v2" 
const MAINTENANCE_STORAGE_KEY = "oneestela_global_maintenance_v2"

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [maintenanceDates, setMaintenanceDates] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY)
      const storedMaint = localStorage.getItem(MAINTENANCE_STORAGE_KEY)
      if (stored) {
        try { setBookings(JSON.parse(stored)) } catch (e) { console.error(e) }
      }
      if (storedMaint) {
        try { setMaintenanceDates(JSON.parse(storedMaint)) } catch (e) { console.error(e) }
      }

      const handleStorage = () => {
        const freshData = localStorage.getItem(BOOKINGS_STORAGE_KEY)
        const freshMaint = localStorage.getItem(MAINTENANCE_STORAGE_KEY)
        if (freshData) setBookings(JSON.parse(freshData))
        if (freshMaint) setMaintenanceDates(JSON.parse(freshMaint))
      }
      
      window.addEventListener("storage", handleStorage)
      window.addEventListener("bookingsUpdated", handleStorage)
      
      return () => {
        window.removeEventListener("storage", handleStorage)
        window.removeEventListener("bookingsUpdated", handleStorage)
      }
    }
  }, [])

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings)
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(newBookings))
      window.dispatchEvent(new Event("bookingsUpdated"))
    }
  }

  const saveMaintenance = (newDates: string[]) => {
    setMaintenanceDates(newDates)
    if (typeof window !== "undefined") {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(newDates))
      window.dispatchEvent(new Event("bookingsUpdated"))
    }
  }

  const addBooking = async (bookingData: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = { ...bookingData, id: "BK" + Math.floor(Math.random() * 10000).toString().padStart(4, "0"), createdAt: new Date().toISOString() }
    saveBookings([...bookings, newBooking])
  }

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    const updatedBookings = bookings.map(b => (b.id === id ? { ...b, status } : b))
    saveBookings(updatedBookings)
  }

  const cancelBooking = (id: string) => updateBookingStatus(id, "cancelled")
  const deleteBooking = (id: string) => saveBookings(bookings.filter(b => b.id !== id))
  const getUserBookings = (userId: string) => bookings.filter(b => b.userId === userId)

  const requestCancellation = (id: string, reason: string) => {
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, previousStatus: b.status, status: "cancellation_requested" as BookingStatus, cancellationReason: reason } : b)
    saveBookings(updatedBookings)
  }

  const rejectCancellation = (id: string) => {
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: (b.previousStatus || "confirmed") as BookingStatus, cancellationReason: undefined, previousStatus: undefined } : b)
    saveBookings(updatedBookings)
  }

  const toggleMaintenanceDate = (date: string, venueId: string) => {
    const key = `${venueId}|${date}`
    if (maintenanceDates.includes(key)) {
      saveMaintenance(maintenanceDates.filter(d => d !== key))
      toast({ title: "Maintenance Removed", description: `Venue is now available on ${date}.` })
    } else {
      saveMaintenance([...maintenanceDates, key])
      toast({ title: "Maintenance Set", description: `Venue is now blocked on ${date}.`, className: "bg-slate-900 text-white" })
    }
  }

  return (
    <BookingContext.Provider 
      value={{ 
        bookings, maintenanceDates, addBooking, updateBookingStatus, cancelBooking, 
        deleteBooking, getUserBookings, requestCancellation, rejectCancellation, toggleMaintenanceDate
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingContext)
  if (context === undefined) throw new Error("useBookings must be used within a BookingProvider")
  return context
}