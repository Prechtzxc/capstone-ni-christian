"use client"

import React, { useState } from "react"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  History,
  XCircle,
  MapPin
} from "lucide-react"

export default function AdminBookingsPage() {
  const { bookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("approved") // Pinalitan ko ng approved as default since nandyan bookings mo
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedVenue, setSelectedVenue] = useState<string>("all")

  // TOTOONG DATA GALING SA CONTEXT
  const allBookings = bookings || []

  // SUPER SAFE VENUE MATCHER (Na-fix na yung fallback bug!)
  const checkVenueMatch = (b: any, selected: string) => {
    if (selected === "all") return true;
    
    // DITO ANG FIX: Dapat alam din ng filter yung fallback text na nakikita mo sa UI
    const uiVenue = b.venue || b.venueName || "Conference Hall";
    const uiEvent = b.eventName || "Venue Booking";
    
    const combinedString = `${uiVenue} ${uiEvent}`.toLowerCase();
    return combinedString.includes(selected.toLowerCase());
  }

  // FILTER LOGIC PARA SA LIST AT CALENDAR
  const filteredBookings = allBookings.filter(b => {
    const status = b.status?.toLowerCase() || "pending"
    const matchStatus = activeTab === "approved" 
      ? (status === "confirmed" || status === "approved") 
      : status === activeTab;
      
    const matchVenue = checkVenueMatch(b, selectedVenue);

    return matchStatus && matchVenue;
  })

  // STATUS COUNTERS (Filtered by venue)
  const pendingCount = allBookings.filter(b => (b.status === "pending" || !b.status) && checkVenueMatch(b, selectedVenue)).length
  const approvedCount = allBookings.filter(b => (b.status === "approved" || b.status === "confirmed") && checkVenueMatch(b, selectedVenue)).length
  const completedCount = allBookings.filter(b => b.status === "completed" && checkVenueMatch(b, selectedVenue)).length

  // STATUS UPDATE HANDLER
  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (updateBookingStatus) {
      updateBookingStatus(id, newStatus)
      toast({ 
        title: "Status Updated", 
        description: `Booking has been marked as ${newStatus}.` 
      })
    }
  }

  // CALENDAR NAVIGATION LOGIC
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  // 6-HOUR GAP CALCULATION PARA SA ADMIN CALENDAR
  const getDayStatus = (day: number) => {
    if (selectedVenue === "all") return "none";

    const dayBookings = allBookings.filter(b => {
      if (!b.date) return false;
      
      try {
        const bookingDate = new Date(b.date);
        const isSameDate = 
          bookingDate.getFullYear() === year && 
          bookingDate.getMonth() === month && 
          bookingDate.getDate() === day;
        
        const isValidStatus = ["pending", "approved", "confirmed", "completed"].includes(b.status?.toLowerCase() || "pending");
        const matchVenue = checkVenueMatch(b, selectedVenue);

        return isSameDate && isValidStatus && matchVenue;
      } catch (e) {
        return false;
      }
    });

    if (dayBookings.length === 0) return "none";

    const opStart = 8;  
    const opEnd = 22;   
    const minHoursRequired = 6; 

    const parseTimeStr = (timeStr: string) => {
      try {
        const cleanStr = timeStr.trim().toUpperCase();
        const isPM = cleanStr.includes('PM');
        const isAM = cleanStr.includes('AM');
        const timeMatch = cleanStr.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return 0;
        
        let hours = parseInt(timeMatch[1], 10);
        let minutes = parseInt(timeMatch[2], 10);
        
        if (isPM && hours !== 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        return hours + (minutes / 60);
      } catch(e) {
        return 0;
      }
    };

    const intervals = dayBookings.map(b => {
      if (!b.time) return { start: 0, end: 0 };
      const parts = b.time.includes('-') ? b.time.split('-') : b.time.split(/to/i);
      if (parts.length < 2) return { start: 0, end: 0 };
      return {
        start: parseTimeStr(parts[0]),
        end: parseTimeStr(parts[1])
      };
    }).filter(i => i.start !== i.end).sort((a, b) => a.start - b.start);

    let maxGap = 0;
    let currentTime = opStart;

    for (const interval of intervals) {
      if (interval.start > currentTime) {
        const gap = interval.start - currentTime;
        if (gap > maxGap) maxGap = gap;
      }
      if (interval.end > currentTime) {
        currentTime = interval.end;
      }
    }

    if (opEnd > currentTime) {
      const gap = opEnd - currentTime;
      if (gap > maxGap) maxGap = gap;
    }

    if (maxGap < minHoursRequired) return "full";
    return "partial";
  }

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Management</h1>
        <p className="text-slate-500 font-medium">Review and manage client reservations.</p>
      </div>

      {/* STATS CARDS - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Needed</p>
              <h3 className="text-3xl font-black text-slate-900">{pendingCount} <span className="text-sm font-medium text-slate-400">Pending</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upcoming</p>
              <h3 className="text-3xl font-black text-slate-900">{approvedCount} <span className="text-sm font-medium text-slate-400">Approved</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success</p>
              <h3 className="text-3xl font-black text-slate-900">{completedCount} <span className="text-sm font-medium text-slate-400">Done</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT GRID - 2 Columns (75/25) Naka w-full */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
        
        {/* LEFT: BOOKING LIST (75% width) */}
        <div className="xl:col-span-3 w-full">
          <Card className="border-none shadow-sm bg-white min-h-[500px]">
            <CardHeader className="border-b border-slate-50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4">
              
              {/* TABS */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0 w-full xl:w-auto">
                {["Pending", "Approved", "Completed", "Declined"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.toLowerCase() 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* SEARCH & FILTER */}
              <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger className="w-[140px] xl:w-[160px] h-9 bg-slate-50 border-none font-semibold text-slate-700 text-xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <SelectValue placeholder="All Venues" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    <SelectItem value="Conference Hall">Conference Hall</SelectItem>
                    <SelectItem value="Garden Pavilion">Garden Pavilion</SelectItem>
                    <SelectItem value="Grand Ballroom">Grand Ballroom</SelectItem>
                    <SelectItem value="Rooftop Terrace">Rooftop Terrace</SelectItem>
                    <SelectItem value="The Milestone Event Place">The Milestone Event Place</SelectItem>
                    <SelectItem value="Private Office">Private Office A</SelectItem>
                    <SelectItem value="Co-working Space">Co-working Space</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative w-full xl:w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input placeholder="Search client..." className="pl-8 h-9 bg-slate-50 border-none w-full text-xs font-medium rounded-lg" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full">
                  <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left whitespace-nowrap">Client</th>
                      <th className="px-6 py-4 text-left whitespace-nowrap">Event & Venue</th>
                      <th className="px-6 py-4 text-left whitespace-nowrap">Schedule</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900 whitespace-nowrap">{booking.contactName || "Unknown Client"}</div>
                            <div className="text-xs text-slate-400 font-medium">{booking.contactPhone || booking.id.slice(0,8)}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900">{booking.eventName || "Venue Booking"}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                              {/* Dito kinukuha din yung fallback text */}
                              <span className="text-blue-600 font-bold">{booking.venue || booking.venueName || "Conference Hall"}</span> • {booking.guests || 0} Guests
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm whitespace-nowrap">
                              <CalendarIcon className="w-4 h-4" /> {booking.date}
                            </div>
                            <div className="text-xs text-slate-400 font-medium mt-1 whitespace-nowrap">{booking.time}</div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            
                            <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                              {activeTab === 'pending' && (
                                <>
                                  <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "confirmed")} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-lg px-3">
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                                  </Button>
                                  <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "declined")} variant="outline" className="text-rose-500 hover:bg-rose-50 border-rose-200 hover:border-rose-300 rounded-lg px-3">
                                    <XCircle className="w-4 h-4 mr-1.5" /> Decline
                                  </Button>
                                </>
                              )}

                              {activeTab === 'approved' && (
                                <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "completed")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-lg px-3">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Completed
                                </Button>
                              )}

                              {activeTab === 'completed' && (
                                <Badge className="bg-slate-100 text-slate-400 font-bold border-none shadow-none px-3 py-1">COMPLETED</Badge>
                              )}

                              {activeTab === 'declined' && (
                                <Badge className="bg-rose-50 text-rose-400 font-bold border-none shadow-none px-3 py-1">DECLINED</Badge>
                              )}
                            </div>

                          </td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
              
              {/* EMPTY STATE */}
              {filteredBookings.length === 0 && (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <History className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">No bookings found</h3>
                  <p className="text-slate-400 text-sm mt-1">There are no {activeTab} reservations for {selectedVenue === "all" ? "any venue" : selectedVenue}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: AVAILABILITY & CALENDAR */}
        <div className="xl:col-span-1 w-full">
          <Card className="border-none shadow-sm bg-white overflow-hidden sticky top-4">
            <CardHeader className="bg-slate-900 text-white p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4 text-amber-400" /> Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              {selectedVenue === "all" ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Please select a specific venue from the list above to view its accurate availability.</p>
                </div>
              ) : (
                <>
                  {/* CALENDAR NAVIGATION */}
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-full hover:bg-slate-100">
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </Button>
                    <h3 className="font-black text-slate-800 text-sm">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-full hover:bg-slate-100">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>

                  {/* TOTOONG CALENDAR GRID */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-6">
                    {/* Headers */}
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                      <div key={day} className="text-[10px] font-bold text-slate-400 uppercase pb-2">{day}</div>
                    ))}
                    
                    {/* Empty spaces para sa simula ng buwan */}
                    {emptySlots.map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Actual Days */}
                    {days.map((day) => {
                      const status = getDayStatus(day);
                      return (
                        <div 
                          key={day} 
                          className={`aspect-square flex flex-col items-center justify-center text-xs font-bold rounded-lg transition-all relative
                            ${status === "full" ? "bg-rose-50 text-rose-600 border border-rose-100" : ""}
                            ${status === "partial" ? "bg-amber-50 text-amber-600 border border-amber-100" : ""}
                            ${status === "none" ? "text-slate-600 hover:bg-slate-50" : ""}
                          `}
                        >
                          {day}
                          {status === "full" && <div className="w-1 h-1 bg-rose-500 rounded-full mt-0.5"></div>}
                          {status === "partial" && <div className="w-1 h-1 bg-amber-400 rounded-full mt-0.5"></div>}
                        </div>
                      )
                    })}
                  </div>

                  {/* LEGEND */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fully Booked (<span className="text-red-500">&lt;6hrs left</span>)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partially Booked</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}