"use client"

import React, { useState } from "react"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Phone, User, AlignLeft, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminBookingsPage() {
  const { bookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")

  const allBookings = bookings || []

  // Stats
  const totalBookings = allBookings.length
  const pendingCount = allBookings.filter(b => b.status === "pending").length
  const confirmedCount = allBookings.filter(b => b.status === "confirmed").length
  const completedCount = allBookings.filter(b => b.status === "completed").length

  const filteredBookings = allBookings.filter(b => {
    if (activeTab === "all") return true
    return b.status === activeTab
  })

  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (updateBookingStatus) {
      updateBookingStatus(id, newStatus)
      toast({ title: "Status Updated", description: `Marked as ${newStatus}.` })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-amber-100 text-amber-800 border-none shadow-none">Pending</Badge>
      case "confirmed": return <Badge className="bg-green-100 text-green-800 border-none shadow-none">Confirmed</Badge>
      case "completed": return <Badge className="bg-blue-100 text-blue-800 border-none shadow-none">Completed</Badge>
      case "declined": return <Badge className="bg-red-100 text-red-800 border-none shadow-none">Declined</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800 border-none shadow-none">{status}</Badge>
    }
  }

  return (
    // NAGDAGDAG AKO NG PADDING AT MAX-WIDTH PARA HINDI MATAKPAN NG SIDEBAR
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground">Review and manage all client reservation requests.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-400 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-gray-900">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* BOOKING LIST & TABS */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">All Booking Requests</h2>
          <p className="text-sm text-muted-foreground">Manage and update booking statuses in real-time.</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-fit bg-muted/50 p-1 h-auto mb-6">
              <TabsTrigger value="all" className="py-2">All</TabsTrigger>
              <TabsTrigger value="pending" className="py-2">Pending</TabsTrigger>
              <TabsTrigger value="confirmed" className="py-2">Confirmed</TabsTrigger>
              <TabsTrigger value="completed" className="py-2">Completed</TabsTrigger>
              <TabsTrigger value="declined" className="py-2">Declined</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="p-6 pt-0 space-y-6 outline-none">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No bookings found</h3>
                <p className="text-muted-foreground">There are no {activeTab !== "all" ? activeTab : ""} requests.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-2xl p-6 bg-white shadow-sm hover:ring-1 hover:ring-primary/20 transition-all">
                  
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{booking.eventName || "Event"}</h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex flex-wrap gap-6 mb-8 p-4 bg-muted/30 rounded-xl border text-sm font-medium">
                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> {booking.date}</div>
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" /> {booking.time}</div>
                    <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-600" /> {booking.guests} guests</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 border-b pb-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Customer</p>
                      <p className="flex items-center gap-2 font-semibold text-gray-900"><User className="w-4 h-4 text-muted-foreground" /> {booking.contactName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact</p>
                      <p className="flex items-center gap-2 font-semibold text-gray-900"><Phone className="w-4 h-4 text-muted-foreground" /> {booking.contactPhone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Special Notes</p>
                      <p className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"><AlignLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> {booking.notes || "No special requests"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {booking.status === "pending" && (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(booking.id, "confirmed")}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking
                        </Button>
                        <Button variant="destructive" onClick={() => handleUpdateStatus(booking.id, "declined")}>
                          <XCircle className="w-4 h-4 mr-2" /> Decline
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(booking.id, "completed")}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}