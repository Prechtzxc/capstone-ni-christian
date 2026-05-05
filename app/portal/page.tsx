"use client"

import Link from "next/link"
import { Calendar, FileText, CheckCircle, Clock, CreditCard, Check } from "lucide-react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { usePaymentProof } from "@/components/payment-proof-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Custom Peso Icon Component
const PesoIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 6h8a3 3 0 0 1 0 6H7" />
    <path d="M7 12h5" />
    <path d="M7 9h10" />
    <path d="M7 15h10" />
    <path d="M7 18V6" />
  </svg>
)

export default function ClientDashboard() {
  const { user } = useAuth()
  const { getUserBookings } = useBookings()
  const { paymentProofs } = usePaymentProof()

  if (!user) return null

  const myBookings = getUserBookings(user.id)
  const upcomingBookings = myBookings.filter(b => b.status === "confirmed" || b.status === "pending")
  const completedBookings = myBookings.filter(b => b.status === "completed")

  const myBookingIds = myBookings.map(b => b.id)
  const myTransactions = paymentProofs.filter(p => myBookingIds.includes(p.bookingId))
  const pendingPayments = myTransactions.filter(t => t.status === "pending")

  const displayBookings = myBookings.length > 0 ? myBookings : [
    { id: "mock_1", eventName: "Christian's Debut", date: "2026-12-15", startTime: "18:00", status: "for_confirmation" },
    { id: "mock_2", eventName: "Corporate Seminar", date: "2026-08-20", startTime: "08:00", status: "confirmed" },
    { id: "mock_3", eventName: "Photoshoot", date: "2026-06-10", startTime: "13:00", status: "pending" },
  ] as any[]

  const displayTransactions = myTransactions.length > 0 ? myTransactions : [
    { id: "tx_1", bookingId: "mock_1", paymentAmount: "15,000", paymentDate: "2026-05-04", status: "pending" },
    { id: "tx_2", bookingId: "mock_2", paymentAmount: "25,500", paymentDate: "2026-05-01", status: "verified" },
  ] as any[]

  const getEventName = (bookingId: string) => {
    const booking = displayBookings.find(b => b.id === bookingId)
    return booking ? booking.eventName : "Event Payment"
  }

  const getStatusStep = (status: string) => {
    if (status === "completed" || status === "confirmed") return 3
    if (status === "pending" || status === "for_confirmation") return 2
    return 1 
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-500">Welcome to your One Estela Place portal, {user.name.split(' ')[0]}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Upcoming Events</span>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold text-gray-900">{upcomingBookings.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Total Bookings</span>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold text-gray-900">{myBookings.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Completed Events</span>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold text-gray-900">{completedBookings.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        {/* STAT CARD WITH PESO SIGN LOGO */}
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Pending Payments</span>
              <PesoIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold text-gray-900">{pendingPayments.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Bookings {myBookings.length === 0 && <span className="text-xs text-orange-500 font-normal ml-2">(Preview Mode)</span>}</h3>
            <Link href="/portal/bookings" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="flex-1">
            <div className="divide-y divide-gray-100">
              {displayBookings.slice(0, 5).map((booking) => {
                const step = getStatusStep(booking.status);
                return (
                  <div key={booking.id} className="p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-2.5 rounded-full text-blue-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{booking.eventName}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-0.5">
                            <Clock className="w-3 h-3 mr-1" />
                            {booking.date} • {booking.startTime}
                          </p>
                        </div>
                      </div>
                      <Badge variant={step === 3 ? "default" : "secondary"} className="capitalize">
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 pt-4 border-t border-gray-50">
                      <div className="relative flex items-center justify-between w-full">
                        <div className="absolute left-[10%] top-2.5 w-[80%] h-1 bg-gray-100 rounded-full"></div>
                        <div 
                          className="absolute left-[10%] top-2.5 h-1 bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: step === 1 ? '0%' : step === 2 ? '40%' : '80%' }}
                        ></div>

                        <div className="relative flex flex-col items-center gap-1.5 z-10 w-1/3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200'}`}>
                            {step >= 1 && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[11px] font-semibold ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Placed</span>
                        </div>

                        <div className="relative flex flex-col items-center gap-1.5 z-10 w-1/3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200'}`}>
                            {step >= 2 && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[11px] font-semibold ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>For Confirmation</span>
                        </div>

                        <div className="relative flex flex-col items-center gap-1.5 z-10 w-1/3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 3 ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200'}`}>
                            {step >= 3 && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[11px] font-semibold ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Confirmed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Transactions {myTransactions.length === 0 && <span className="text-xs text-orange-500 font-normal ml-2">(Preview Mode)</span>}</h3>
            <Link href="/portal/payments" className="text-sm text-blue-600 hover:underline">Manage</Link>
          </div>
          <div className="flex-1">
            <div className="divide-y divide-gray-100">
              {displayTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 p-2.5 rounded-full text-green-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{getEventName(tx.bookingId)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{tx.paymentDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-gray-900 text-base">
                      ₱{String(tx.paymentAmount).replace(/[^0-9.,]/g, '')}
                    </span>
                    <Badge variant={tx.status === "verified" ? "default" : "secondary"} className="text-[10px] capitalize mt-1">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}