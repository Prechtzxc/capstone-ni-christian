"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Calendar } from "@shared/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react"

const ALL_TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
]

function timeToNumber(timeStr: string) {
  if (!timeStr) return 0
  const [time, modifier] = timeStr.split(" ")
  let [hours, minutes] = time.split(":").map(Number)
  if (modifier === "PM" && hours !== 12) hours += 12
  if (modifier === "AM" && hours === 12) hours = 0
  return hours + (minutes / 60)
}

export function ReserveDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { bookings, addBooking } = useBookings()
  
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  
  // New state variables for the dropdown
  const [eventType, setEventType] = useState("")
  const [customEventName, setCustomEventName] = useState("")
  const [guests, setGuests] = useState("")

  // Calculate the first day of the NEXT month for the "1 month advance" rule
  const nextMonthStart = useMemo(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth() + 1, 1)
  }, [])

  // Calculate fully booked dates based ONLY on confirmed bookings
  const fullyBookedDates = useMemo(() => {
    const bookedMap = new Map<string, number>()
    const confirmedBookings = bookings.filter(b => b.status === "confirmed")
    
    confirmedBookings.forEach(b => {
       const duration = timeToNumber(b.endTime) - timeToNumber(b.startTime)
       bookedMap.set(b.date, (bookedMap.get(b.date) || 0) + duration)
    })

    const fullDates: Date[] = []
    bookedMap.forEach((totalHours, dateStr) => {
       if (totalHours >= 10) {
         fullDates.push(new Date(dateStr))
       }
    })
    return fullDates
  }, [bookings])

  // Filter overlapping time slots for the selected day
  const availableSlots = useMemo(() => {
    if (!date) return ALL_TIME_SLOTS

    const dateStr = date.toDateString()
    const activeBookings = bookings.filter(b => b.status !== "cancelled" && b.date === dateStr)

    return ALL_TIME_SLOTS.filter(slot => {
      const slotNum = timeToNumber(slot)
      for (const booking of activeBookings) {
        const startNum = timeToNumber(booking.startTime)
        const endNum = timeToNumber(booking.endTime)
        if (slotNum >= startNum && slotNum <= endNum) {
          return false
        }
      }
      return true
    })
  }, [date, bookings])

  const handleNext = () => {
    if (!date || !startTime || !endTime) {
      toast({ title: "Incomplete", description: "Please select a date, start time, and end time.", variant: "destructive" })
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    // Resolve the final event name based on dropdown selection
    const finalEventName = eventType === "Other" ? customEventName : eventType

    if (!user) {
      toast({ title: "Error", description: "You must be logged in to book.", variant: "destructive" })
      return
    }
    if (!finalEventName || !guests) {
      toast({ title: "Incomplete", description: "Please fill in all event details.", variant: "destructive" })
      return
    }

    try {
      await addBooking({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventName: finalEventName,
        date: date!.toDateString(),
        startTime: startTime,
        endTime: endTime,
        guests: parseInt(guests) || 0,
      })
      
      toast({ title: "Success!", description: "Your booking request has been submitted." })
      
      // Reset all states
      setStep(1)
      setDate(undefined)
      setStartTime("")
      setEndTime("")
      setEventType("")
      setCustomEventName("")
      setGuests("")
      onOpenChange(false)
      
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit booking.", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) setStep(1)
    }}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] w-[95vw] p-0 overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row h-full min-h-[600px] max-h-[85vh]">
          
          <div className="bg-slate-50 border-r border-gray-200 p-6 md:w-[45%] flex flex-col overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900">Reserve Your Date</DialogTitle>
              <DialogDescription>Select your preferred date and time to begin.</DialogDescription>
            </DialogHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setStartTime("")
                  setEndTime("")
                }}
                disabled={(d) => d < nextMonthStart}
                modifiers={{ booked: fullyBookedDates }}
                modifiersClassNames={{ booked: "bg-red-500 text-white font-bold hover:bg-red-600 hover:text-white" }}
                className="scale-110 origin-top p-3"
              />
            </div>

            {date && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-auto">
                <p className="font-medium text-blue-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          <div className="p-8 md:w-[55%] overflow-y-auto bg-white flex flex-col">
            {step === 1 ? (
              <div className="space-y-8 flex-1 flex flex-col">
                <h3 className="font-semibold text-xl flex items-center gap-2 border-b pb-4">
                  <Clock className="w-5 h-5 text-amber-700" /> Select Time Slots
                </h3>
                
                {!date ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-base border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 p-6 text-center">
                    Please select a date from the calendar to view available slots. Note: We require 1-month advance booking.
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-red-500 text-base border-2 border-dashed border-red-100 rounded-lg bg-red-50 p-6 text-center">
                    <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                    This date is fully booked. Please select another date.
                  </div>
                ) : (
                  <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-gray-600 font-semibold">Start Time</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                        {availableSlots.map(slot => (
                          <Button
                            key={`start-${slot}`}
                            variant={startTime === slot ? "default" : "outline"}
                            className={startTime === slot ? "bg-amber-700 hover:bg-amber-800" : "hover:border-amber-700 hover:text-amber-700"}
                            onClick={() => {
                              setStartTime(slot)
                              if (timeToNumber(endTime) <= timeToNumber(slot)) setEndTime("")
                            }}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {startTime && (
                      <div className="space-y-3 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
                        <Label className="text-gray-600 font-semibold">End Time</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {availableSlots
                            .filter(slot => timeToNumber(slot) > timeToNumber(startTime))
                            .map(slot => (
                              <Button
                                key={`end-${slot}`}
                                variant={endTime === slot ? "default" : "outline"}
                                className={endTime === slot ? "bg-amber-700 hover:bg-amber-800" : "hover:border-amber-700 hover:text-amber-700"}
                                onClick={() => setEndTime(slot)}
                              >
                                {slot}
                              </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 mt-auto">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-semibold" 
                    onClick={handleNext}
                    disabled={!date || !startTime || !endTime}
                  >
                    Continue to Details <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col animate-in slide-in-from-right-4">
                <h3 className="font-semibold text-xl border-b pb-4">Event Details</h3>
                <div className="space-y-6 flex-1">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-2">
                    <p className="text-sm text-amber-800 font-medium">Booking Summary:</p>
                    <p className="text-sm text-amber-900">{date?.toDateString()} from {startTime} to {endTime}</p>
                  </div>

                  {/* UPDATED: Event Type Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Wedding">Wedding</SelectItem>
                        <SelectItem value="Birthday">Birthday</SelectItem>
                        <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                        <SelectItem value="Christening">Christening</SelectItem>
                        <SelectItem value="Reunion">Reunion</SelectItem>
                        <SelectItem value="Other">Other (Please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Input if 'Other' is selected */}
                  {eventType === "Other" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-gray-600 font-semibold">Specific Event Name</Label>
                      <Input 
                        placeholder="e.g. Anniversary Party" 
                        className="h-12" 
                        value={customEventName}
                        onChange={(e) => setCustomEventName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Expected Guest Count</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 150" 
                      className="h-12" 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-6 flex gap-4 mt-auto border-t border-gray-100">
                  <Button variant="outline" className="flex-1 h-14 text-lg" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 h-14 text-lg bg-amber-700 hover:bg-amber-800" onClick={handleSubmit}>Submit Request</Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}