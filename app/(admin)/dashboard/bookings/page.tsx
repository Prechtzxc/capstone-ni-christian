"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { useBookings } from "@/components/booking-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { 
  CalendarDays, Clock, XCircle, Search, 
  Inbox, Users, FilterX, CheckSquare, Sparkles, AlertCircle, BarChart3, CheckCircle2, Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function BookingManagementPage() {
  const { bookings, updateBooking } = useBookings()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // CALENDAR LOGIC (RED = FULL, AMBER = PARTIAL)
  const { fullyBookedDates, partiallyBookedDates } = useMemo(() => {
    const fully: Date[] = []
    const partially: Date[] = []
    const activeBookings = (bookings || []).filter((b: any) => b.status !== "declined")
    const bookingsByDate: Record<string, any[]> = {}
    
    activeBookings.forEach((b: any) => {
      if (!bookingsByDate[b.date]) bookingsByDate[b.date] = []
      bookingsByDate[b.date].push(b)
    })

    Object.keys(bookingsByDate).forEach(dateStr => {
      const dayBookings = bookingsByDate[dateStr]
      let totalHoursBooked = 0
      dayBookings.forEach((b: any) => {
        if (b.startTime && b.endTime) {
          const [sH, sM] = b.startTime.split(':').map(Number)
          const [eH, eM] = b.endTime.split(':').map(Number)
          totalHoursBooked += (eH + eM / 60) - (sH + sM / 60)
        } else { totalHoursBooked += 4 }
      });
      const parsedDate = new Date(dateStr)
      if (14 - totalHoursBooked < 6) fully.push(parsedDate)
      else partially.push(parsedDate)
    })
    return { fullyBookedDates: fully, partiallyBookedDates: partially }
  }, [bookings])

  // FILTERING
  const filteredBookings = (bookings || []).filter((booking: any) => {
    const matchesTab = booking.status === activeTab
    const matchesSearch = booking.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.eventName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDate = selectedDate ? booking.date === format(selectedDate, "MMMM d, yyyy") : true
    const matchesEvent = eventTypeFilter === "all" || booking.eventName?.toLowerCase().includes(eventTypeFilter.toLowerCase())
    return matchesTab && matchesSearch && matchesDate && matchesEvent
  })

  const pendingCount = (bookings || []).filter((b: any) => b.status === "pending").length
  const approvedCount = (bookings || []).filter((b: any) => b.status === "approved").length
  const completedCount = (bookings || []).filter((b: any) => b.status === "completed").length

  // ACTION HANDLER
  const handleUpdateStatus = (id: string, newStatus: string, actionName: string) => {
    if (updateBooking) {
      updateBooking(id, { status: newStatus })
      toast({
        title: `Booking ${actionName}`,
        description: `Marked as ${newStatus}.`,
        variant: newStatus === "declined" ? "destructive" : "default",
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full overflow-hidden pb-10">
      
      {/* TOP: STATS + MINI CALENDAR */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 w-full items-start">
        
        <div className="flex flex-col gap-6 w-full">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking Management</h1>
            <p className="text-sm text-slate-500 mt-1">Review and manage client reservations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg w-fit"><AlertCircle className="w-4 h-4 text-amber-600" /></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Action Needed</p><h4 className="text-2xl font-black text-slate-900">{pendingCount} <span className="text-xs font-medium text-slate-400">Pending</span></h4></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg w-fit"><CalendarDays className="w-4 h-4 text-emerald-600" /></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Upcoming</p><h4 className="text-2xl font-black text-slate-900">{approvedCount} <span className="text-xs font-medium text-slate-400">Approved</span></h4></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg w-fit"><Sparkles className="w-4 h-4 text-blue-600" /></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Success</p><h4 className="text-2xl font-black text-slate-900">{completedCount} <span className="text-xs font-medium text-slate-400">Done</span></h4></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ULTRA COMPACT CALENDAR */}
        <div className="w-full shrink-0">
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-2.5 px-3">
              <CardTitle className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5"><BarChart3 className="w-3 h-3 text-indigo-600" /> Availability</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ fullyBooked: fullyBookedDates, partiallyBooked: partiallyBookedDates }}
                modifiersClassNames={{
                  fullyBooked: "bg-red-500 text-white font-bold rounded-md",
                  partiallyBooked: "bg-amber-400 text-white font-bold rounded-md"
                }}
                classNames={{
                  months: "w-full",
                  month: "space-y-1 w-full",
                  caption: "flex justify-center py-1 relative items-center mb-1",
                  caption_label: "text-[12px] font-bold text-slate-900",
                  nav: "flex items-center",
                  nav_button: "h-5 w-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded flex items-center justify-center absolute top-1",
                  nav_button_previous: "left-0",
                  nav_button_next: "right-0",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell: "text-slate-400 w-6 font-bold text-[8px] uppercase text-center",
                  row: "flex w-full mt-1 justify-between",
                  cell: "h-6 w-6 text-center text-[10px] p-0 relative",
                  day: "h-6 w-6 p-0 font-medium text-slate-700 hover:bg-indigo-50 rounded flex items-center justify-center mx-auto",
                  day_selected: "bg-indigo-600 text-white font-bold",
                  day_today: "bg-slate-100 text-slate-900",
                  day_outside: "text-slate-300 opacity-50",
                }}
              />
              <div className="flex flex-col w-full gap-1 mt-3 pt-2 border-t border-slate-100 text-[9px] font-bold uppercase text-slate-500 tracking-tighter">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>Full</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div><span>Partial</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ACTION AREA */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col w-full overflow-hidden">
        <div className="border-b border-slate-100 bg-white p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full xl:w-auto">
            <TabsList className="bg-slate-100/80 p-1 h-9 rounded-xl flex min-w-max">
              <TabsTrigger value="pending" className="rounded-lg text-[11px] font-bold px-3 data-[state=active]:bg-white data-[state=active]:text-amber-700 shadow-none">Pending {pendingCount > 0 && <span className="ml-1 bg-amber-500 text-white px-1.5 rounded-full">{pendingCount}</span>}</TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg text-[11px] font-bold px-3 data-[state=active]:bg-white data-[state=active]:text-emerald-700">Approved {approvedCount > 0 && <span className="ml-1 bg-emerald-500 text-white px-1.5 rounded-full">{approvedCount}</span>}</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg text-[11px] font-bold px-3 data-[state=active]:bg-white data-[state=active]:text-blue-700">Completed</TabsTrigger>
              <TabsTrigger value="declined" className="rounded-lg text-[11px] font-bold px-3 data-[state=active]:bg-white data-[state=active]:text-red-700">Declined</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative w-[140px]"><Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" /><select className="pl-7 pr-2 h-9 bg-slate-50 border-slate-200 rounded-xl text-[11px] font-bold w-full outline-none" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}><option value="all">All Events</option><option value="wedding">Wedding</option><option value="birthday">Birthday</option></select></div>
            <div className="relative w-[200px]"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><Input placeholder="Search..." className="pl-8 h-9 bg-slate-50 border-slate-200 rounded-xl text-[11px] w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
        </div>
        
        {selectedDate && <div className="px-5 py-2 bg-indigo-50 border-b border-indigo-100 text-[10px] font-bold text-indigo-700 flex items-center gap-2"><CalendarDays className="w-3 h-3" /> Selected: {format(selectedDate, "MMMM d, yyyy")} <Button variant="ghost" className="h-4 p-0 text-[10px] text-red-500 hover:bg-transparent" onClick={() => setSelectedDate(undefined)}>Clear</Button></div>}

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow><TableHead className="px-6 text-[9px] font-bold text-slate-400 uppercase">Client</TableHead><TableHead className="px-6 text-[9px] font-bold text-slate-400 uppercase">Event</TableHead><TableHead className="px-6 text-[9px] font-bold text-slate-400 uppercase">Schedule</TableHead><TableHead className="px-6 text-[9px] font-bold text-slate-400 uppercase text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 text-xs">No records found</TableCell></TableRow> : filteredBookings.map((booking: any) => (
              <TableRow key={booking.id} className="hover:bg-slate-50/50 border-b border-slate-50">
                <TableCell className="px-6 py-3"><div className="flex flex-col"><span className="text-[12px] font-bold text-slate-900">{booking.contactName}</span><span className="text-[10px] text-slate-500">{booking.contactPhone}</span></div></TableCell>
                <TableCell className="px-6 py-3"><div className="flex flex-col"><span className="text-[12px] font-bold text-slate-800">{booking.eventName}</span><span className="text-[10px] text-slate-400">{booking.guests} Guests</span></div></TableCell>
                <TableCell className="px-6 py-3"><div className="flex flex-col"><span className="text-[11px] font-bold text-indigo-600">{booking.date}</span><span className="text-[10px] text-slate-500">{booking.time}</span></div></TableCell>
                <TableCell className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {activeTab === "pending" && <><Button size="sm" className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(booking.id, "approved", "Confirmed")}><CheckCircle2 className="w-3 h-3 mr-1" /> Confirm</Button><Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(booking.id, "declined", "Declined")}><XCircle className="w-3 h-3 mr-1" /> Decline</Button></>}
                    {activeTab === "approved" && <Button size="sm" className="h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(booking.id, "completed", "Completed")}><CheckSquare className="w-3 h-3 mr-1" /> Complete</Button>}
                    {(activeTab === "declined" || activeTab === "completed") && <span className="text-[10px] font-bold text-slate-300 uppercase">Settled</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}