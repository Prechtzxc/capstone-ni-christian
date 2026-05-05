"use client"

import * as React from "react"
import { useState } from "react"
import { format, addMonths, addDays } from "date-fns" 
import { useAuth } from "@/src/modules/shared/auth/auth-context" 
import { useBookings } from "@/components/booking-context" 
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Clock, CalendarDays, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, CalendarCheck, Users, PartyPopper } from "lucide-react"

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBackToVenues?: () => void
  selectedVenueId?: string 
}

const generateTimeOptions = () => {
  const times = []
  for (let i = 8; i <= 22; i++) {
    const hour12 = i > 12 ? i - 12 : i
    const ampm = i >= 12 ? "PM" : "AM"
    const displayHour = hour12 === 0 ? 12 : hour12
    const hourStr = displayHour.toString().padStart(2, "0")

    times.push({ value: `${i.toString().padStart(2, "0")}:00`, label: `${hourStr}:00 ${ampm}` })
    if (i !== 22) {
      times.push({ value: `${i.toString().padStart(2, "0")}:30`, label: `${hourStr}:30 ${ampm}` })
    }
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

export function ReserveDialog({ open, onOpenChange, onBackToVenues, selectedVenueId }: ReserveDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { bookings, addBooking } = useBookings() 
  
  const [step, setStep] = useState<1 | 2>(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string>("08:00")
  const [endTime, setEndTime] = useState<string>("10:00")
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "",
    otherEventType: "",
    guests: "",
    notes: ""
  })

  // LOGIC PARA SA 1-MONTH ADVANCE BOOKING
  const today = new Date()
  const minDate = addMonths(today, 1)

  // LOGIC PARA SA CALENDAR AVAILABILITY
  const fullyBookedDates: Date[] = []
  const partiallyBookedDates: Date[] = []

  for (let i = 0; i < 90; i++) {
    const d = addDays(minDate, i)
    const dateStr = format(d, "MMMM d, yyyy") 

    const dayBookings = (bookings || []).filter((b: any) => b.date === dateStr && b.venueId === selectedVenueId)

    if (dayBookings.length > 0) {
      let totalHoursBooked = 0
      
      dayBookings.forEach((b: any) => {
        if (b.startTime && b.endTime) {
          const [sH, sM] = b.startTime.split(':').map(Number)
          const [eH, eM] = b.endTime.split(':').map(Number)
          totalHoursBooked += (eH + eM / 60) - (sH + sM / 60)
        } else {
          totalHoursBooked += 4 
        }
      })

      const remainingHours = 14 - totalHoursBooked 
      
      if (remainingHours < 6) {
        fullyBookedDates.push(d)
      } else {
        partiallyBookedDates.push(d) 
      }
    }
  }

  const getDuration = () => {
    if (!startTime || !endTime) return 0
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)
    return (endH + endM / 60) - (startH + startM / 60)
  }

  const duration = getDuration()
  const isValidTime = duration > 0 && duration <= 6

  const getDisplayTime = (val: string) => TIME_OPTIONS.find(t => t.value === val)?.label || val

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setDate(undefined)
        setStartTime("08:00")
        setEndTime("10:00")
        setFormData({ name: "", phone: "", eventType: "", otherEventType: "", guests: "", notes: "" })
      }, 300)
    }
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalEventType = formData.eventType === "Others" ? formData.otherEventType : formData.eventType
    
    const newBooking = {
      id: "bk_" + Math.random().toString(36).substr(2, 9),
      userId: user?.id,
      venueId: selectedVenueId,
      eventName: finalEventType,
      date: date ? format(date, "MMMM d, yyyy") : "",
      time: `${getDisplayTime(startTime)} - ${getDisplayTime(endTime)}`,
      startTime: startTime,
      endTime: endTime,
      guests: formData.guests,
      status: "pending",
      contactName: formData.name,
      contactPhone: formData.phone,
      notes: formData.notes,
    }

    if (addBooking) {
      addBooking(newBooking)
    }
    
    toast({
      title: "Reservation Submitted!",
      description: "We have received your booking request. It is now pending for admin approval.",
    })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* 
        FIT TO SCREEN (max-w-[950px] h-[580px])
      */}
      <DialogContent className="!max-w-[950px] w-[95vw] h-[580px] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col [&>button]:hidden rounded-3xl">
        
        <DialogTitle className="sr-only">Reserve Your Event</DialogTitle>
        <DialogDescription className="sr-only">Choose a date and time for your event.</DialogDescription>

        {/* STEP 1: DATE AND TIME SELECTION */}
        {step === 1 && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_380px] h-full w-full animate-in slide-in-from-left-4 fade-in duration-300">
            
            {/* LEFT SIDE - CALENDAR */}
            <div className="relative bg-white flex flex-col items-center justify-center p-8 h-full border-r border-gray-100">
              
              {onBackToVenues && (
                <div className="absolute top-5 left-5 z-20">
                  <button 
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors text-sm font-medium"
                    onClick={onBackToVenues} 
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
              )}

              <div className="w-full max-w-[320px] flex flex-col items-center">
                <h2 className="text-[28px] font-extrabold text-[#0f172a] tracking-tight text-center">Reserve Date</h2>
                <p className="text-gray-500 mt-1 mb-5 text-[14px] text-center">
                  Select your preferred date.
                </p>

                {/* RELATIVE DITO SA PINAKA-WHITE BOX */}
                <div className="relative rounded-2xl border border-gray-100 shadow-sm p-5 bg-white w-full mx-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    defaultMonth={minDate} 
                    disabled={[
                      (d) => d < minDate,
                      ...fullyBookedDates
                    ]}
                    modifiers={{
                      fullyBooked: fullyBookedDates,
                      partiallyBooked: partiallyBookedDates
                    }}
                    modifiersClassNames={{
                      fullyBooked: "bg-red-500 text-white font-bold hover:bg-red-600 hover:text-white rounded-lg",
                      partiallyBooked: "bg-amber-400 text-white font-bold hover:bg-amber-500 hover:text-white rounded-lg"
                    }}
                    className="w-full flex justify-center"
                    classNames={{
                      months: "flex flex-col space-y-2 w-full",
                      month: "space-y-2 w-full", 
                      
                      caption: "flex justify-center pt-1 relative items-center w-full mb-3",
                      caption_label: "text-[15px] font-bold text-gray-900",
                      nav: "absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-1",
                      nav_button:"h-8 w-8 bg-white text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-sm",
                      nav_button_previous: "absolute left-0",
                      nav_button_next: "absolute right-0",
                      // ========================================================

                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full justify-between mb-1",
                      head_cell: "text-gray-400 rounded-md w-9 font-medium text-[11px] uppercase text-center",
                      row: "flex w-full mt-1 justify-between",
                      cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: "h-8 w-8 p-0 font-medium text-[13px] text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors aria-selected:opacity-100 flex items-center justify-center mx-auto",
                      day_selected: "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white rounded-lg shadow-sm font-bold",
                      day_today: "bg-gray-50 text-gray-900",
                      day_outside: "text-gray-300 opacity-50",
                      day_disabled: "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-300",
                    }}
                  />

                  {/* LEGEND */}
                  <div className="flex justify-center items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">Fully Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">Partially</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - TIME CUSTOMIZATION */}
            <div className="flex flex-col bg-gray-50 p-8 justify-center h-full">
              <div className="w-full max-w-[340px] mx-auto">
                
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-[#d97706]" />
                  <h3 className="text-2xl font-bold text-[#0f172a]">Set Event Time</h3>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {!date ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-white/50 h-[220px]">
                      <CalendarDays className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-center text-[12px] max-w-[200px] leading-relaxed">
                        Please select a date from the calendar to configure your time.
                      </p>
                      <div className="mt-4 text-[10px] font-semibold text-[#d97706] bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full text-center">
                        Note: 1-month advance booking
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <p className="text-[13px] font-medium text-gray-600">
                          Selected Date: <span className="text-[#d97706] font-bold ml-1">{format(date, "MMMM d, yyyy")}</span>
                        </p>
                      </div>
                      
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#0f172a]">Start Time</label>
                            <select
                              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[12px] focus:outline-none focus:border-[#d97706] transition-colors cursor-pointer text-gray-700"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={`start-${time.value}`} value={time.value}>
                                  {time.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#0f172a]">End Time</label>
                            <select
                              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[12px] focus:outline-none focus:border-[#d97706] transition-colors cursor-pointer text-gray-700"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={`end-${time.value}`} value={time.value}>
                                  {time.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="pt-1">
                          {duration <= 0 ? (
                            <div className="flex items-center text-red-600 text-[11px] bg-red-50 p-2.5 rounded-lg border border-red-100">
                              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                              End time must be after start.
                            </div>
                          ) : duration > 6 ? (
                            <div className="flex items-center text-red-600 text-[11px] bg-red-50 p-2.5 rounded-lg border border-red-100">
                              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                              Max duration is 6 hrs.
                            </div>
                          ) : (
                            <div className="flex items-center text-green-700 text-[11px] bg-green-50 p-2.5 rounded-lg border border-green-100 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-green-600" />
                              Valid Duration: {duration} {duration === 1 ? "hour" : "hours"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <Button 
                      className={`w-full h-11 text-[14px] font-bold transition-all rounded-xl ${
                        date && isValidTime 
                          ? "bg-[#d97706] hover:bg-amber-700 text-white shadow-md shadow-amber-200 hover:-translate-y-0.5" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!date || !isValidTime}
                      onClick={() => setStep(2)} 
                    >
                      Continue to Details
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BOOKING DETAILS FORM */}
        {step === 2 && (
          <form onSubmit={handleSubmitBooking} className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] h-full w-full animate-in slide-in-from-right-4 fade-in duration-300">
            
            {/* LEFT SIDE - SUMMARY PANEL (ORANGE) */}
            <div className="relative flex flex-col bg-[#d97706] text-white pt-10 pb-8 px-8 h-full">
              
              <button 
                type="button"
                onClick={() => setStep(1)} 
                className="absolute top-5 left-5 flex items-center text-white/90 hover:text-white font-medium transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </button>

              <div className="mt-8">
                <h2 className="text-[28px] font-bold mb-8 leading-tight">Booking<br/>Summary</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl shrink-0 backdrop-blur-sm shadow-inner">
                      <CalendarCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-amber-100 text-[10px] font-medium mb-0.5 uppercase tracking-wider">Selected Date</p>
                      <p className="text-[14px] font-bold">{date ? format(date, "MMM d, yyyy") : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl shrink-0 backdrop-blur-sm shadow-inner">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-amber-100 text-[10px] font-medium mb-0.5 uppercase tracking-wider">Time & Duration</p>
                      <p className="text-[14px] font-bold">{getDisplayTime(startTime)} - {getDisplayTime(endTime)}</p>
                      <p className="text-amber-100 text-[11px] mt-0.5">{duration} {duration === 1 ? "hr" : "hrs"} total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="flex flex-col bg-white pt-10 pb-8 px-10 h-full overflow-y-auto custom-scrollbar">
              <div className="w-full max-w-[450px] mx-auto mt-4">
                <h3 className="text-[28px] font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PartyPopper className="text-amber-600 w-6 h-6" />
                  Event Details
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[#0f172a] font-bold text-[11px]">Full Name *</Label>
                      <Input 
                        id="name" 
                        required 
                        className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-lg" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-[#0f172a] font-bold text-[11px]">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        required 
                        className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-lg" 
                        placeholder="(0912) 345-6789"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="type" className="text-[#0f172a] font-bold text-[11px]">Event Type *</Label>
                      <select
                        id="type"
                        required
                        className="flex h-10 text-sm w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-shadow cursor-pointer text-gray-700"
                        value={formData.eventType}
                        onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                      >
                        <option value="" disabled>Choose Event Type</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Corporate Event">Corporate Event</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Baptism">Baptism</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="guests" className="text-[#0f172a] font-bold text-[11px]">Estimated Guests *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          id="guests" 
                          type="number" 
                          required 
                          className="h-10 text-sm pl-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-lg" 
                          placeholder="e.g. 150"
                          value={formData.guests}
                          onChange={(e) => setFormData({...formData, guests: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {formData.eventType === "Others" && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="otherType" className="text-[#0f172a] font-bold text-[11px]">Please Specify Event Type *</Label>
                      <Input 
                        id="otherType" 
                        required 
                        className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-lg" 
                        placeholder="e.g. Reunion, Seminar, etc."
                        value={formData.otherEventType}
                        onChange={(e) => setFormData({...formData, otherEventType: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-[#0f172a] font-bold text-[11px]">Special Requests / Notes</Label>
                    <Textarea 
                      id="notes" 
                      className="min-h-[80px] text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] resize-none rounded-lg p-3" 
                      placeholder="Tell us more about your event layout, catering needs, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" className="w-full md:w-auto md:min-w-[180px] h-11 text-[13px] font-bold bg-[#d97706] hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                      Confirm Reservation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

      </DialogContent>
    </Dialog>
  )
}