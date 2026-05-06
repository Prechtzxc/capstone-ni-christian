"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBookings } from "@/components/booking-context"
import { Clock, ChevronLeft, ChevronRight, ArrowRight, Loader2, Calendar as CalendarIcon, PartyPopper, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MAINTENANCE_DATES = ["2026-06-15", "2026-06-16"]

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVenueId: string
  onBackToVenues?: () => void
  editingBooking?: any | null 
  onSubmitSuccess?: (bookingData: any) => void 
}

export function ReserveDialog({ open, onOpenChange, selectedVenueId, onBackToVenues, editingBooking, onSubmitSuccess }: ReserveDialogProps) {
  const { bookings } = useBookings()
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
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const OP_START = 8
  const OP_END = 22
  const MAX_HOURS = 6 

  const minBookableDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setHours(0,0,0,0)
    return d
  }, [])

  useEffect(() => {
    if (open) {
      if (editingBooking) {
        setStep(1) // PINALITAN KO TO NG 1 PARA SA SCHEDULE MAG-UMPISA PAG MODIFY!
        try {
          const d = new Date(editingBooking.date)
          setDate(d.toISOString().split('T')[0])
          setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1))
        } catch { setDate("") }
        
        if (editingBooking.time) {
          const parts = editingBooking.time.includes('-') ? editingBooking.time.split('-') : editingBooking.time.split(/to/i)
          setStartTime(parseTimeStr(parts[0]).toString())
          setEndTime(parseTimeStr(parts[1]).toString())
        }
        setEventName(editingBooking.eventName || "")
        setEventType(editingBooking.eventType || "")
        setGuests(editingBooking.guests || "150") 
        setNotes(editingBooking.notes || "")
      } else {
        setStep(1)
        setDate("")
        setStartTime("")
        setEndTime("")
        setEventName("")
        setEventType("")
        setGuests("")
        setNotes("")
        const d = new Date()
        d.setMonth(d.getMonth() + 1)
        d.setDate(1)
        setCalendarMonth(d)
      }
    }
  }, [open, editingBooking])

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

  const bookedIntervals = useMemo(() => {
    if (!date) return []
    const [sYear, sMonth, sDay] = date.split('-').map(Number);

    return allBookings
      .filter(b => {
        if (editingBooking && b.id === editingBooking.id) return false;
        const isConfirmed = ["approved", "confirmed", "completed"].includes(b.status?.toLowerCase() || "")
        
        const bDateObj = new Date(b.date);
        const isSameDate = bDateObj.getFullYear() === sYear && 
                           bDateObj.getMonth() === sMonth - 1 && 
                           bDateObj.getDate() === sDay;

        return isConfirmed && isSameDate && b.time
      })
      .map(b => {
        const parts = b.time.includes('-') ? b.time.split('-') : b.time.split(/to/i)
        return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) }
      })
      .sort((a, b) => a.start - b.start)
  }, [date, allBookings, selectedVenueId, editingBooking])

  const startTimeOptions = useMemo(() => {
    const options = []
    for (let t = OP_START; t <= OP_END - 1; t += 1) { 
      const isInsideBooking = bookedIntervals.some(interval => t >= interval.start && t < interval.end)
      let maxAvailableDuration = OP_END - t
      for (const interval of bookedIntervals) {
        if (interval.start > t) {
          maxAvailableDuration = Math.min(maxAvailableDuration, interval.start - t)
          break;
        }
      }
      const isValid = !isInsideBooking && maxAvailableDuration >= 1
      options.push({ value: t.toString(), label: formatTime(t), disabled: !isValid })
    }
    return options
  }, [bookedIntervals])

  const endTimeOptions = useMemo(() => {
    if (!startTime) return []
    const start = parseFloat(startTime)
    const options = []
    let nextBookingStart = OP_END
    for (const interval of bookedIntervals) {
      if (interval.start >= start) {
        nextBookingStart = interval.start
        break
      }
    }
    const absoluteMax = Math.min(start + MAX_HOURS, nextBookingStart, OP_END)

    for (let t = start + 1; t <= absoluteMax; t += 1) {
      options.push({ value: t.toString(), label: formatTime(t), disabled: false })
    }
    return options
  }, [startTime, bookedIntervals])

  const handleStartTimeChange = (val: string) => {
    setStartTime(val)
    setEndTime("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      
      if (onSubmitSuccess) {
        onSubmitSuccess({
          id: editingBooking ? editingBooking.id : `mock-${Date.now()}`,
          eventName,
          eventType,
          date: new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: `${formatTime(parseFloat(startTime))} - ${formatTime(parseFloat(endTime))}`,
          venueId: selectedVenueId,
          guests,
          notes,
          status: editingBooking ? editingBooking.status : "pending"
        })
      }

      onOpenChange(false)
      toast({
        title: editingBooking ? "Reservation Updated" : "Reservation Submitted",
        description: editingBooking ? "Modifications saved." : "Your booking is Pending. Secure it by paying first!",
      })
    }, 1200)
  }

  const handlePrevMonth = () => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    if (prev >= new Date(minBookableDate.getFullYear(), minBookableDate.getMonth(), 1)) {
       setCalendarMonth(prev)
    }
  }
  const handleNextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))

  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null)
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1)

  const getDayStatus = (d: number) => {
    const iterDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (MAINTENANCE_DATES.includes(iterDateStr)) return "maintenance"

    const iterDate = new Date(year, month, d)
    if (iterDate < minBookableDate) return "past"

    const dayBookings = allBookings.filter(b => {
      if (!b.date) return false;
      const bDate = new Date(b.date);
      return bDate.getFullYear() === year && bDate.getMonth() === month && bDate.getDate() === d && ["approved", "confirmed", "completed"].includes(b.status?.toLowerCase() || "");
    })
    if (dayBookings.length === 0) return "none"

    const intervals = dayBookings.map(b => {
      if (!b.time) return { start: 0, end: 0 };
      const parts = b.time.includes('-') ? b.time.split('-') : b.time.split(/to/i);
      return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
    }).filter(i => i.start !== i.end).sort((a, b) => a.start - b.start);

    let maxGap = 0; let currentTime = OP_START;
    for (const interval of intervals) {
      if (interval.start > currentTime) {
        const gap = interval.start - currentTime;
        if (gap > maxGap) maxGap = gap;
      }
      if (interval.end > currentTime) currentTime = interval.end;
    }
    if (OP_END > currentTime) {
      const gap = OP_END - currentTime;
      if (gap > maxGap) maxGap = gap;
    }

    if (maxGap < 1) return "full" 
    return "partial"
  }

  const formatDuration = () => {
    if (!startTime || !endTime) return ""
    const diff = parseFloat(endTime) - parseFloat(startTime)
    return `${diff} hr${diff > 1 ? 's' : ''} total`
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] p-0 bg-white rounded-3xl border-none shadow-2xl overflow-hidden">
        
        <DialogTitle className="sr-only">Reservation Details</DialogTitle>
        <DialogDescription className="sr-only">Form to select date, time, and provide event details.</DialogDescription>

        <div className="flex flex-col md:flex-row min-h-[520px]">
          {step === 1 ? (
            <>
              {/* --- LEFT ORANGE PANEL --- */}
              <div className="w-full md:w-[280px] bg-[#f97316] p-8 md:p-10 text-white shrink-0 flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full">
                  {onBackToVenues && (
                    <button onClick={onBackToVenues} className="text-white hover:text-orange-200 text-sm font-bold flex items-center mb-8 transition-colors w-fit">
                      <ChevronLeft className="w-4 h-4 mr-1" /> {editingBooking ? "Change Venue" : "Back"}
                    </button>
                  )}
                  <div className="mt-6 mb-auto">
                    <h2 className="text-4xl font-black tracking-tight mb-6 leading-tight">Select<br/>Schedule</h2>
                    <p className="text-white/90 text-[15px] leading-relaxed">
                      Choose your preferred date and time. You can book for a maximum of 6 hours per event.
                    </p>
                  </div>
                </div>
              </div>

              {/* --- RIGHT WHITE PANEL (CALENDAR & TIME SIDE-BY-SIDE) --- */}
              <div className="flex-1 bg-white p-6 md:p-10 flex flex-col relative">
                
                <div className="flex flex-col md:flex-row gap-10 lg:gap-14 flex-1 items-start mt-4">
                  
                  {/* CALENDAR COLUMN */}
                  <div className="flex-1 min-w-[260px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <button onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="text-center">
                        <h3 className="font-bold text-slate-900 text-[15px] leading-snug whitespace-nowrap">
                          {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                      </div>
                      <button onClick={handleNextMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-x-1 gap-y-3 text-center mb-6">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                        <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                      ))}
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
                              disabled={isPast || isFull}
                              onClick={() => {
                                setDate(iterDateStr)
                                setStartTime("")
                                setEndTime("")
                              }}
                              className={`w-9 h-9 flex items-center justify-center text-[13px] font-bold rounded-full transition-all relative
                                ${isPast || isFull ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-orange-50 hover:text-[#ea580c]'}
                                ${isSelected ? 'bg-[#0f172a] text-white shadow-md' : ''}
                              `}
                            >
                              {day}
                              {!isSelected && isMaintenance && <div className="absolute bottom-1 w-1 h-1 bg-slate-900 rounded-full"></div>}
                              {!isSelected && isFull && !isMaintenance && !isPast && <div className="absolute bottom-1 w-1 h-1 bg-rose-500 rounded-full"></div>}
                              {!isSelected && status === "partial" && !isPast && <div className="absolute bottom-1 w-1 h-1 bg-[#eab308] rounded-full"></div>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* FLAT LEGEND */}
                    <div className="mt-auto flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"/> Full</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#eab308] rounded-full"/> Partial</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-900 rounded-full"/> Maint</span>
                    </div>
                  </div>

                  {/* EVENT TIME COLUMN */}
                  <div className="w-full md:w-[240px] flex flex-col h-full shrink-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-4 h-4 text-[#ea580c]" />
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Event Time</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Time</label>
                        <Select value={startTime} onValueChange={handleStartTimeChange} disabled={!date}>
                          <SelectTrigger className="bg-white border-slate-200 rounded-2xl h-12 focus:ring-[#ea580c] text-sm shadow-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {startTimeOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className={opt.disabled ? "opacity-40 line-through text-rose-500" : ""}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Time</label>
                        <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                          <SelectTrigger className="bg-white border-slate-200 rounded-2xl h-12 focus:ring-[#ea580c] text-sm shadow-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {endTimeOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {startTime && endTime && (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl flex items-center justify-center text-xs font-bold border border-emerald-100 animate-in zoom-in-95">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> {parseFloat(endTime) - parseFloat(startTime)} Hours Selected
                        </div>
                      )}
                    </div>

                    {/* BUTTON NASA PINAKABABA NG RIGHT SIDE */}
                    <div className="mt-auto pt-6">
                      <Button 
                        disabled={!date || !startTime || !endTime} 
                        onClick={() => setStep(2)}
                        className="w-full h-14 rounded-2xl bg-[#fca5a5] opacity-80 hover:opacity-100 text-white font-bold text-[15px] shadow-sm transition-transform active:scale-[0.98] disabled:bg-orange-200 disabled:opacity-50"
                        style={{ backgroundColor: (date && startTime && endTime) ? '#ea580c' : undefined }}
                      >
                        Continue to Details <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            
          /* ============================================================== */
          /* STEP 2: SUMMARY & FORM DETAILS                                 */
          /* ============================================================== */
            <>
              {/* LEFT: LIGHT ORANGE BOOKING SUMMARY */}
              <div className="w-full md:w-[280px] bg-[#f97316] p-8 md:p-10 text-white shrink-0 flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full">
                  <button onClick={() => setStep(1)} className="text-white hover:text-orange-200 text-sm font-bold flex items-center mb-8 transition-colors w-fit">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  
                  <div className="mt-6 mb-auto">
                    <h2 className="text-3xl font-black tracking-tight mb-10 leading-tight">Booking<br/>Summary</h2>

                    <div className="space-y-10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Selected Date</p>
                          <p className="font-bold text-lg">{date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Time & Duration</p>
                          <p className="font-bold text-lg leading-snug">{startTime ? formatTime(parseFloat(startTime)) : ""} -<br/>{endTime ? formatTime(parseFloat(endTime)) : ""}</p>
                          <p className="text-sm text-white/90 mt-1">{formatDuration()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: WHITE FORM DETAILS */}
              <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center relative">
                
                <div className="w-full max-w-[500px] mx-auto animate-in slide-in-from-right-8">
                  <div className="mb-10">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <PartyPopper className="w-7 h-7 text-[#f97316]" /> Event Details
                     </h2>
                     <p className="text-sm text-slate-500 mt-2">Fill out your information to complete the request.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                     
                     {/* EVENT NAME - FULL WIDTH */}
                     <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2.5 block uppercase tracking-wider">Event Name *</label>
                        <Input required value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. 18th Birthday Party" className="bg-white border-slate-200 h-12 rounded-xl px-5 text-sm focus-visible:ring-[#f97316] shadow-sm" />
                     </div>

                     {/* EVENT TYPE AND GUESTS - 2 COLUMNS */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                          <label className="text-[11px] font-bold text-slate-700 mb-2.5 block uppercase tracking-wider">Event Type *</label>
                          <Select value={eventType} onValueChange={setEventType} required>
                            <SelectTrigger className="bg-white border-slate-200 h-12 rounded-xl px-5 text-sm focus-visible:ring-[#f97316] shadow-sm">
                              <SelectValue placeholder="Choose Event Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="birthday">Birthday / Debut</SelectItem>
                              <SelectItem value="corporate">Corporate Event</SelectItem>
                              <SelectItem value="seminar">Seminar / Workshop</SelectItem>
                              <SelectItem value="other">Other Event</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div>
                          <label className="text-[11px] font-bold text-slate-700 mb-2.5 block uppercase tracking-wider">Estimated Guests *</label>
                          <Input required type="number" value={guests} onChange={e => setGuests(e.target.value)} placeholder="150" className="bg-white border-slate-200 h-12 rounded-xl px-5 text-sm focus-visible:ring-[#f97316] shadow-sm" />
                       </div>
                     </div>
                     
                     {/* NOTES - FULL WIDTH */}
                     <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2.5 block uppercase tracking-wider">Special Requests / Notes</label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tell us more about your event layout, catering needs, etc." className="bg-white border-slate-200 min-h-[100px] resize-none rounded-xl p-5 text-sm focus-visible:ring-[#f97316] shadow-sm" />
                     </div>
                     
                     <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !eventName || !eventType || !guests} className="w-full md:w-auto px-10 h-12 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-base shadow-md transition-transform active:scale-[0.98] disabled:opacity-50">
                          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</> : (editingBooking ? "Save Changes" : "Confirm Reservation")}
                        </Button>
                     </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}