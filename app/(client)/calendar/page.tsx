"use client"

import { useState, useMemo } from "react"
import { PublicLayout } from "@/components/public-layout"
import { Calendar } from "@shared/components/ui/calendar"
import { Card, CardContent } from "@shared/components/ui/card"
import { useBookings } from "@/components/booking-context"
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react"

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

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { bookings } = useBookings()

  const nextMonthStart = useMemo(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth() + 1, 1)
  }, [])

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

  const availableSlots = useMemo(() => {
    if (!date) return ALL_TIME_SLOTS.map(time => ({ time, isAvailable: true }))
    
    const dateStr = date.toDateString()
    const activeBookings = bookings.filter(b => b.status !== "cancelled" && b.date === dateStr)

    return ALL_TIME_SLOTS.map(slot => {
      const slotNum = timeToNumber(slot)
      let isAvailable = true
      for (const booking of activeBookings) {
        if (slotNum >= timeToNumber(booking.startTime) && slotNum <= timeToNumber(booking.endTime)) {
          isAvailable = false
        }
      }
      return { time: slot, isAvailable }
    })
  }, [date, bookings])

  return (
    <PublicLayout>
      <div className="bg-gray-900 py-16 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Availability Calendar</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Browse our calendar to find the perfect open date for your event. Red dates are fully booked.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < nextMonthStart}
              modifiers={{ booked: fullyBookedDates }}
              modifiersClassNames={{ booked: "bg-red-500 text-white font-bold hover:bg-red-600 hover:text-white" }}
              className="scale-125 origin-top md:scale-150 transform transition-transform mb-12 md:mb-20"
            />
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mt-auto bg-gray-50 px-6 py-3 rounded-full">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full bg-red-500"></div> Fully Booked
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300"></div> Available
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-slate-50 border-gray-200 shadow-sm h-full min-h-[400px]">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 border-b pb-4">
                  <CalendarIcon className="text-amber-700 w-6 h-6" />
                  {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a Date"}
                </h3>

                {date ? (
                  <div className="space-y-6 animate-in fade-in">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hourly Availability Details</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {availableSlots.map((slot, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                            slot.isAvailable 
                              ? "bg-white border-green-200 text-gray-800 shadow-sm" 
                              : "bg-gray-100/80 border-gray-200 text-gray-400 opacity-60"
                          }`}
                        >
                          {slot.isAvailable ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-semibold">{slot.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a date to view available time slots.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PublicLayout>
  )
}