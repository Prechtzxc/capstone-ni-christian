"use client"

import React, { useState } from "react"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
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
  MapPin,
  Clock,
  Users
} from "lucide-react"

export default function AdminBookingsPage() {
  const { bookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  
  // TABS & FILTERS (Tinanggal na yung "All")
  const [activeTab, setActiveTab] = useState("pending") 
  const [selectedVenue, setSelectedVenue] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [currentDate, setCurrentDate] = useState(new Date())

  const allBookings = bookings || []

  // VENUE MATCHER
  const checkVenueMatch = (b: any, selected: string) => {
    if (selected === "all") return true;
    const uiVenue = b.venue || b.venueName || "Conference Hall";
    const uiEvent = b.eventName || "Event Booking";
    const combinedString = `${uiVenue} ${uiEvent}`.toLowerCase();
    return combinedString.includes(selected.toLowerCase());
  }

  // FILTER LOGIC
  const filteredBookings = allBookings.filter(b => {
    const status = b.status?.toLowerCase() || "pending"
    let matchStatus = false;
    
    if (activeTab === "approved") {
      matchStatus = (status === "confirmed" || status === "approved");
    } else {
      matchStatus = status === activeTab;
    }
      
    const matchVenue = checkVenueMatch(b, selectedVenue);
    const clientName = b.contactName || "Unknown Client";
    const matchSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchVenue && matchSearch;
  })

  // STATUS COUNTERS
  const pendingCount = allBookings.filter(b => (b.status === "pending" || !b.status) && checkVenueMatch(b, selectedVenue)).length
  const approvedCount = allBookings.filter(b => (b.status === "approved" || b.status === "confirmed") && checkVenueMatch(b, selectedVenue)).length
  const completedCount = allBookings.filter(b => b.status === "completed" && checkVenueMatch(b, selectedVenue)).length

  // UPDATE HANDLER
  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (updateBookingStatus) {
      updateBookingStatus(id, newStatus)
      toast({ 
        title: "Status Updated", 
        description: `Booking has been marked as ${newStatus}.` 
      })
    }
  }

  // CALENDAR LOGIC
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const getDayStatus = (day: number) => {
    if (selectedVenue === "all") return "none";

    const dayBookings = allBookings.filter(b => {
      if (!b.date) return false;
      try {
        const bookingDate = new Date(b.date);
        const isSameDate = bookingDate.getFullYear() === year && bookingDate.getMonth() === month && bookingDate.getDate() === day;
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
      return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
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
    <div className="w-full p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Management</h1>
        <p className="text-slate-500 font-medium">Review and manage client reservations.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-4 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Action Needed</p>
              <h3 className="text-3xl font-black text-slate-900">{pendingCount} <span className="text-sm font-medium text-slate-400">Pending</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming</p>
              <h3 className="text-3xl font-black text-slate-900">{approvedCount} <span className="text-sm font-medium text-slate-400">Approved</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-4 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Success</p>
              <h3 className="text-3xl font-black text-slate-900">{completedCount} <span className="text-sm font-medium text-slate-400">Done</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
        
        {/* LEFT: BOOKING LIST */}
        <div className="xl:col-span-3 w-full min-w-0">
          <Card className="border-none shadow-sm bg-white min-h-[500px]">
            
            <div className="flex flex-col gap-5 border-b border-gray-100 p-6 pb-5">
              
              {/* FIXED TOP ROW: Naka lg:flex-row para pumunta sa kanan yung dropdown sa laptop screen */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
                
                {/* TITLE AREA */}
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Reservation History</h3>
                  <p className="text-sm text-slate-500">A complete list of your past and upcoming events.</p>
                </div>

                {/* DROPDOWN & SEARCH AREA - Dinikit sa kanan gamit ang justify-between nung parent div */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-gray-200 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-500 font-normal">Venue:</span>
                        <SelectValue placeholder="All" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      <SelectItem value="Conference Hall">Conference Hall</SelectItem>
                      <SelectItem value="Garden Pavilion">Garden Pavilion</SelectItem>
                      <SelectItem value="Grand Ballroom">Grand Ballroom</SelectItem>
                      <SelectItem value="Rooftop Terrace">Rooftop Terrace</SelectItem>
                      <SelectItem value="The Milestone Event Place">The Milestone Event Place</SelectItem>
                      <SelectItem value="Private Office A">Private Office A</SelectItem>
                      <SelectItem value="Co-working Space">Co-working Space</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative w-full sm:w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search client..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-slate-50 border-gray-200 w-full font-medium rounded-lg" 
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: TABS */}
              <div className="flex w-full gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto min-w-0">
                {["Pending", "Approved", "Completed", "Declined"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`flex-1 min-w-[80px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap text-center ${
                      activeTab === tab.toLowerCase() 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>

            {/* CARD LIST */}
            <CardContent className="p-6">
              {filteredBookings.length === 0 ? (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <History className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">No bookings found</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {searchQuery 
                      ? `No results found for "${searchQuery}".` 
                      : `There are no ${activeTab} reservations for ${selectedVenue === "all" ? "any venue" : selectedVenue}.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const currentStatus = booking.status?.toLowerCase() || "pending";
                    return (
                      <div key={booking.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white gap-4">
                        
                        <div className="flex items-start space-x-4 min-w-0">
                          <div className="p-3 rounded-full hidden sm:flex bg-indigo-50 shrink-0">
                            <Users className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-lg truncate">
                              {booking.contactName || "Unknown Client"}
                            </h4>
                            <div className="text-xs text-slate-500 mb-2 font-medium truncate">{booking.contactPhone || "No contact info"}</div>
                            
                            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center font-bold text-blue-600">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" /> 
                                <span className="truncate">{booking.venue || booking.venueName || "Conference Hall"}</span>
                              </span>
                              <span className="flex items-center shrink-0">
                                <CalendarIcon className="w-4 h-4 mr-1 text-slate-400 shrink-0" /> {booking.date}
                              </span>
                              {booking.time && (
                                <span className="flex items-center shrink-0">
                                  <Clock className="w-4 h-4 mr-1 text-slate-400 shrink-0" /> {booking.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-row items-center justify-start lg:justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                          {currentStatus === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "confirmed")} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-lg px-4 h-9 font-bold">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                              </Button>
                              <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "declined")} variant="outline" className="text-rose-500 hover:bg-rose-50 border-rose-200 hover:border-rose-300 rounded-lg px-4 h-9 font-bold">
                                <XCircle className="w-4 h-4 mr-1.5" /> Decline
                              </Button>
                            </>
                          )}

                          {(currentStatus === 'approved' || currentStatus === 'confirmed') && (
                            <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "completed")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-lg px-4 h-9 font-bold">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Completed
                            </Button>
                          )}

                          {currentStatus === 'completed' && (
                            <Badge className="bg-slate-100 text-slate-400 font-bold border-none shadow-none px-4 py-1.5 text-sm rounded-lg">COMPLETED</Badge>
                          )}

                          {currentStatus === 'declined' && (
                            <Badge className="bg-rose-50 text-rose-400 font-bold border-none shadow-none px-4 py-1.5 text-sm rounded-lg">DECLINED</Badge>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: AVAILABILITY CALENDAR */}
        <div className="xl:col-span-1 w-full min-w-0">
          <Card className="border-none shadow-sm bg-white overflow-hidden sticky top-4 !p-0">
            <div className="bg-slate-900 text-white p-5 w-full m-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider m-0">
                <CalendarIcon className="w-4 h-4 text-amber-400" /> Availability Check
              </h3>
            </div>
            
            <CardContent className="p-6">
              {selectedVenue === "all" ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Please select a specific venue from the dropdown to view accurate availability.</p>
                </div>
              ) : (
                <>
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

                  <div className="grid grid-cols-7 gap-1 text-center mb-6">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                      <div key={day} className="text-[10px] font-bold text-slate-400 uppercase pb-2">{day}</div>
                    ))}
                    
                    {emptySlots.map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

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