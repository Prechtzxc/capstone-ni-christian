"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react"
import { useBookings } from "@/components/booking-context"

export function ReserveDialog({ 
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  selectedVenueId,
  onBackToVenues
}: any) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const onOpenChange = externalOnOpenChange || setInternalOpen

  const { bookings } = useBookings()
  const allBookings = bookings || []

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => null);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  // TOTOONG TIME GAP CALCULATION (Ngayon kasama na ang Pending!)
  const getDayStatus = (day: number) => {
    const dayBookings = allBookings.filter(b => {
      if (!b.date) return false;
      try {
        const bookingDate = new Date(b.date);
        const isSameDate = 
          bookingDate.getFullYear() === year && 
          bookingDate.getMonth() === month && 
          bookingDate.getDate() === day;
        
        // DITO YUNG FIX: Isinama natin ang "pending" para lumabas na yung tuldok!
        const isBooked = ["pending", "approved", "confirmed", "completed"].includes(b.status?.toLowerCase() || "pending");
        
        return isSameDate && isBooked;
      } catch (e) {
        return false;
      }
    });

    if (dayBookings.length === 0) return "available";

    // OPERATING HOURS
    const opStart = 8; // 8:00 AM
    const opEnd = 22;  // 10:00 PM
    const minHoursRequired = 6; // 6 hours block required

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

    // Kung hindi na kayang isingit ang 6 hours, FULLY BOOKED (Red)
    if (maxGap < minHoursRequired) {
      return "full";
    }

    // Kung kaya pa, PARTIALLY BOOKED (Yellow)
    return "partial";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || <Button>Book Now</Button>}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* LEFT PANEL: CALENDAR SELECTION */}
          <div className="flex-1 p-8 md:p-12 relative bg-white">
            {onBackToVenues && (
              <button 
                className="text-sm font-bold text-gray-400 hover:text-gray-800 flex items-center gap-2 mb-8 transition-colors" 
                onClick={onBackToVenues}
              >
                <ChevronLeft className="w-4 h-4" /> Back to Venues
              </button>
            )}
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reserve Your Date</h2>
              <p className="text-gray-500 mt-2">Select your preferred date to begin.</p>
            </div>

            {/* THE CALENDAR CARD */}
            <div className="max-w-sm mx-auto bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative">
              
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600"/>
                </button>
                <h3 className="font-bold text-lg text-gray-900">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600"/>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-6">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                ))}
                
                {/* Empty slots */}
                {emptySlots.map((_, i) => <div key={`empty-${i}`} />)}
                
                {/* Actual Days */}
                {days.map(day => {
                  const status = getDayStatus(day);
                  const isSelected = selectedDate === day;
                  
                  return (
                    <div key={day} className="flex justify-center relative">
                      <button
                        disabled={status === 'full'}
                        onClick={() => setSelectedDate(day)}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all
                          ${status === 'full' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700'}
                          ${isSelected ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md scale-110' : ''}
                        `}
                      >
                        {day}
                      </button>
                      
                      {/* DOT INDICATORS */}
                      {status === 'full' && <div className="absolute bottom-[-2px] w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                      {status === 'partial' && <div className="absolute bottom-[-2px] w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    </div>
                  )
                })}
              </div>

              {/* LEGEND */}
              <div className="flex justify-center items-center gap-6 pt-5 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"/>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fully Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"/>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Partially Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: TIME SELECTION */}
          <div className="w-full md:w-[400px] bg-slate-50/50 p-8 md:p-12 border-l border-gray-100 flex flex-col shrink-0">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set Event Time</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {!selectedDate ? (
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center bg-white">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium mb-6 leading-relaxed">
                    Please select a date from the calendar to configure your time.
                  </p>
                  <div className="px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-xs font-bold text-amber-600">Note: 6-hour continuous slot required</span>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-3xl p-6 bg-white shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <h3 className="font-bold text-lg border-b border-gray-50 pb-4 text-slate-800">
                    {currentDate.toLocaleString('default', { month: 'long' })} {selectedDate}, {year}
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors h-12">
                      08:00 AM - 02:00 PM (Morning)
                    </Button>
                    <Button variant="outline" className="w-full justify-start font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors h-12">
                      04:00 PM - 10:00 PM (Evening)
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <Button 
                size="lg" 
                className={`w-full rounded-2xl h-14 font-bold text-base transition-all ${
                  selectedDate 
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md" 
                  : "bg-gray-100 text-gray-400"
                }`}
                disabled={!selectedDate}
              >
                Continue to Details <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}