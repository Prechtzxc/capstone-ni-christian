"use client"

import * as React from "react"
import { useState } from "react"
import { format, addMonths, addDays } from "date-fns" 
import { useAuth } from "@/src/modules/shared/auth/auth-context" // Idinagdag para sa user info
import { useBookings } from "@/components/booking-context" // Idinagdag para ma-save yung booking
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
  selectedVenueId?: string // Bagong prop para i-filter yung bookings
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
  const { bookings, addBooking } = useBookings() // Kinuha natin yung data at save function
  
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

  // LOGIC PARA SA CALENDAR AVAILABILITY (Red vs Orange)
  const fullyBookedDates: Date[] = []
  const partiallyBookedDates: Date[] = []

  // Tsine-check natin ang susunod na 90 days mula sa minDate
  for (let i = 0; i < 90; i++) {
    const d = addDays(minDate, i)
    const dateStr = format(d, "MMMM d, yyyy") // Format na ginagamit natin pang-save

    // Kunin lahat ng bookings para sa specific venue at specific date na ito
    const dayBookings = (bookings || []).filter((b: any) => b.date === dateStr && b.venueId === selectedVenueId)

    if (dayBookings.length > 0) {
      let totalHoursBooked = 0
      
      dayBookings.forEach((b: any) => {
        if (b.startTime && b.endTime) {
          const [sH, sM] = b.startTime.split(':').map(Number)
          const [eH, eM] = b.endTime.split(':').map(Number)
          totalHoursBooked += (eH + eM / 60) - (sH + sM / 60)
        } else {
          totalHoursBooked += 4 // Fallback kung luma yung data at walang specific time
        }
      })

      const remainingHours = 14 - totalHoursBooked // 14 hours ang total (8am to 10pm)
      
      // Kapag ang natitirang oras ay hindi na aabot ng 6 hours, RED na siya.
      if (remainingHours < 6) {
        fullyBookedDates.push(d)
      } else {
        partiallyBookedDates.push(d) // Kung kaya pa, ORANGE siya.
      }
    }
  }

  // LOGIC PARA SA DURATION COMPUTATION NUNG USER NA GUSTONG MAG-BOOK
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
    
    // ITO YUNG MAGS-SAVE NG BOOKING PAPUNTA SA ADMIN/CLIENT SIDE
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
      <DialogContent className="sm:max-w-[1200px] min-h-[700px] p-0 overflow-hidden bg-gray-50 border-none shadow-2xl transition-all duration-300">
        
        <DialogTitle className="sr-only">Reserve Your Event</DialogTitle>
        <DialogDescription className="sr-only">Choose a date and time for your event.</DialogDescription>

        {/* STEP 1: DATE AND TIME SELECTION */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.2fr] h-full min-h-[700px] animate-in slide-in-from-left-4 fade-in duration-300">
            
            {/* LEFT SIDE - CALENDAR */}
            <div className="p-12 pt-20 bg-white border-r border-gray-100 flex flex-col items-center relative h-full justify-center">
              
              {onBackToVenues && (
                <div className="absolute top-6 left-6">
                  <Button 
                    variant="ghost" 
                    className="text-gray-500 hover:text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-xl h-auto flex items-center gap-2 transition-colors"
                    onClick={onBackToVenues} 
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold text-[15px]">Back to Venues</span>
                  </Button>
                </div>
              )}

              <div className="w-full mb-6 text-center">
                <h2 className="text-4xl font-bold text-gray-900">Reserve Your Date</h2>
                <p className="text-gray-500 mt-3 text-base">
                  Select your preferred date to begin.
                </p>
              </div>

              <div className="relative rounded-3xl border border-gray-100 shadow-sm p-8 bg-white w-full max-w-[420px]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  defaultMonth={minDate} 
                  
                  // Disable kapag < minDate OR kapag fully booked (Red)
                  disabled={[
                    (d) => d < minDate,
                    ...fullyBookedDates
                  ]}
                  
                  // Color Modifiers natin para sa Red at Orange
                  modifiers={{
                    fullyBooked: fullyBookedDates,
                    partiallyBooked: partiallyBookedDates
                  }}
                  modifiersClassNames={{
                    fullyBooked: "bg-red-500 text-white font-bold opacity-100 hover:bg-red-600 hover:text-white rounded-xl",
                    partiallyBooked: "bg-amber-400 text-white font-bold opacity-100 hover:bg-amber-500 hover:text-white rounded-xl"
                  }}
                  
                  className="w-full flex justify-center"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center w-full mb-6",
                    caption_label: "text-[18px] font-bold text-gray-900",
                    nav: "absolute inset-0 flex items-center justify-between pointer-events-none px-2",
                    nav_button: "h-10 w-10 bg-white text-gray-600 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 rounded-full flex items-center justify-center transition-colors pointer-events-auto shadow-sm",
                    nav_button_previous: "",
                    nav_button_next: "",
                    table: "w-full border-collapse space-y-2",
                    head_row: "flex w-full justify-between mb-3",
                    head_cell: "text-gray-400 rounded-md w-12 font-semibold text-[0.85rem] uppercase",
                    row: "flex w-full mt-2 justify-between",
                    cell: "h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-12 w-12 p-0 font-medium text-base text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors aria-selected:opacity-100 flex items-center justify-center",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white rounded-xl shadow-md font-bold",
                    day_today: "bg-gray-50 text-gray-900",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-300",
                  }}
                />

                {/* LEGEND DITO SA ILALIM NG CALENDAR */}
                <div className="flex justify-center items-center gap-5 mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-600">Fully Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-600">Partially Booked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - TIME CUSTOMIZATION */}
            <div className="p-14 flex flex-col h-full bg-gray-50 justify-center">
              <div className="flex items-center gap-3 mb-10">
                <Clock className="w-7 h-7 text-amber-600" />
                <h3 className="text-3xl font-bold text-gray-900">Set Event Time</h3>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {!date ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-white/50 min-h-[350px]">
                    <CalendarDays className="w-14 h-14 text-gray-300 mb-5" />
                    <p className="text-gray-500 text-center text-lg max-w-[320px] leading-relaxed">
                      Please select a date from the calendar to configure your time.
                    </p>
                    <div className="mt-8 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-5 py-2.5 rounded-full shadow-sm">
                      Note: 1-month advance booking required
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <p className="text-lg font-medium text-gray-600">
                        Selected Date: <span className="text-amber-600 font-bold ml-2">{format(date, "MMMM d, yyyy")}</span>
                      </p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-base font-bold text-gray-700">Start Time</label>
                          <select
                            className="flex h-14 w-full rounded-xl border border-gray-300 bg-white px-5 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-shadow"
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

                        <div className="space-y-3">
                          <label className="text-base font-bold text-gray-700">End Time</label>
                          <select
                            className="flex h-14 w-full rounded-xl border border-gray-300 bg-white px-5 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-shadow"
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

                      <div className="pt-2">
                        {duration <= 0 ? (
                          <div className="flex items-center text-red-600 text-base bg-red-50 p-5 rounded-2xl border border-red-100">
                            <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
                            End time must be after the start time.
                          </div>
                        ) : duration > 6 ? (
                          <div className="flex items-center text-red-600 text-base bg-red-50 p-5 rounded-2xl border border-red-100">
                            <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
                            Maximum booking duration is 6 hours. (Selected: {duration} hrs)
                          </div>
                        ) : (
                          <div className="flex items-center text-green-700 text-base bg-green-50 p-5 rounded-2xl border border-green-100 font-medium">
                            <CheckCircle2 className="w-6 h-6 mr-3 shrink-0 text-green-600" />
                            Valid Duration: {duration} {duration === 1 ? "hour" : "hours"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6">
                <Button 
                  className={`w-full h-16 text-xl font-bold transition-all rounded-2xl ${
                    date && isValidTime 
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-200" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!date || !isValidTime}
                  onClick={() => setStep(2)} 
                >
                  Continue to Details
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BOOKING DETAILS FORM */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] h-full min-h-[700px] animate-in slide-in-from-right-4 fade-in duration-300">
            
            {/* LEFT SIDE - SUMMARY PANEL (ORANGE THEME) */}
            <div className="bg-amber-600 text-white p-14 flex flex-col justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  className="text-amber-50 hover:text-white hover:bg-amber-700 px-4 py-3 rounded-xl mb-12 -ml-4 h-auto w-fit flex items-center transition-colors"
                  onClick={() => setStep(1)} 
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-semibold text-base">Back to Calendar</span>
                </Button>

                <h2 className="text-4xl font-bold mb-12 leading-tight">Booking<br/>Summary</h2>
                
                <div className="space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="bg-amber-500 p-4 rounded-2xl shrink-0 shadow-inner">
                      <CalendarCheck className="w-7 h-7 text-amber-50" />
                    </div>
                    <div>
                      <p className="text-amber-100 text-base font-medium">Selected Date</p>
                      <p className="text-2xl font-bold mt-1.5">{date ? format(date, "MMMM d, yyyy") : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="bg-amber-500 p-4 rounded-2xl shrink-0 shadow-inner">
                      <Clock className="w-7 h-7 text-amber-50" />
                    </div>
                    <div>
                      <p className="text-amber-100 text-base font-medium">Time & Duration</p>
                      <p className="text-2xl font-bold mt-1.5">{getDisplayTime(startTime)} - {getDisplayTime(endTime)}</p>
                      <p className="text-amber-100 text-base mt-2">{duration} {duration === 1 ? "hour" : "hours"} total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="p-14 bg-white flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
                <PartyPopper className="text-amber-600 w-8 h-8" />
                Event Details
              </h3>
              
              <form onSubmit={handleSubmitBooking} className="space-y-7">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-gray-700 font-bold text-base">Full Name *</Label>
                    <Input 
                      id="name" 
                      required 
                      className="h-14 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-amber-600 focus:border-amber-600 rounded-xl" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-gray-700 font-bold text-base">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      required 
                      className="h-14 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-amber-600 focus:border-amber-600 rounded-xl" 
                      placeholder="(0912) 345-6789"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-gray-700 font-bold text-base">Event Type *</Label>
                    <select
                      id="type"
                      required
                      className="flex h-14 text-base w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-shadow"
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

                  <div className="space-y-3">
                    <Label htmlFor="guests" className="text-gray-700 font-bold text-base">Estimated Guests *</Label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                      <Input 
                        id="guests" 
                        type="number" 
                        required 
                        className="h-14 text-base pl-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-amber-600 focus:border-amber-600 rounded-xl" 
                        placeholder="e.g. 150"
                        value={formData.guests}
                        onChange={(e) => setFormData({...formData, guests: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {formData.eventType === "Others" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="otherType" className="text-gray-700 font-bold text-base">Please Specify Event Type *</Label>
                    <Input 
                      id="otherType" 
                      required 
                      className="h-14 text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-amber-600 focus:border-amber-600 rounded-xl" 
                      placeholder="e.g. Reunion, Seminar, etc."
                      value={formData.otherEventType}
                      onChange={(e) => setFormData({...formData, otherEventType: e.target.value})}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-gray-700 font-bold text-base">Special Requests / Notes</Label>
                  <Textarea 
                    id="notes" 
                    className="min-h-[140px] text-base bg-gray-50 border-gray-200 focus:bg-white focus:ring-amber-600 focus:border-amber-600 resize-none rounded-xl p-4" 
                    placeholder="Tell us more about your event layout, catering needs, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full h-16 text-xl font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xl shadow-amber-200">
                    Confirm Reservation
                  </Button>
                </div>
              </form>
            </div>

          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}