"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, Users, MoveHorizontal } from "lucide-react"
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
        <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden border-none bg-black text-white shadow-2xl select-none">
          
          <DialogTitle className="sr-only">Virtual Tour and Venue Selection</DialogTitle>
          <DialogDescription className="sr-only">Take a 360 virtual tour of our venues and select one to book.</DialogDescription>

          <div className="relative h-[600px] w-full bg-slate-900 overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute top-6 left-6 pr-[350px] pointer-events-none">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Virtual Tour - {activeVenueData.name}</h2>
              <p className="text-sm text-gray-200 mt-1 drop-shadow-md">{activeVenueData.description}</p>
            </div>
            <div className="absolute top-6 right-12 flex items-center gap-2 pointer-events-none">
              <Badge className="bg-white/20 text-white backdrop-blur-md border border-white/30">
                360° Panoramic View
              </Badge>
              <Badge className="bg-amber-600 text-white border-0 shadow-sm">
                <Users className="w-3 h-3 mr-1" /> Up to {activeVenueData.capacity} guests
              </Badge>
              <Badge className="bg-green-600 text-white border-0 shadow-sm">
                {activeVenueData.price}
              </Badge>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium tracking-wide flex items-center gap-2 drop-shadow-md pointer-events-none">
              <MoveHorizontal className="w-4 h-4" />
              Drag to explore • Auto-rotating
            </div>
            <div 
              className="absolute right-6 top-20 bottom-8 w-[340px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-900 border border-gray-100"
              onMouseDown={(e) => e.stopPropagation()} 
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b font-semibold flex items-center gap-2 bg-gray-50/50">
                <Calendar className="w-4 h-4 text-amber-600" /> Tour Areas
              </div>
              <Tabs className="flex-1 flex flex-col overflow-hidden" defaultValue="events">
                <div className="p-3 pb-0">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="events">Event Venues</TabsTrigger>
                    <TabsTrigger value="offices">Office Spaces</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent className="flex-1 overflow-y-auto p-3 space-y-2 m-0 custom-scrollbar" value="events">
                  {eventVenues.map((venue) => (
                    <div 
                      key={venue.id} 
                      onClick={() => setSelectedVenue(venue.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedVenue === venue.id 
                          ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' 
                          : 'border-gray-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-amber-700' : 'text-gray-900'}`}>
                        {venue.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                        </span>
                        <span className="text-green-600 font-medium">{venue.price}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent className="flex-1 overflow-y-auto p-3 space-y-2 m-0 custom-scrollbar" value="offices">
                  {officeSpaces.map((venue) => (
                    <div 
                      key={venue.id} 
                      onClick={() => setSelectedVenue(venue.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedVenue === venue.id 
                          ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' 
                          : 'border-gray-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-amber-700' : 'text-gray-900'}`}>
                        {venue.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                        </span>
                        <span className="text-green-600 font-medium">{venue.price}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 z-10 relative">
            <div>
              <p className="text-sm text-gray-600 mb-2">Experience our venue with panoramic views from different angles</p>
              <div className="flex flex-wrap gap-2">
                {activeVenueData.amenities.map(amenity => (
                  <Badge className="text-gray-600 font-normal rounded-full bg-gray-50" key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button onClick={() => setShowVenueModal(false)} variant="outline">
                Close Tour
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleProceedToBooking}>
                Book Now
              </Button>
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