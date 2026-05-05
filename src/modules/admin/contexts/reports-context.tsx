"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface BookingReport {
  totalBookings: number
  dailyBookings: { date: string; count: number }[]
  weeklyBookings: { week: string; count: number }[]
  monthlyBookings: { month: string; count: number }[]
  mostBookedAreas: { area: string; count: number }[]
  peakTimes: { time: string; count: number }[]
  cancellations: number
  noShows: number
  occupancyRate: { area: string; rate: number }[]
}

export interface RevenueReport {
  totalRevenue: number
  dailyRevenue: { date: string; amount: number }[]
  monthlyRevenue: { month: string; amount: number }[]
  revenueByArea: { area: string; amount: number }[]
  revenueByEventType: { eventType: string; amount: number }[]
  paymentStatus: { status: string; count: number; amount: number }[]
  refunds: { total: number; amount: number }
}

export interface InquiryReport {
  totalInquiries: number
  dailyInquiries: { date: string; count: number }[]
  weeklyInquiries: { week: string; count: number }[]
  averageResponseTime: number
  topTopics: { topic: string; count: number }[]
  responseRate: number
}

export interface CustomerReport {
  totalCustomers: number
  newSignups: { month: string; count: number }[]
  repeatCustomers: number
  customerRetentionRate: number
  topCustomers: { name: string; bookings: number; revenue: number }[]
}

interface ReportsContextType {
  bookingReport: BookingReport
  revenueReport: RevenueReport
  inquiryReport: InquiryReport
  customerReport: CustomerReport
  generateReports: () => void
  isLoading: boolean
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const [bookingReport, setBookingReport] = useState<BookingReport>({
    totalBookings: 156,
    dailyBookings: [
      { date: "2025-01-20", count: 8 },
      { date: "2025-01-21", count: 12 },
      { date: "2025-01-22", count: 6 },
      { date: "2025-01-23", count: 15 },
      { date: "2025-01-24", count: 10 },
      { date: "2025-01-25", count: 18 },
    ],
    weeklyBookings: [],
    monthlyBookings: [
      { month: "2024-10", count: 45 },
      { month: "2024-11", count: 52 },
      { month: "2024-12", count: 38 },
      { month: "2025-01", count: 21 },
    ],
    mostBookedAreas: [
      { area: "Main Hall", count: 45 },
      { area: "Garden Area", count: 38 },
      { area: "Rooftop", count: 32 },
      { area: "Conference Room", count: 25 },
      { area: "Ballroom", count: 16 },
    ],
    peakTimes: [
      { time: "6:00 PM - 8:00 PM", count: 45 },
      { time: "2:00 PM - 4:00 PM", count: 38 },
      { time: "10:00 AM - 12:00 PM", count: 32 },
      { time: "8:00 PM - 10:00 PM", count: 28 },
    ],
    cancellations: 12,
    noShows: 5,
    occupancyRate: [
      { area: "Main Hall", rate: 85 },
      { area: "Garden Area", rate: 72 },
      { area: "Rooftop", rate: 68 },
      { area: "Conference Room", rate: 91 },
      { area: "Ballroom", rate: 64 },
    ],
  })

  const [revenueReport, setRevenueReport] = useState<RevenueReport>({
    totalRevenue: 245680,
    dailyRevenue: [
      { date: "2025-01-20", amount: 3200 },
      { date: "2025-01-21", amount: 4800 },
      { date: "2025-01-22", amount: 2400 },
      { date: "2025-01-23", amount: 6000 },
      { date: "2025-01-24", amount: 4000 },
      { date: "2025-01-25", amount: 7200 },
    ],
    monthlyRevenue: [
      { month: "2024-10", amount: 68500 },
      { month: "2024-11", amount: 72300 },
      { month: "2024-12", amount: 58200 },
      { month: "2025-01", amount: 46680 },
    ],
    revenueByArea: [],
    revenueByEventType: [
      { eventType: "Wedding", amount: 125000 },
      { eventType: "Corporate Event", amount: 68000 },
      { eventType: "Birthday Party", amount: 32000 },
      { eventType: "Conference", amount: 20680 },
    ],
    paymentStatus: [
      { status: "Paid", count: 108, amount: 172000 },
      { status: "Pending", count: 32, amount: 49000 },
      { status: "Unpaid", count: 16, amount: 24680 },
    ],
    refunds: { total: 3, amount: 8500 },
  })

  const [inquiryReport, setInquiryReport] = useState<InquiryReport>({
    totalInquiries: 234,
    dailyInquiries: [
      { date: "2025-01-20", count: 12 },
      { date: "2025-01-21", count: 18 },
      { date: "2025-01-22", count: 8 },
      { date: "2025-01-23", count: 22 },
      { date: "2025-01-24", count: 15 },
      { date: "2025-01-25", count: 25 },
    ],
    weeklyInquiries: [],
    averageResponseTime: 4.5,
    topTopics: [
      { topic: "Wedding Packages", count: 45 },
      { topic: "Corporate Events", count: 32 },
      { topic: "Pricing Information", count: 28 },
      { topic: "Availability", count: 25 },
      { topic: "Catering Options", count: 18 },
    ],
    responseRate: 87.2,
  })

  const [customerReport, setCustomerReport] = useState<CustomerReport>({
    totalCustomers: 89,
    newSignups: [
      { month: "2024-09", count: 12 },
      { month: "2024-10", count: 18 },
      { month: "2024-11", count: 15 },
      { month: "2024-12", count: 22 },
      { month: "2025-01", count: 19 },
    ],
    repeatCustomers: 23,
    customerRetentionRate: 25.8,
    topCustomers: [
      { name: "Sarah Johnson", bookings: 5, revenue: 18500 },
      { name: "Michael Chen", bookings: 4, revenue: 15200 },
      { name: "Emily Davis", bookings: 3, revenue: 12800 },
      { name: "David Wilson", bookings: 3, revenue: 11500 },
      { name: "Lisa Anderson", bookings: 2, revenue: 9800 },
    ],
  })

  const generateReports = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch fresh data from your API
      setIsLoading(false)
    }, 1000)
  }

  return (
    <ReportsContext.Provider
      value={{
        bookingReport,
        revenueReport,
        inquiryReport,
        customerReport,
        generateReports,
        isLoading,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
