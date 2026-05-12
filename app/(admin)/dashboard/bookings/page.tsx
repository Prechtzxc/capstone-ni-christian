"use client"

import React, { useState, useEffect } from "react"
import { useBookings } from "@/components/booking-context"
// FIX: IDINAGDAG ANG PaymentProofProvider SA IMPORT!
import { PaymentProofProvider, usePaymentProof } from "@/src/modules/admin/contexts/payment-proof-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2,
  AlertCircle, History, XCircle, MapPin, Clock, Users, RefreshCw, MessageSquareWarning, Wrench, LayoutList
} from "lucide-react"

const venueMap: Record<string, string> = {
  "v1": "Conference Hall",
  "v2": "Garden Pavilion",
  "v3": "Grand Ballroom",
  "v4": "Rooftop Terrace",
  "o1": "Private Office A",
  "o2": "Private Office B" // UPDATED TO MATCH YOUR NEW SETUP
};

function AdminBookingsContent() {
  const { bookings, maintenanceDates, updateBookingStatus, rejectCancellation, toggleMaintenanceDate } = useBookings()
  const { paymentProofs } = usePaymentProof()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("pending") 
  const [selectedVenue, setSelectedVenue] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())

  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  
  const [calendarVenue, setCalendarVenue] = useState<string>("v1")
  const [selectedDayToManage, setSelectedDayToManage] = useState<string | null>(null)

  const allBookings = bookings || []

  const handleRefresh = () => {
    window.dispatchEvent(new Event("bookingsUpdated"));
    window.dispatchEvent(new Event("storage"));
    toast({ title: "Data Synced", description: "Successfully fetched the latest data." })
  }

  const checkVenueMatch = (b: any, selected: string) => {
    if (selected === "all") return true;
    const uiVenue = b.venue || b.venueName || "Conference Hall";
    return uiVenue.toLowerCase().includes(selected.toLowerCase());
  }

  // FIX: IDINAGDAG ANG [...allBookings].reverse() PARA LAGING NASA UNAHAN ANG LATEST BOOKING!
  const filteredBookings = [...allBookings].reverse().filter(b => {
    const status = b.status?.toLowerCase() || "pending"
    let matchStatus = false;
    
    if (activeTab === "all") matchStatus = true;
    else if (activeTab === "pending") matchStatus = !["approved", "confirmed", "completed", "declined", "cancelled"].includes(status);
    else if (activeTab === "approved") matchStatus = (status === "confirmed" || status === "approved");
    else matchStatus = status === activeTab;
      
    const matchVenue = checkVenueMatch(b, selectedVenue);
    const clientName = b.userInfo?.name || b.userName || b.contactName || "Unknown Client";
    const matchSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchVenue && matchSearch;
  })

  const pendingCount = allBookings.filter(b => !["approved", "confirmed", "completed", "declined", "cancelled"].includes(b.status?.toLowerCase() || "pending")).length
  const approvedCount = allBookings.filter(b => (b.status === "approved" || b.status === "confirmed")).length

  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (updateBookingStatus) {
      updateBookingStatus(id, newStatus as any)
      toast({ title: "Status Updated", description: `Booking has been successfully updated to ${newStatus.replace('_', ' ')}.` })
    }
  }

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const getDayBookings = (dStr: string) => allBookings.filter(b => b.date === dStr && (b.venueId === calendarVenue || (!b.venueId && calendarVenue === "v1")) && !["declined", "cancelled"].includes(b.status?.toLowerCase() || ""))

  const getPaymentStatusBadge = (bookingId: string, currentStatus: string) => {
    if (currentStatus === "pending" || currentStatus === "verifying") return null;

    const bTxns = paymentProofs.filter(p => p.bookingId === bookingId && p.status === "verified");
    if (bTxns.length === 0) return null;

    const hasFull = bTxns.some(t => t.paymentType === "full");
    const hasDown = bTxns.some(t => t.paymentType === "down");
    const hasBalance = bTxns.some(t => t.paymentType === "balance");

    if (hasFull || (hasDown && hasBalance)) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[9px] uppercase">Fully Paid</Badge>
    } else if (hasDown && !hasBalance) {
      return <Badge className="bg-amber-100 text-amber-700 border-none px-2 py-0.5 text-[9px] uppercase">Partially Paid</Badge>
    }
    return null;
  }
  
  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Management</h1>
          <p className="text-slate-500 font-medium">Review and manage client reservations and venue calendar.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" /> Sync Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-4 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform"><AlertCircle className="w-8 h-8 text-amber-500" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Action Needed</p><h3 className="text-3xl font-black text-slate-900">{pendingCount} <span className="text-sm font-medium text-slate-400">Pending</span></h3></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform"><CalendarIcon className="w-8 h-8 text-emerald-500" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming</p><h3 className="text-3xl font-black text-slate-900">{approvedCount} <span className="text-sm font-medium text-slate-400">Approved</span></h3></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={(val) => setViewMode(val as any)}>
        <div className="flex justify-start mb-4">
          <TabsList className="bg-white shadow-sm border border-slate-200 p-1 h-12 rounded-xl">
            <TabsTrigger value="list" className="rounded-lg px-6 font-bold flex items-center gap-2"><LayoutList className="w-4 h-4" /> List View</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg px-6 font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Calendar View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="m-0 border-none outline-none">
          <Card className="border-none shadow-sm bg-white min-h-[500px]">
            <div className="flex flex-col gap-5 border-b border-gray-100 p-6 pb-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-[200px]"><h3 className="text-xl font-bold text-slate-900 mb-1">Reservation History</h3><p className="text-sm text-slate-500">A complete list of your past and upcoming events.</p></div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-gray-200 font-medium text-slate-700">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /><SelectValue placeholder="All Venues" /></div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      <SelectItem value="Conference Hall">Conference Hall</SelectItem>
                      <SelectItem value="Garden Pavilion">Garden Pavilion</SelectItem>
                      <SelectItem value="Grand Ballroom">Grand Ballroom</SelectItem>
                      <SelectItem value="Rooftop Terrace">Rooftop Terrace</SelectItem>
                      <SelectItem value="Private Office A">Private Office A</SelectItem>
                      <SelectItem value="Private Office B">Private Office B</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-gray-200 w-full font-medium rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="flex w-full gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto min-w-0">
                {["All", "Pending", "Approved", "Completed", "Declined"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`flex-1 min-w-[80px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap text-center ${activeTab === tab.toLowerCase() ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-6">
              {filteredBookings.length === 0 ? (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <History className="w-10 h-10 text-slate-200 mb-4" />
                  <h3 className="text-slate-900 font-bold text-lg">No bookings found</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const currentStatus = booking.status?.toLowerCase() || "pending";
                    return (
                      <div key={booking.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white gap-4">
                        <div className="flex items-start space-x-4 min-w-0">
                          <div className={`p-3 rounded-full hidden sm:flex shrink-0 ${currentStatus === 'cancellation_requested' ? 'bg-rose-100' : 'bg-indigo-50'}`}>
                            {currentStatus === 'cancellation_requested' ? <MessageSquareWarning className="h-6 w-6 text-rose-600" /> : <Users className="h-6 w-6 text-indigo-600" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-lg truncate flex items-center gap-2">
                              {booking.userInfo?.name || booking.userName || booking.contactName || "Unknown Client"}
                              {getPaymentStatusBadge(booking.id, currentStatus)}
                            </h4>
                            <div className="text-xs text-slate-500 mb-2 font-medium truncate">{booking.userInfo?.email || booking.contactPhone || "No contact info"}</div>
                            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center font-bold text-blue-600"><MapPin className="w-4 h-4 mr-1 shrink-0" /> <span className="truncate">{booking.venue || booking.venueName || "Conference Hall"}</span></span>
                              <span className="flex items-center shrink-0"><CalendarIcon className="w-4 h-4 mr-1 text-slate-400 shrink-0" /> {booking.date}</span>
                              {booking.time && <span className="flex items-center shrink-0"><Clock className="w-4 h-4 mr-1 text-slate-400 shrink-0" /> {booking.time}</span>}
                            </div>
                          </div>
                        </div>

                        {currentStatus === 'cancellation_requested' ? (
                          <div className="flex flex-col gap-3 w-full lg:w-[350px] border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                             <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-xs font-medium w-full">
                                <span className="font-black uppercase tracking-widest text-[10px] text-rose-500 block mb-1">Reason for Cancelling:</span>
                                "{booking.cancellationReason}"
                             </div>
                             <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "cancelled")} className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm rounded-lg flex-1 h-9 font-bold"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Cancel</Button>
                                <Button size="sm" onClick={() => rejectCancellation(booking.id)} variant="outline" className="text-slate-500 hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-lg flex-1 h-9 font-bold"><XCircle className="w-4 h-4 mr-1.5" /> Reject Request</Button>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center justify-start lg:justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0 flex-wrap">
                            {currentStatus === 'pending' && <Badge className="bg-amber-100 text-amber-700 border-none shadow-none px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider">Awaiting Payment</Badge>}
                            {currentStatus === 'verifying' && <Badge className="bg-blue-100 text-blue-700 border-none shadow-none px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider">Payment Review</Badge>}
                            {(currentStatus === 'approved' || currentStatus === 'confirmed') && <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "completed")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-lg px-4 h-9 font-bold"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Completed</Button>}
                            {currentStatus === 'completed' && <Badge className="bg-slate-100 text-slate-400 font-bold border-none px-4 py-1.5 text-sm rounded-lg">COMPLETED</Badge>}
                            {currentStatus === 'declined' && <Badge className="bg-rose-50 text-rose-400 font-bold border-none px-4 py-1.5 text-sm rounded-lg">DECLINED</Badge>}
                            {currentStatus === 'cancelled' && <Badge className="bg-slate-800 text-white font-bold border-none px-4 py-1.5 text-sm rounded-lg">CANCELLED BY CLIENT</Badge>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="m-0 border-none outline-none">
          <Card className="border-none shadow-sm bg-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handlePrevMonth} className="h-12 w-12 rounded-full border-slate-200"><ChevronLeft className="w-5 h-5 text-slate-600" /></Button>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest min-w-[200px] text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <Button variant="outline" onClick={handleNextMonth} className="h-12 w-12 rounded-full border-slate-200"><ChevronRight className="w-5 h-5 text-slate-600" /></Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden lg:block">Venue:</span>
                <Select value={calendarVenue} onValueChange={setCalendarVenue}>
                  <SelectTrigger className="w-[250px] bg-slate-50 border-slate-200 font-bold text-slate-700 h-12 rounded-xl">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="v1">Conference Hall</SelectItem>
                    <SelectItem value="v2">Garden Pavilion</SelectItem>
                    <SelectItem value="v3">Grand Ballroom</SelectItem>
                    <SelectItem value="v4">Rooftop Terrace</SelectItem>
                    <SelectItem value="o1">Private Office A</SelectItem>
                    <SelectItem value="o2">Private Office B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center pb-2 border-b border-slate-100">{day.substring(0, 3)}</div>
              ))}
              
              {emptySlots.map((_, i) => <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/50 rounded-2xl" />)}
              
              {days.map((day) => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isMaintenance = maintenanceDates.includes(`${calendarVenue}|${dateStr}`)
                const dayEvents = getDayBookings(dateStr)

                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDayToManage(dateStr)}
                    className={`min-h-[120px] border border-slate-200 rounded-2xl p-3 transition-all cursor-pointer hover:shadow-md relative
                      ${isMaintenance ? 'bg-[repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9_10px,#ffffff_10px,#ffffff_20px)] border-slate-300 opacity-80' : 'bg-white hover:border-blue-400'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-bold ${isMaintenance ? 'text-slate-500' : 'text-slate-900'}`}>{day}</span>
                      {isMaintenance && <Wrench className="w-4 h-4 text-slate-400" />}
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-2">
                      {isMaintenance ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-center border border-slate-200">MAINTENANCE</span>
                      ) : (
                        dayEvents.slice(0, 3).map((b, i) => (
                          <div key={i} className="text-[9px] font-bold text-white bg-blue-500 px-2 py-1 rounded-md truncate shadow-sm">
                            {b.time?.split('-')[0]} - {b.eventName}
                          </div>
                        ))
                      )}
                      {dayEvents.length > 3 && !isMaintenance && <div className="text-[9px] font-bold text-slate-500 text-center">+ {dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedDayToManage} onOpenChange={(open) => !open && setSelectedDayToManage(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 z-[99999]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-500" /> Date Management
            </DialogTitle>
            <DialogDescription className="text-slate-600 font-medium pt-1">
              {venueMap[calendarVenue]} • {selectedDayToManage ? new Date(selectedDayToManage).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Bookings for this venue</h4>
              <div className="space-y-2">
                {selectedDayToManage && getDayBookings(selectedDayToManage).length === 0 ? (
                  <p className="text-sm font-medium text-slate-400">No events scheduled here.</p>
                ) : (
                  selectedDayToManage && getDayBookings(selectedDayToManage).map(b => (
                    <div key={b.id} className="flex justify-between items-center text-sm font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                      <span className="truncate max-w-[200px]">{b.eventName}</span>
                      <span className="text-blue-600 text-[11px]">{b.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Venue Maintenance</h4>
              <p className="text-sm text-slate-600 mb-4">You can block this specific venue on this date. Other venues will remain bookable.</p>
              
              <Button 
                onClick={() => {
                  if (selectedDayToManage) toggleMaintenanceDate(selectedDayToManage, calendarVenue);
                  setSelectedDayToManage(null);
                }} 
                className={`w-full h-12 font-bold rounded-xl shadow-sm transition-all ${
                  selectedDayToManage && maintenanceDates.includes(`${calendarVenue}|${selectedDayToManage}`) 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {selectedDayToManage && maintenanceDates.includes(`${calendarVenue}|${selectedDayToManage}`) ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Remove Maintenance Status</>
                ) : (
                  <><Wrench className="w-4 h-4 mr-2" /> Mark as Under Maintenance</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminBookingsPage() {
  return (
    <PaymentProofProvider>
      <AdminBookingsContent />
    </PaymentProofProvider>
  )
}