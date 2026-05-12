"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronLeft, ChevronRight, ArrowRight, Loader2, Calendar as CalendarIcon, PartyPopper, CheckCircle2, AlertCircle, Building2 } from "lucide-react"

import { useBookings } from "@/components/booking-context"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useToast } from "@/hooks/use-toast"

const venueMap: Record<string, string> = {
  "v1": "Conference Hall",
  "v2": "Garden Pavilion",
  "v3": "Grand Ballroom",
  "v4": "Rooftop Terrace",
  "o1": "Private Office A",
  "o2": "Private Office B" 
};

const MAINTENANCE_STORAGE_KEY = "oneestela_global_maintenance_v2"

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVenueId?: string
  onBackToVenues?: () => void
  editingBooking?: any | null 
  onSubmitSuccess?: (bookingData: any) => void 
}

export function ReserveDialog({ open, onOpenChange, selectedVenueId = "v1", onBackToVenues, editingBooking, onSubmitSuccess }: ReserveDialogProps) {
  const { bookings, maintenanceDates, addBooking } = useBookings()
  const { user } = useAuth()
  const { toast } = useToast()
  const allBookings = bookings || []

  const [step, setStep] = useState(1)
  
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
    return d
  })

  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  
  const [eventName, setEventName] = useState("")
  const [eventType, setEventType] = useState("") 
  const [guests, setGuests] = useState("")
  const [notes, setNotes] = useState("")
  const [agreed, setAgreed] = useState(false) 
  
  const [selectedRoom, setSelectedRoom] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)
  const [localMaint, setLocalMaint] = useState<string[]>([])

  // BULLETPROOF CHECKER: Kahit id ("o1") o exact name ("Private Office A") pa ang ipasa
  const isOffice = selectedVenueId === "o1" || 
                   selectedVenueId === "o2" || 
                   selectedVenueId === "Private Office A" || 
                   selectedVenueId === "Private Office B" ||
                   selectedVenueId === "Co-working Space";

  const OP_START = 8 
  const OP_END = 22 
  const FIXED_DURATION = 6 
  const REQUIRED_GAP = 1 

  const minBookableDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setHours(0,0,0,0)
    return d
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getMaint = () => JSON.parse(localStorage.getItem(MAINTENANCE_STORAGE_KEY) || "[]")
      setLocalMaint(getMaint())

      const handleStorage = () => setLocalMaint(getMaint())
      window.addEventListener("storage", handleStorage)
      window.addEventListener("bookingsUpdated", handleStorage)
      return () => {
        window.removeEventListener("storage", handleStorage)
        window.removeEventListener("bookingsUpdated", handleStorage)
      }
    }
  }, [])

  useEffect(() => {
    if (open) {
      if (editingBooking) {
        setStep(1) 
        try {
          const d = new Date(editingBooking.date)
          setDate(d.toISOString().split('T')[0])
          setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1))
        } catch { setDate("") }
        
        if (editingBooking.time && !isOffice) {
          const parts = editingBooking.time.includes('-') ? editingBooking.time.split('-') : editingBooking.time.split(/to/i)
          setStartTime(parseTimeStr(parts[0]).toString())
          setEndTime(parseTimeStr(parts[1]).toString())
        }
        
        if (isOffice && editingBooking.eventName?.includes("Room")) {
          const matchedRoom = editingBooking.eventName.match(/Room \d+/);
          if (matchedRoom) setSelectedRoom(matchedRoom[0]);
        } else {
          setEventName(editingBooking.eventName || "")
          setEventType(editingBooking.eventType || "")
          setGuests(editingBooking.guests?.toString() || editingBooking.guestCount?.toString() || "150") 
        }

        setNotes(editingBooking.specialRequests || editingBooking.notes || "")
        setAgreed(false)
      } else {
        setStep(1)
        setDate("")
        setStartTime("")
        setEndTime("")
        setEventName("")
        setEventType("")
        setGuests("")
        setNotes("")
        setSelectedRoom("")
        setAgreed(false)
        const d = new Date()
        d.setMonth(d.getMonth() + 1)
        d.setDate(1)
        setCalendarMonth(d)
      }
    }
  }, [open, editingBooking, isOffice])

  const parseTimeStr = (timeStr: string) => {
    if (!timeStr) return 0;
    try {
      const cleanStr = timeStr.trim().toUpperCase()
      const isPM = cleanStr.includes('PM')
      const isAM = cleanStr.includes('AM')
      const timeMatch = cleanStr.match(/(\d{1,2}):(\d{2})/)
      if (!timeMatch) return 0
      let hours = parseInt(timeMatch[1], 10)
      let minutes = parseInt(timeMatch[2], 10)
      if (isPM && hours !== 12) hours += 12
      if (isAM && hours === 12) hours = 0
      return hours + (minutes / 60)
    } catch { return 0 }
  }

  const formatTime = (timeFloat: number) => {
    const h = Math.floor(timeFloat)
    const m = Math.round((timeFloat - h) * 60)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h)
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const occupiedRooms = useMemo(() => {
    if (!isOffice) return [];
    return allBookings
      .filter(b => {
        if (editingBooking && b.id === editingBooking.id) return false;
        return b.venueId === selectedVenueId && 
               ["approved", "confirmed", "completed", "pending", "verifying"].includes(b.status?.toLowerCase() || "");
      })
      .map(b => {
        const match = b.eventName?.match(/Room \d+/);
        return match ? match[0] : null;
      })
      .filter(Boolean);
  }, [allBookings, isOffice, selectedVenueId, editingBooking]);

  const bookedIntervals = useMemo(() => {
    if (!date || isOffice) return []

    return allBookings
      .filter(b => {
        if (editingBooking && b.id === editingBooking.id) return false;
        if (b.venueId && b.venueId !== selectedVenueId) return false; 
        
        const validStatuses = ["approved", "confirmed", "completed", "pending", "verifying", "cancellation_requested"];
        const isConfirmed = validStatuses.includes(b.status?.toLowerCase() || "");
        
        return isConfirmed && b.date === date && b.time;
      })
      .map(b => {
        const parts = b.time.includes('-') ? b.time.split('-') : b.time.split(/to/i)
        return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) + REQUIRED_GAP }
      })
      .sort((a, b) => a.start - b.start)
  }, [date, allBookings, editingBooking, selectedVenueId, isOffice])

  const startTimeOptions = useMemo(() => {
    const options = []
    if (isOffice) return options;

    for (let t = OP_START; t <= OP_END - FIXED_DURATION; t += 1) { 
      const potentialEnd = t + FIXED_DURATION
      const isOverlapping = bookedIntervals.some(interval => {
        return (t < interval.end && (potentialEnd + REQUIRED_GAP) > interval.start)
      })
      options.push({ value: t.toString(), label: formatTime(t), disabled: isOverlapping })
    }
    return options
  }, [bookedIntervals, isOffice])

  const handleStartTimeChange = (val: string) => {
    setStartTime(val)
    setEndTime((parseFloat(val) + FIXED_DURATION).toString())
  }

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Login Required", description: "Please login to book.", variant: "destructive" })
      return
    }

    const activeMaintenance = maintenanceDates?.length > 0 ? maintenanceDates : localMaint;
    if (activeMaintenance.includes(`${selectedVenueId}|${date}`)) {
      toast({ title: "Date Unavailable", description: "This venue was just placed under maintenance by the Admin.", variant: "destructive" })
      return
    }

    setShowConfirmAlert(true) 
  }

  const executeSubmit = async () => {
    setShowConfirmAlert(false)
    setIsSubmitting(true)

    const timeString = isOffice ? "1 Year Contract" : `${formatTime(parseFloat(startTime))} - ${formatTime(parseFloat(endTime))}`;

    const bookingPayload = {
      userId: user?.id || "",
      venueId: selectedVenueId,
      venue: venueMap[selectedVenueId] || selectedVenueId || "Conference Hall",
      eventName: isOffice ? `Yearly Lease - ${selectedRoom}` : eventName,
      eventType: isOffice ? "office_lease" : eventType,
      guestCount: isOffice ? 1 : parseInt(guests),
      date: date,
      time: timeString,
      startTime: isOffice ? "08:00 AM" : formatTime(parseFloat(startTime)),
      endTime: isOffice ? "08:00 AM" : formatTime(parseFloat(endTime)),
      specialRequests: notes,
      status: editingBooking ? editingBooking.status : "pending",
      userInfo: {
        name: user?.name || "",
        email: user?.email || "",
        phone: "(555) 000-0000",
      },
    }

    try {
      if (editingBooking) {
         if (onSubmitSuccess) onSubmitSuccess({ ...bookingPayload, id: editingBooking.id });
      } else {
         await addBooking(bookingPayload);
         if (onSubmitSuccess) onSubmitSuccess(bookingPayload);
      }

      setIsSubmitting(false)
      onOpenChange(false)
      
      toast({
        title: editingBooking ? "Reservation Updated" : "Reservation Submitted",
        description: editingBooking ? "Modifications saved." : "Your booking is Pending. Secure it by paying first!",
      })
    } catch (error) {
      setIsSubmitting(false)
      toast({ title: "Error", description: "Failed to submit booking.", variant: "destructive" })
    }
  }

  const handlePrevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  const handleNextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))

  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null)
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1)

  const getDayStatus = (d: number) => {
    const iterDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    
    const activeMaintenance = maintenanceDates?.length > 0 ? maintenanceDates : localMaint;
    if (activeMaintenance.includes(`${selectedVenueId}|${iterDateStr}`)) return "maintenance"

    const iterDate = new Date(year, month, d)
    if (iterDate < minBookableDate) return "past"

    if (isOffice) return "none" 

    const dayBookings = allBookings.filter(b => {
      if (!b.date) return false;
      if (b.venueId && b.venueId !== selectedVenueId) return false;
      const validStatuses = ["approved", "confirmed", "completed", "pending", "verifying", "cancellation_requested"];
      return b.date === iterDateStr && validStatuses.includes(b.status?.toLowerCase() || "");
    })
    
    if (dayBookings.length === 0) return "none"

    const intervals = dayBookings.map(b => {
      if (!b.time) return { start: 0, end: 0 };
      const parts = b.time.includes('-') ? b.time.split('-') : b.time.split(/to/i);
      return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) + REQUIRED_GAP };
    }).filter(i => i.start !== i.end).sort((a, b) => a.start - b.start);

    let hasAvailableSlot = false;
    for (let t = OP_START; t <= OP_END - FIXED_DURATION; t += 1) { 
      const potentialEnd = t + FIXED_DURATION;
      const isOverlapping = intervals.some(interval => (t < interval.end && (potentialEnd + REQUIRED_GAP) > interval.start));
      if (!isOverlapping) { hasAvailableSlot = true; break; }
    }

    if (!hasAvailableSlot) return "full" 
    return "partial"
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] p-0 bg-white rounded-[2rem] border-none shadow-2xl overflow-visible z-[9999]">
        
        <DialogTitle className="sr-only">Reservation Details</DialogTitle>

        <div className="flex flex-col md:flex-row min-h-[520px]">
          {step === 1 ? (
            <>
              <div className="w-full md:w-[280px] bg-[#ea580c] p-8 md:p-10 text-white shrink-0 flex flex-col justify-center relative overflow-hidden rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none">
                <div className="relative z-10 flex flex-col h-full">
                  {onBackToVenues && (
                    <button onClick={onBackToVenues} className="text-white hover:text-orange-200 text-sm font-bold flex items-center mb-8 transition-colors w-fit">
                      <ChevronLeft className="w-4 h-4 mr-1" /> {editingBooking ? "Change Venue" : "Back"}
                    </button>
                  )}
                  <div className="mt-6 mb-auto">
                    <h2 className="text-4xl font-black tracking-tight mb-2 leading-tight">Select<br/>Schedule</h2>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 text-xs shadow-none">
                      {venueMap[selectedVenueId] || selectedVenueId || "Conference Hall"}
                    </Badge>
                    <p className="text-white/90 text-[15px] leading-relaxed mt-2">
                      {isOffice ? "Choose your contract start date and room." : "Choose your preferred date and time. All events are fixed for 6 Hours."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 md:p-10 flex flex-col relative rounded-b-[2rem] md:rounded-r-[2rem] md:rounded-bl-none">
                <div className="flex flex-col md:flex-row gap-10 lg:gap-14 flex-1 items-start mt-4">
                  <div className="flex-1 min-w-[260px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <button onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                      <div className="text-center">
                        <h3 className="font-bold text-slate-900 text-[15px] leading-snug whitespace-nowrap">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                      </div>
                      <button onClick={handleNextMonth} className="text-slate-400 hover:text-slate-900 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-x-1 gap-y-3 text-center mb-6">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>)}
                      {emptySlots.map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                      {days.map((day) => {
                        const status = getDayStatus(day)
                        const iterDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isSelected = date === iterDateStr
                        const isPast = status === "past"
                        const isMaintenance = status === "maintenance"
                        const isFull = status === "full" || isMaintenance

                        return (
                          <div key={day} className="flex justify-center items-center h-9">
                            <button 
                              type="button" disabled={isPast || isFull}
                              onClick={() => { setDate(iterDateStr); setStartTime(""); setEndTime(""); }}
                              className={`w-9 h-9 flex items-center justify-center text-[13px] font-bold rounded-full transition-all relative
                                ${isPast ? 'text-slate-300 cursor-not-allowed opacity-50' : 
                                  isFull ? 'bg-rose-50 text-rose-500 cursor-not-allowed border border-rose-200' : 
                                  isSelected ? 'bg-[#0f172a] text-white shadow-md' : 'text-slate-700 hover:bg-orange-50 hover:text-[#ea580c]'}`}
                            >
                              {day}
                              {!isSelected && status === "partial" && !isPast && <div className="absolute bottom-1 w-1 h-1 bg-[#eab308] rounded-full"></div>}
                              {!isSelected && isMaintenance && !isPast && <div className="absolute bottom-1 w-1 h-1 bg-slate-900 rounded-full"></div>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    
                    {!isOffice && (
                      <div className="mt-auto flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"/> Full / Not enough 6hrs</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#eab308] rounded-full"/> Partial</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-900 rounded-full"/> Maint</span>
                      </div>
                    )}
                  </div>

                  {isOffice ? (
                    <div className="w-full md:w-[240px] flex flex-col h-full shrink-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                      <div className="flex items-center gap-2 mb-6">
                        <Building2 className="w-4 h-4 text-[#ea580c]" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Select Room</h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Choose an Office Room</label>
                          <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!date}>
                            <SelectTrigger className="bg-white border-slate-200 rounded-2xl h-12 focus:ring-[#ea580c] text-sm shadow-sm">
                              <SelectValue placeholder={date ? "Select a room" : "Select date first"} />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="rounded-xl max-h-[250px] z-[99999] w-[var(--radix-select-trigger-width)] bg-white shadow-xl">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                                const roomName = `Room ${num}`;
                                const isOccupied = occupiedRooms.includes(roomName);
                                return (
                                  <SelectItem 
                                    key={num} 
                                    value={roomName} 
                                    disabled={isOccupied} 
                                    className={isOccupied ? "opacity-40 line-through text-slate-400 cursor-not-allowed" : "font-bold text-slate-700"}
                                  >
                                    {roomName} {isOccupied && "- Occupied"}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedRoom && date && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-emerald-50 text-emerald-700 p-3 mt-2 rounded-xl flex items-start text-xs font-bold border border-emerald-100">
                              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> 
                              <div>
                                1-Year Contract
                                <p className="font-normal text-[10px] mt-0.5 opacity-80">Strictly 1 User/Company per Room.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-6 w-full">
                        <Button disabled={!date || !selectedRoom} onClick={() => setStep(2)} className="w-full h-14 rounded-2xl bg-[#fca5a5] opacity-80 hover:opacity-100 text-white font-bold text-[15px] shadow-sm transition-transform active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-50" style={{ backgroundColor: (date && selectedRoom) ? '#ea580c' : undefined }}>
                          Continue to Details <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-[240px] flex flex-col h-full shrink-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                      <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-[#ea580c]" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Event Time</h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Start Time</label>
                          <Select value={startTime} onValueChange={handleStartTimeChange} disabled={!date}>
                            <SelectTrigger className="bg-white border-slate-200 rounded-2xl h-12 focus:ring-[#ea580c] text-sm shadow-sm">
                              <SelectValue placeholder={date ? "Choose start time" : "Select date first"} />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="rounded-xl max-h-[250px] z-[99999] w-[var(--radix-select-trigger-width)] bg-white shadow-xl">
                              {startTimeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className={opt.disabled ? "opacity-40 line-through text-slate-400 cursor-not-allowed" : "font-bold text-slate-700"}>
                                  {opt.label} {opt.disabled && "- Unavailable"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {startTime && endTime && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Computed End Time</label>
                            <div className="h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-4 text-sm font-bold text-slate-700 shadow-inner">{formatTime(parseFloat(endTime))}</div>
                            <div className="bg-emerald-50 text-emerald-700 p-2.5 mt-2 rounded-xl flex items-center justify-center text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-4 h-4 mr-1.5" /> 6 Hours Standard Duration</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-6 w-full">
                        <Button disabled={!date || !startTime || !endTime} onClick={() => setStep(2)} className="w-full h-14 rounded-2xl bg-[#fca5a5] opacity-80 hover:opacity-100 text-white font-bold text-[15px] shadow-sm transition-transform active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-50" style={{ backgroundColor: (date && startTime && endTime) ? '#ea580c' : undefined }}>
                          Continue to Details <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full md:w-[280px] bg-[#ea580c] p-8 md:p-10 text-white shrink-0 flex flex-col justify-center relative overflow-hidden rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none">
                <div className="relative z-10 flex flex-col h-full">
                  <button onClick={() => setStep(1)} className="text-white hover:text-orange-200 text-sm font-bold flex items-center mb-8 transition-colors w-fit"><ChevronLeft className="w-4 h-4 mr-1" /> Back</button>
                  <div className="mt-6 mb-auto">
                    <h2 className="text-3xl font-black tracking-tight mb-10 leading-tight">Booking<br/>Summary</h2>
                    <div className="space-y-10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0"><CalendarIcon className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">{isOffice ? "Contract Start Date" : "Selected Date"}</p>
                          <p className="font-bold text-lg">{date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">{isOffice ? "Duration" : "Time & Duration"}</p>
                          {isOffice ? (
                            <p className="font-bold text-lg leading-snug">1 Year<br/>Contract</p>
                          ) : (
                            <>
                              <p className="font-bold text-lg leading-snug">{startTime ? formatTime(parseFloat(startTime)) : ""} -<br/>{endTime ? formatTime(parseFloat(endTime)) : ""}</p>
                              <p className="text-sm text-white/90 mt-1">6 Hours (Fixed)</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 md:p-8 flex flex-col justify-center relative overflow-y-auto max-h-[90vh] rounded-b-[2rem] md:rounded-r-[2rem] md:rounded-bl-none">
                <div className="w-full max-w-[500px] mx-auto animate-in slide-in-from-right-8">
                  <div className="mb-5"><h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"><PartyPopper className="w-6 h-6 text-[#ea580c]" /> {isOffice ? "Lease Details" : "Event Details"}</h2><p className="text-xs text-slate-500 mt-1">Fill out your information to complete the request.</p></div>
                  
                  <form onSubmit={handlePreSubmit} className="space-y-4">
                    {isOffice ? (
                      <div className="mb-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Office Space</p>
                        <p className="text-base font-black text-[#ea580c]">{selectedRoom}</p>
                        <p className="text-xs text-slate-600 mt-1">Valid for 1-Year Contract</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">Event Name *</label>
                          <Input required value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. 18th Birthday Party" className="bg-white border-slate-200 h-10 rounded-lg px-4 text-xs focus-visible:ring-[#ea580c] shadow-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">Event Type *</label>
                            <Select value={eventType} onValueChange={setEventType} required>
                              <SelectTrigger className="bg-white border-slate-200 h-10 rounded-lg px-4 text-xs focus-visible:ring-[#ea580c] shadow-sm"><SelectValue placeholder="Choose Event Type" /></SelectTrigger>
                              <SelectContent className="rounded-lg text-xs z-[99999]"><SelectItem value="wedding">Wedding</SelectItem><SelectItem value="birthday">Birthday / Debut</SelectItem><SelectItem value="corporate">Corporate Event</SelectItem><SelectItem value="seminar">Seminar / Workshop</SelectItem><SelectItem value="other">Other Event</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">Estimated Guests *</label>
                            <Input required type="number" value={guests} onChange={e => setGuests(e.target.value)} placeholder="Max 250" className="bg-white border-slate-200 h-10 rounded-lg px-4 text-xs focus-visible:ring-[#ea580c] shadow-sm" />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">Special Requests / Notes</label>
                      <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={isOffice ? "Any specific layout needs for the office?" : "Tell us more about your event layout, catering needs, etc."} className="bg-white border-slate-200 min-h-[60px] resize-none rounded-lg p-3 text-xs focus-visible:ring-[#ea580c] shadow-sm" />
                    </div>
                    <div className="flex items-start space-x-2 py-2 mt-1 border-t border-slate-100 pt-3">
                      <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} className="mt-0.5 data-[state=checked]:bg-[#ea580c] data-[state=checked]:border-[#ea580c]" />
                      <div className="grid gap-1 leading-none">
                        <Label htmlFor="terms" className="text-xs font-medium leading-relaxed cursor-pointer text-slate-700">
                          I agree to the <Dialog><DialogTrigger asChild><button type="button" className="text-[#ea580c] font-bold underline hover:text-[#c2410c]">Terms and Conditions</button></DialogTrigger><DialogContent className="max-w-4xl w-full h-[75vh] flex flex-col bg-white rounded-[2rem] z-[99999]"><DialogHeader><DialogTitle className="text-2xl font-black">Venue Booking Terms and Conditions</DialogTitle></DialogHeader><div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-2xl text-sm text-slate-700 border border-slate-100 mt-2"><p className="mb-4 text-base"><strong>1. Reservation and Payment Policy</strong></p><p className="mb-6 leading-relaxed">A partial downpayment must be made within <strong>24 hours (1 day)</strong> of the initial booking request. Failure to provide proof of payment within this timeframe will result in the automatic cancellation of the requested date. The remaining balance must be settled completely within <strong>one (1) week</strong> of the initial downpayment.</p><p className="mb-4 text-base"><strong>2. Physical Contract Signing</strong></p><p className="mb-6 leading-relaxed">Once the initial payment is confirmed, the customer is required to visit the venue for the physical signing of the contract. The booking status will reflect <em>"Approved but awaiting physical signing"</em> until this is completed.</p></div></DialogContent></Dialog>
                        </Label>
                      </div>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Button type="submit" disabled={isSubmitting || (!isOffice && (!eventName || !eventType || !guests)) || (isOffice && !selectedRoom) || !agreed} className="w-full h-11 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-sm shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-300">
                        {editingBooking ? "Save Changes" : "Confirm Reservation"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      <Dialog open={showConfirmAlert} onOpenChange={setShowConfirmAlert}>
         <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-6 z-[99999]">
            <DialogHeader>
               <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#ea580c]"><AlertCircle className="w-6 h-6" /> Confirm Submission</DialogTitle>
               <DialogDescription className="text-slate-600 pt-3 text-sm">Please review your reservation details before finalizing:</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 text-slate-800 mt-2">
               <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">{isOffice ? "Room:" : "Event:"}</span><span className="font-bold truncate max-w-[200px] text-right">{isOffice ? `Yearly Lease - ${selectedRoom}` : eventName}</span></div>
               <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Venue:</span><span className="font-bold text-right">{venueMap[selectedVenueId] || selectedVenueId || "Conference Hall"}</span></div>
               <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">{isOffice ? "Start Date:" : "Date & Time:"}</span><span className="font-bold text-right">{date}{!isOffice && <><br/>{startTime ? formatTime(parseFloat(startTime)) : ""} - {endTime ? formatTime(parseFloat(endTime)) : ""}</>}</span></div>
               <div className="flex justify-between"><span className="text-slate-500 font-medium">{isOffice ? "Duration:" : "Guests:"}</span><span className="font-bold">{isOffice ? "1 Year Contract" : `${guests} pax`}</span></div>
            </div>
            <p className="text-sm text-slate-600 mt-4 mb-2 text-center">Are you sure you want to proceed with this booking?</p>
            <div className="flex justify-end gap-3 mt-2">
               <Button variant="outline" onClick={() => setShowConfirmAlert(false)} className="rounded-xl h-11 px-6 font-bold text-slate-600 border-slate-200 hover:bg-slate-50">Review Again</Button>
               <Button onClick={executeSubmit} disabled={isSubmitting} className="bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl h-11 px-6 font-bold shadow-md">
                 {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Yes, Submit"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </Dialog>
  )
}