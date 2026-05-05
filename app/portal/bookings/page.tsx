"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, Users, MoveHorizontal, X } from "lucide-react"
import { ReserveDialog } from "@/components/reserve-dialog"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const eventVenues = [
  { id: "v1", name: "Conference Hall", capacity: 80, price: "₱300.00/hr", image: "/images/venue-interior.jpg", description: "Experience our Conference Hall with panoramic views.", amenities: ["Projector", "Sound System", "AC"] },
  { id: "v2", name: "Garden Pavilion", capacity: 100, price: "₱350.00/hr", image: "/images/venue-chandelier.png", description: "Beautiful outdoor pavilion for your events.", amenities: ["Outdoor", "Lighting", "Catering Area"] },
  { id: "v3", name: "Grand Ballroom", capacity: 200, price: "₱500.00/hr", image: "/images/venue-interior.jpg", description: "Spacious ballroom for grand celebrations.", amenities: ["AC", "Stage", "Dance Floor"] },
  { id: "v4", name: "Rooftop Terrace", capacity: 120, price: "₱450.00/hr", image: "/images/venue-chandelier.png", description: "Stunning city views from our rooftop.", amenities: ["Outdoor", "Bar Area", "Lounge"] },
  { id: "v5", name: "The Milestone Event Place", capacity: 80, price: "₱400.00/hr", image: "/images/venue-interior.jpg", description: "Perfect for milestones and intimate gatherings.", amenities: ["AC", "Sound System", "Decorations"] },
]

const officeSpaces = [
  { id: "o1", name: "Private Office A", capacity: 5, price: "₱150.00/hr", image: "/images/venue-interior.jpg", description: "Quiet and private space for focused work.", amenities: ["AC", "High-speed WiFi", "Whiteboard"] },
  { id: "o2", name: "Co-working Space", capacity: 20, price: "₱200.00/hr", image: "/images/venue-chandelier.png", description: "Collaborative environment with great lighting.", amenities: ["AC", "Shared Pantry", "WiFi"] },
]

export default function BookingsPage() {
  const { user } = useAuth()
  const { getUserBookings } = useBookings()
  
  const [showVenueModal, setShowVenueModal] = useState(false)
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<string>("v5")

  const [bgPos, setBgPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)

  if (!user) return null

  const myBookings = getUserBookings(user.id)
  const activeVenueData = [...eventVenues, ...officeSpaces].find(v => v.id === selectedVenue) || eventVenues[4]

  useEffect(() => {
    if (isDragging || !showVenueModal) return
    const animation = setInterval(() => {
      setBgPosition((prev) => prev - 0.5) 
    }, 20)
    return () => clearInterval(animation)
  }, [isDragging, showVenueModal])

  const onDragStart = (clientX: number) => {
    setIsDragging(true)
    dragStart.current = clientX - bgPos
  }

  const onDragMove = (clientX: number) => {
    if (!isDragging) return
    setBgPosition(clientX - dragStart.current)
  }

  const onDragEnd = () => {
    setIsDragging(false)
  }

  const handleProceedToBooking = () => {
    setShowVenueModal(false)
    setTimeout(() => {
      setShowReserveModal(true)
    }, 300)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">View and track the status of all your event reservations.</p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Reservation History</CardTitle>
          <CardDescription>A complete list of your past and upcoming events.</CardDescription>
        </CardHeader>
        <CardContent>
          {myBookings.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-sm">
                You don't have any event reservations yet. Click the button below to get started.
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700 shadow-sm text-white" onClick={() => setShowVenueModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full hidden sm:flex bg-amber-50">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {booking.eventName || "Event Reservation"}
                      </h4>
                      <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Date: {booking.date}
                        </span>
                        {booking.time && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Time: {booking.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
                    <Badge 
                      variant={booking.status === "confirmed" ? "default" : booking.status === "pending" ? "secondary" : "destructive"} 
                      className="mt-1 capitalize"
                    >
                      {booking.status || "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="pt-6 flex justify-center border-t border-gray-100 mt-6">
                <Button className="bg-amber-600 hover:bg-amber-700 shadow-sm text-white" onClick={() => setShowVenueModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Another Event
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showVenueModal} onOpenChange={setShowVenueModal}>
        {/* ========================================================== */}
        {/* FIX: Added !max-w-[1200px] to force the modal to be wide   */}
        {/* Added [&>button]:hidden to remove shadcn's default X mark */}
        {/* ========================================================== */}
        <DialogContent className="!max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 border-0 bg-black [&>button]:hidden shadow-2xl">
          
          <DialogTitle className="sr-only">Virtual Tour and Venue Selection</DialogTitle>
          <DialogDescription className="sr-only">Take a 360 virtual tour of our venues and select one to book.</DialogDescription>

          {/* ========================================== */}
          {/* LEFT COLUMN: 360 Panoramic View            */}
          {/* ========================================== */}
          <div className="relative flex-1 bg-slate-900 overflow-hidden flex flex-col h-[50vh] md:h-auto">
            {/* Top Overlays */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-none flex justify-between items-start">
              <div className="text-white pr-4">
                <h2 className="text-2xl md:text-3xl font-bold drop-shadow-md">Virtual Tour - {activeVenueData.name}</h2>
                <p className="text-sm md:text-base opacity-90 mt-1 max-w-xl drop-shadow-md">{activeVenueData.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge className="bg-white/20 text-white backdrop-blur-md border border-white/30 hidden md:inline-flex px-3 py-1">
                  360° Panoramic View
                </Badge>
                <Badge className="bg-amber-600 text-white border-0 shadow-sm px-3 py-1">
                  <Users className="w-3 h-3 mr-1" /> Up to {activeVenueData.capacity}
                </Badge>
                <Badge className="bg-green-600 text-white border-0 shadow-sm px-3 py-1">
                  {activeVenueData.price}
                </Badge>
              </div>
            </div>

            {/* Panoramic View Container */}
            <div 
              className={`absolute inset-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={(e) => onDragStart(e.clientX)}
              onMouseMove={(e) => onDragMove(e.clientX)}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
              onTouchEnd={onDragEnd}
              style={{
                backgroundImage: `url('${activeVenueData.image}')`,
                backgroundSize: 'auto 100%',
                backgroundPositionX: `${bgPos}px`,
                backgroundRepeat: 'repeat-x', 
              }}
            />

            {/* Navigation Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs md:text-sm z-20 pointer-events-none whitespace-nowrap shadow-lg">
              <div className="flex items-center space-x-2">
                <MoveHorizontal className="w-4 h-4" />
                <span>Drag to explore • Auto-rotating</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: Tour Areas & Action Buttons  */}
          {/* ========================================== */}
          <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden">
            
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                Tour Areas
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowVenueModal(false)}
                className="text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8 p-0 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs List */}
            <Tabs className="flex-1 flex flex-col overflow-hidden" defaultValue="events">
              <div className="p-4 pb-0 bg-white">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="events">Event Venues</TabsTrigger>
                  <TabsTrigger value="offices">Office Spaces</TabsTrigger>
                </TabsList>
              </div>

              {/* Event Venues Content */}
              <TabsContent className="flex-1 overflow-y-auto p-4 space-y-3 m-0 custom-scrollbar" value="events">
                {eventVenues.map((venue) => (
                  <div 
                    key={venue.id} 
                    onClick={() => setSelectedVenue(venue.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedVenue === venue.id 
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600 shadow-sm' 
                        : 'border-gray-200 hover:border-amber-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-amber-700' : 'text-gray-900'}`}>
                          {venue.name}
                        </h4>
                        <div className="text-xs mt-1 flex items-center text-gray-500">
                          <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium text-xs block">{venue.price}</span>
                        {selectedVenue === venue.id && (
                          <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse mt-2 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Office Spaces Content */}
              <TabsContent className="flex-1 overflow-y-auto p-4 space-y-3 m-0 custom-scrollbar" value="offices">
                {officeSpaces.map((venue) => (
                  <div 
                    key={venue.id} 
                    onClick={() => setSelectedVenue(venue.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedVenue === venue.id 
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600 shadow-sm' 
                        : 'border-gray-200 hover:border-amber-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-amber-700' : 'text-gray-900'}`}>
                          {venue.name}
                        </h4>
                        <div className="text-xs mt-1 flex items-center text-gray-500">
                          <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium text-xs block">{venue.price}</span>
                        {selectedVenue === venue.id && (
                          <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse mt-2 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {/* Bottom Footer: Amenities & Buttons */}
            <div className="p-5 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Amenities included:</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeVenueData.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVenueModal(false)}
                  className="flex-1 py-6 rounded-xl border-gray-300 font-medium hover:bg-gray-50 text-slate-700"
                >
                  Close Tour
                </Button>
                <Button 
                  onClick={handleProceedToBooking}
                  className="flex-1 py-6 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-medium shadow-md"
                >
                  Book Now
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <ReserveDialog 
        open={showReserveModal} 
        onOpenChange={setShowReserveModal} 
        selectedVenueId={selectedVenue}
        onBackToVenues={() => {
          setShowReserveModal(false);
          setTimeout(() => {
            setShowVenueModal(true);
          }, 300);
        }}
      />
      
    </div>
  )
}