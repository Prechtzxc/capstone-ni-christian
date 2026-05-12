"use client"

import Link from "next/link"
import { Calendar, FileText, CheckCircle2, Clock, MapPin, Wallet, ArrowRight, Banknote, Check, Plus } from "lucide-react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { usePaymentProof } from "@/components/payment-proof-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ClientDashboard() {
  const { user } = useAuth()
  const { bookings } = useBookings() 
  const { paymentProofs } = usePaymentProof()

  if (!user) return null

  const myBookings = (bookings || []).filter((b: any) => b.userId === user.id)
  const upcomingBookings = myBookings.filter((b: any) => b.status === "confirmed" || b.status === "pending" || b.status === "for_confirmation" || b.status === "verifying")
  const completedBookings = myBookings.filter((b: any) => b.status === "completed")

  const myBookingIds = myBookings.map((b: any) => b.id)
  const myTransactions = (paymentProofs || []).filter((p: any) => myBookingIds.includes(p.bookingId))
  const pendingPayments = myTransactions.filter((t: any) => t.status === "pending" || t.status === "resubmitted")

  const displayBookings = myBookings.length > 0 ? myBookings : [
    { id: "mock_1", eventName: "Christian's Debut", date: "2026-12-15", startTime: "18:00", status: "verifying", venue: "Grand Ballroom" },
    { id: "mock_2", eventName: "Corporate Seminar", date: "2026-08-20", startTime: "08:00", status: "confirmed", venue: "Conference Hall" }
  ] as any[]

  const displayTransactions = myTransactions.length > 0 ? myTransactions : [
    { id: "tx_1", bookingId: "mock_1", paymentAmount: "₱15,000", paymentDate: new Date("2026-05-04").toISOString(), status: "pending" }
  ] as any[]

  const getEventName = (bookingId: string) => {
    const booking = displayBookings.find(b => b.id === bookingId)
    return booking ? booking.eventName : "Event Payment"
  }

  // 4-STEP TRACKER LOGIC
  const getStatusStep = (status: string) => {
    if (status === "completed") return 4
    if (status === "confirmed") return 3
    if (status === "verifying") return 2
    return 1 // Placed (pending, for_confirmation, initial)
  }

  const nextEvent = displayBookings.find(b => b.status === "confirmed" || b.status === "for_confirmation" || b.status === "pending" || b.status === "verifying" || b.status === "completed") || displayBookings[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-24 bg-slate-50 min-h-screen">
      
      {/* MOBILE-FRIENDLY HEADER - ORANGE ACCENT */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center font-black text-xl shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
            <h1 className="text-lg md:text-2xl font-black text-slate-900 leading-tight truncate max-w-[200px] md:max-w-md">{user.name}</h1>
          </div>
        </div>
        <Button asChild size="icon" className="md:w-auto md:px-6 md:h-12 w-12 h-12 rounded-full md:rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md">
          <Link href="/portal/bookings">
            <Plus className="w-5 h-5 md:hidden" />
            <span className="hidden md:block font-bold">New Booking</span>
          </Link>
        </Button>
      </div>

      {/* MOBILE 2x2 STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{upcomingBookings.length}</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Upcoming</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{myBookings.length}</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Total</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{completedBookings.length}</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Completed</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{pendingPayments.length}</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Pending Bills</p>
        </div>
      </div>

      {/* MAIN EVENT CARD WITH 4-STEP TRACKER */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 px-1">Current Event Focus</h2>
        
        {nextEvent ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
            
            {/* Header part of card */}
            <div className="p-5 md:p-6 bg-white">
              <div className="flex justify-between items-start mb-3">
                <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                  {nextEvent.status.replace('_', ' ')}
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2.5">{nextEvent.eventName}</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-500" /> {nextEvent.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> {nextEvent.venue || "TBD"}</span>
              </div>
            </div>

            {/* Mobile Compact 4-Step Tracker */}
            <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-5">Status Tracker</p>
              
              <div className="relative max-w-md mx-auto w-full">
                
                {/* Background Line */}
                <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-200 rounded-full"></div>
                
                {/* Active Progress Line */}
                <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-transparent">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${(getStatusStep(nextEvent.status) - 1) * 33.33}%` }}
                  ></div>
                </div>

                {/* Tracker Steps */}
                <div className="relative flex justify-between">
                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 ${getStatusStep(nextEvent.status) >= 1 ? 'bg-orange-500 border-white text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {getStatusStep(nextEvent.status) > 1 ? <Check className="w-4 h-4" /> : <span className="text-xs md:text-sm font-bold">1</span>}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase text-center tracking-tighter ${getStatusStep(nextEvent.status) >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Placed</span>
                  </div>

                  {/* Step 2: Verification */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 ${getStatusStep(nextEvent.status) >= 2 ? 'bg-orange-500 border-white text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {getStatusStep(nextEvent.status) > 2 ? <Check className="w-4 h-4" /> : <span className="text-xs md:text-sm font-bold">2</span>}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase text-center tracking-tighter ${getStatusStep(nextEvent.status) >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Verification</span>
                  </div>

                  {/* Step 3: Approved */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 ${getStatusStep(nextEvent.status) >= 3 ? 'bg-emerald-500 border-white text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {getStatusStep(nextEvent.status) > 3 ? <Check className="w-4 h-4" /> : <span className="text-xs md:text-sm font-bold">3</span>}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase text-center tracking-tighter ${getStatusStep(nextEvent.status) >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Approved</span>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 ${getStatusStep(nextEvent.status) >= 4 ? 'bg-emerald-500 border-white text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {getStatusStep(nextEvent.status) >= 4 ? <Check className="w-4 h-4" /> : <span className="text-xs md:text-sm font-bold">4</span>}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase text-center tracking-tighter ${getStatusStep(nextEvent.status) >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>Completed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-8 text-center border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No active bookings.</p>
          </div>
        )}
      </div>

      {/* MOBILE LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bookings List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900">Other Bookings</h2>
            <Link href="/portal/bookings" className="text-xs font-bold text-orange-600 flex items-center hover:text-orange-700">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
          </div>
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {displayBookings.filter(b => b.id !== nextEvent?.id).slice(0, 3).map((booking) => (
              <div key={booking.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 truncate max-w-[130px] md:max-w-[200px]">{booking.eventName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{booking.date}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200 text-slate-600 shrink-0 bg-slate-50">
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
            {displayBookings.length <= 1 && (
              <div className="p-6 text-center text-xs text-slate-500">No other bookings.</div>
            )}
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900">Recent Payments</h2>
            <Link href="/portal/payments" className="text-xs font-bold text-orange-600 flex items-center hover:text-orange-700">Manage <ArrowRight className="w-3 h-3 ml-1" /></Link>
          </div>
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {displayTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 truncate max-w-[120px] md:max-w-[200px]">{getEventName(tx.bookingId)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(tx.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-slate-900">{typeof tx.paymentAmount === 'string' && tx.paymentAmount.includes('₱') ? tx.paymentAmount : `₱${tx.paymentAmount}`}</p>
                  <p className={`text-[9px] font-bold uppercase mt-0.5 ${tx.status === 'verified' ? 'text-emerald-600' : tx.status === 'rejected' ? 'text-rose-600' : 'text-orange-600'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
            {displayTransactions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">No payment records.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}