"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  MoveHorizontal, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Star, 
  Edit2, 
  XCircle, 
  Ticket, 
  CheckCircle2,
  Search,
  History as HistoryIcon,
  QrCode
} from "lucide-react"

import { ReserveDialog } from "@/components/reserve-dialog"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const dummyEventVenues = [
  { id: "v1", name: "Conference Hall", capacity: 80, price: "₱300.00/hr", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400", description: "Experience our Conference Hall with panoramic views.", amenities: ["Projector", "Sound System", "AC"], category: "event" },
  { id: "v2", name: "Garden Pavilion", capacity: 100, price: "₱350.00/hr", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400", description: "Beautiful outdoor pavilion for your events.", amenities: ["Outdoor", "Lighting", "Catering Area"], category: "event" },
  { id: "v3", name: "Grand Ballroom", capacity: 200, price: "₱500.00/hr", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400", description: "Spacious ballroom for grand celebrations.", amenities: ["AC", "Stage", "Dance Floor"], category: "event" },
  { id: "v4", name: "Rooftop Terrace", capacity: 120, price: "₱450.00/hr", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400", description: "Stunning city views from our rooftop.", amenities: ["Outdoor", "Bar Area", "Lounge"], category: "event" },
]

const dummyOfficeSpaces = [
  { id: "o1", name: "Private Office A", capacity: 5, price: "₱150.00/hr", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400", description: "Quiet and private space for focused work.", amenities: ["AC", "High-speed WiFi", "Whiteboard"], category: "office" },
  { id: "o2", name: "Co-working Space", capacity: 20, price: "₱200.00/hr", image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=1400", description: "Collaborative environment with great lighting.", amenities: ["AC", "Shared Pantry", "WiFi"], category: "office" },
]

const initialReviews = [
  { id: 1, venueId: "v1", user: "Maria Clara", rating: 5, date: "May 2, 2026", comment: "Super ganda ng Conference Hall! Malamig ang AC at napakalinaw ng projector. Perfect para sa seminar namin!" },
]

const mockDemonstrationBookings = [
  { id: "demo1", eventName: "Morning Corporate Seminar", venue: "Conference Hall", date: "June 7, 2026", time: "08:00 AM - 10:00 AM", status: "approved" },
  { id: "demo2", eventName: "Midday Workshop", venue: "Conference Hall", date: "June 12, 2026", time: "11:00 AM - 05:00 PM", status: "approved" },
]

export default function BookingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const { bookings, getUserBookings } = useBookings()
  
  const [venues, setVenues] = useState<any[]>([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(true)

  const [showVenueModal, setShowVenueModal] = useState(false)
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<any>(null)

  const [selectedVenue, setSelectedVenue] = useState<string>("v1")
  
  const [filterVenue, setFilterVenue] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("pending") 
  const [searchQuery, setSearchQuery] = useState("")

  const [reviewsList, setReviewsList] = useState(initialReviews)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [bookingToReview, setBookingToReview] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [showReviewsPanel, setShowReviewsPanel] = useState(false)
  const [reviewedBookings, setReviewedBookings] = useState<string[]>([])

  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketData, setTicketData] = useState<any>(null)

  const [bgPos, setBgPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)

  // MOCK STATE PARA PUMASOK SA LIST YUNG TINEST MONG BOOKING LOCALLY
  const [localBookings, setLocalBookings] = useState<any[]>([])

  const allBookings = [...(bookings || []), ...mockDemonstrationBookings, ...localBookings]

  if (!user) return null

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoadingVenues(true)
        setTimeout(() => {
          const allDummyVenues = [...dummyEventVenues, ...dummyOfficeSpaces]
          setVenues(allDummyVenues)
          setIsLoadingVenues(false)
        }, 800)
      } catch (error) {
        console.error("Error fetching venues:", error)
        setIsLoadingVenues(false)
      }
    }
    fetchVenues()
  }, [])

  const eventVenuesList = venues.filter(v => v.category === "event")
  const officeSpacesList = venues.filter(v => v.category === "office")
  const activeVenueData = venues.find(v => v.id === selectedVenue) || venues[0]

  useEffect(() => {
    if (isDragging || !showVenueModal || !activeVenueData) return
    const animation = setInterval(() => {
      setBgPosition((prev) => prev - 0.5) 
    }, 20)
    return () => clearInterval(animation)
  }, [isDragging, showVenueModal, activeVenueData])

  const onDragStart = (clientX: number) => {
    setIsDragging(true)
    dragStart.current = clientX - bgPos
  }
  const onDragMove = (clientX: number) => {
    if (!isDragging) return
    setBgPosition(clientX - dragStart.current)
  }
  const onDragEnd = () => setIsDragging(false)

  const handleProceedToNewBooking = () => {
    setShowVenueModal(false)
    setTimeout(() => setShowReserveModal(true), 300)
  }

  // --- ETO YUNG MAGLALAGAY SA PENDING TAB MO KAPAG NAG-SUBMIT KA SA MODAL ---
  const handleBookingSubmit = (newBooking: any) => {
    const matchedVenue = venues.find(v => v.id === newBooking.venueId) || venues[0];
    const completeBooking = {
      ...newBooking,
      venue: matchedVenue.name,
      venueName: matchedVenue.name
    };

    if (editingBooking) {
      setLocalBookings(prev => {
        const exists = prev.find(b => b.id === completeBooking.id);
        if (exists) {
          return prev.map(b => b.id === completeBooking.id ? completeBooking : b);
        }
        return [completeBooking, ...prev];
      })
    } else {
      setLocalBookings(prev => [completeBooking, ...prev])
    }
    
    // I-focus agad sa Pending tab para makita mo
    setActiveTab("pending") 
  }

  // --- ETO YUNG BINAGO: PAG MODIFY PUMUPUNTA MUNA SA VIRTUAL TOUR ---
  const handleModify = (booking: any) => {
    if (booking.status?.toLowerCase() !== 'pending') {
      toast({ title: "Action Denied", description: "Only pending bookings can be modified.", variant: "destructive" })
      return
    }
    setEditingBooking(booking)

    // Hanapin yung venue ID ng ineedit mong booking para yon ang bumukas sa Tour
    const matchedVenue = venues.find(v => v.name.toLowerCase() === (booking.venue || booking.venueName || "").toLowerCase())
    if (matchedVenue) {
       setSelectedVenue(matchedVenue.id)
    }

    setShowReserveModal(false)
    setShowVenueModal(true) // BUBUKSAN YUNG VIRTUAL TOUR!
  }

  const handleCancel = (id: string) => {
    toast({ 
      title: "Booking Cancelled", 
      description: "Your pending reservation request has been cancelled.",
      variant: "destructive"
    })
  }

  const handleViewTicket = (booking: any) => {
    setTicketData(booking);
    setShowTicketModal(true);
  }

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      toast({ title: "Oops!", description: "Please write a comment before submitting.", variant: "destructive" })
      return;
    }
    const matchedVenue = venues.find(v => v.name.toLowerCase() === (bookingToReview?.venue || bookingToReview?.venueName || "Conference Hall").toLowerCase()) || venues[0];
    const newReview = {
      id: Date.now(),
      venueId: matchedVenue.id,
      user: user?.name || "Verified Client",
      rating: rating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      comment: comment
    }
    setReviewsList([newReview, ...reviewsList])
    if (bookingToReview?.id) setReviewedBookings([...reviewedBookings, bookingToReview.id])
    
    setShowReviewModal(false)
    setComment("")
    setRating(5)
    toast({ title: "Review Submitted!", description: "Thank you for sharing your experience." })
  }

  const getVenueRating = (vId: string) => {
    const revs = reviewsList.filter(r => r.venueId === vId);
    if (revs.length === 0) return { avg: "0", count: 0 };
    const avg = (revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1);
    return { avg, count: revs.length };
  }

  const checkVenueMatch = (b: any, selected: string) => {
    if (selected === "all") return true;
    const uiVenue = b.venue || b.venueName || "Conference Hall";
    return uiVenue.toLowerCase().includes(selected.toLowerCase());
  }

  const myFilteredBookings = allBookings.filter(b => {
    const matchVenue = checkVenueMatch(b, filterVenue);
    const status = b.status?.toLowerCase() || "pending";
    let matchStatus = false;
    
    if (activeTab === "approved") {
      matchStatus = (status === "confirmed" || status === "approved");
    } else {
      matchStatus = status === activeTab;
    }

    const matchSearch = (b.eventName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchVenue && matchStatus && matchSearch;
  })

  const activeVenueReviews = reviewsList.filter(r => r.venueId === activeVenueData?.id);
  const activeAvgRating = activeVenueReviews.length > 0 
    ? (activeVenueReviews.reduce((sum, r) => sum + r.rating, 0) / activeVenueReviews.length).toFixed(1) 
    : "0";

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">View and track the status of all your event reservations.</p>
        </div>
        <Button 
          className="bg-[#f97316] hover:bg-[#ea580c] shadow-md text-white shrink-0 font-bold px-6 h-12 rounded-xl transition-transform active:scale-95" 
          onClick={() => {
            setEditingBooking(null); // RESET KAPAG NEW BOOKING
            setShowVenueModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Book Another Event
        </Button>
      </div>

      {/* FULL WIDTH MAIN PANEL */}
      <div className="w-full">
        <Card className="border-gray-200 shadow-sm w-full">
          
          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 pb-5 bg-white rounded-t-xl">
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Reservation History</h3>
                <p className="text-sm text-slate-500 truncate">Your past, pending, and upcoming events.</p>
              </div>

              <div className="flex flex-row items-center gap-3 w-full xl:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                <Select value={filterVenue} onValueChange={setFilterVenue}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-slate-50 border-gray-200 font-medium text-slate-700 h-11 rounded-xl">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-[#f97316] shrink-0" />
                      <span className="text-gray-500 font-normal hidden sm:inline">Venue:</span>
                      <SelectValue placeholder="All Venues" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    {venues.map(v => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative w-full sm:w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search event..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-50 border-gray-200 w-full font-medium rounded-xl h-11" 
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto min-w-0 mt-2">
              {["Pending", "Approved", "Completed", "Declined"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 min-w-[80px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap text-center ${
                    activeTab === tab.toLowerCase() 
                    ? "bg-white text-[#f97316] shadow-sm ring-1 ring-[#f97316]/20" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <CardContent className="p-6">
            {myFilteredBookings.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <HistoryIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">No records found</h3>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery 
                    ? `No results found for "${searchQuery}".` 
                    : `You don't have any ${activeTab} reservations for ${filterVenue === "all" ? "any venue" : filterVenue}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myFilteredBookings.map((booking) => {
                  const currentStatus = booking.status?.toLowerCase() || "pending";
                  return (
                    <div key={booking.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white gap-4 group">
                      
                      <div className="flex items-start space-x-4 min-w-0">
                        <div className={`p-3 rounded-full hidden sm:flex shrink-0 ${currentStatus === 'pending' ? 'bg-orange-50 text-[#f97316]' : 'bg-blue-50 text-blue-500'}`}>
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-slate-900 text-lg truncate">
                              {booking.eventName || "Event Booking"}
                            </h4>
                            {currentStatus === 'pending' && (
                              <Badge className="bg-orange-100 text-[#ea580c] hover:bg-orange-100 border-none px-2 py-0.5 text-[10px] uppercase tracking-widest">Pending</Badge>
                            )}
                            {(currentStatus === 'approved' || currentStatus === 'confirmed') && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10px] uppercase tracking-widest">Approved</Badge>
                            )}
                            {currentStatus === 'completed' && (
                              <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0.5 text-[10px] uppercase tracking-widest">Completed</Badge>
                            )}
                            {currentStatus === 'declined' && (
                              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 py-0.5 text-[10px] uppercase tracking-widest">Declined</Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 text-sm text-gray-600 font-medium">
                            <span className="flex items-center text-[#ea580c] bg-orange-50 px-2 py-1 rounded-md shrink-0">
                              <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" /> 
                              <span className="truncate">{booking.venue || booking.venueName || "Conference Hall"}</span>
                            </span>
                            <span className="flex items-center shrink-0 text-slate-500">
                              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {booking.date}
                            </span>
                            {booking.time && (
                              <span className="flex items-center shrink-0 text-slate-500">
                                <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> {booking.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-start lg:justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                        {currentStatus === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleModify(booking)} 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg px-4 h-9 font-bold transition-colors"
                            >
                              <Edit2 className="w-4 h-4 mr-1.5" /> Modify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCancel(booking.id)} 
                              className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-lg px-4 h-9 font-bold transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-1.5" /> Cancel
                            </Button>
                          </>
                        )}

                        {currentStatus === 'completed' && (
                          reviewedBookings.includes(booking.id) ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none px-4 py-1.5 text-sm rounded-lg">
                              Completed
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm h-9 px-4 font-bold rounded-lg transition-transform hover:scale-105"
                              onClick={() => {
                                setBookingToReview(booking);
                                setShowReviewModal(true);
                              }}
                            >
                              <Star className="w-4 h-4 mr-1.5 fill-white text-white" /> Rate & Review
                            </Button>
                          )
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

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[450px] p-6 bg-white rounded-2xl border-none shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rate your experience</h2>
            <p className="text-slate-500 text-sm mt-1">How was your event at <span className="font-bold text-slate-800">{bookingToReview?.venue || bookingToReview?.venueName || "our venue"}</span>?</p>
          </div>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className="transform transition-transform hover:scale-110 focus:outline-none"
              >
                <Star className={`w-10 h-10 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Share your feedback</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What can we improve?" 
                className="w-full flex min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition-all resize-none"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowReviewModal(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSubmitReview}>Submit Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIRTUAL TOUR MODAL */}
      <Dialog open={showVenueModal} onOpenChange={(val) => {
        setShowVenueModal(val)
        if(!val) setShowReviewsPanel(false)
      }}>
        <DialogContent className="!max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 border-0 bg-black [&>button]:hidden shadow-2xl">
          
          <DialogTitle className="sr-only">Virtual Tour and Venue Selection</DialogTitle>
          <DialogDescription className="sr-only">Take a 360 virtual tour of our venues and select one to book.</DialogDescription>

          {isLoadingVenues ? (
            <div className="flex-1 flex items-center justify-center bg-slate-900 text-white w-full h-full">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : activeVenueData ? (
            <>
              <div className="relative flex-1 bg-slate-900 overflow-hidden flex flex-col h-[50vh] md:h-auto">
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-none flex justify-between items-start">
                  <div className="text-white pr-4">
                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-md">Virtual Tour - {activeVenueData.name}</h2>
                    <p className="text-sm md:text-base opacity-90 mt-1 max-w-xl drop-shadow-md">{activeVenueData.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge className="bg-white/20 text-white backdrop-blur-md border border-white/30 hidden md:inline-flex px-3 py-1">
                      360° Panoramic View
                    </Badge>
                    <Badge className="bg-[#f97316] text-white border-0 shadow-sm px-3 py-1">
                      <Users className="w-3 h-3 mr-1" /> Up to {activeVenueData.capacity}
                    </Badge>
                    <Badge className="bg-green-600 text-white border-0 shadow-sm px-3 py-1">
                      {activeVenueData.price}
                    </Badge>
                  </div>
                </div>

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

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs md:text-sm z-20 pointer-events-none whitespace-nowrap shadow-lg">
                  <div className="flex items-center space-x-2">
                    <MoveHorizontal className="w-4 h-4" />
                    <span>Drag to explore • Auto-rotating</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 flex flex-col bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden relative">
                
                {showReviewsPanel && (
                  <div className="absolute inset-0 z-30 bg-slate-50 flex flex-col animate-in slide-in-from-right-full duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0 shadow-sm">
                      <button 
                        className="font-bold text-sm text-slate-600 hover:text-slate-900 flex items-center transition-colors"
                        onClick={() => setShowReviewsPanel(false)}
                      >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        {activeVenueData.name} Reviews
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="bg-white p-6 border-b border-gray-100 flex flex-col items-center justify-center text-center">
                        <h4 className="text-4xl font-black text-slate-900">{activeAvgRating} <span className="text-lg font-bold text-slate-400">/ 5</span></h4>
                        <div className="flex items-center mt-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${Number(activeAvgRating) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-2">{activeVenueReviews.length} Ratings</p>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {activeVenueReviews.length === 0 ? (
                          <div className="text-center py-10">
                            <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500">No reviews yet for this venue.</p>
                          </div>
                        ) : (
                          activeVenueReviews.map((review) => (
                            <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                    {review.user.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{review.user}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{review.date}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex mb-2">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">"{review.comment}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-[#f97316]" />
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

                <Tabs className="flex-1 flex flex-col overflow-hidden" defaultValue="events">
                  <div className="p-4 pb-0 bg-white">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                      <TabsTrigger value="events" className="text-xs font-semibold rounded-md">Event Venues</TabsTrigger>
                      <TabsTrigger value="offices" className="text-xs font-semibold rounded-md">Office Spaces</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent className="flex-1 overflow-y-auto p-4 space-y-3 m-0 custom-scrollbar" value="events">
                    {eventVenuesList.map((venue) => {
                      const ratingData = getVenueRating(venue.id);
                      return (
                        <div 
                          key={venue.id} 
                          onClick={() => {
                            setSelectedVenue(venue.id);
                            setShowReviewsPanel(false);
                          }}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedVenue === venue.id 
                              ? 'border-[#f97316] bg-orange-50 ring-1 ring-[#f97316] shadow-sm' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-[#ea580c]' : 'text-gray-900'}`}>
                                {venue.name}
                              </h4>
                              <div className="text-xs mt-1 flex items-center text-gray-500">
                                <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-medium text-xs block">{venue.price}</span>
                            </div>
                          </div>
                          
                          {selectedVenue === venue.id && (
                            <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center">
                              <button 
                                className="flex items-center text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReviewsPanel(true);
                                }}
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1.5" />
                                {ratingData.count > 0 ? `${ratingData.avg} (${ratingData.count} Reviews)` : "No reviews yet"}
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </button>
                              <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </TabsContent>

                  <TabsContent className="flex-1 overflow-y-auto p-4 space-y-3 m-0 custom-scrollbar" value="offices">
                    {officeSpacesList.map((venue) => {
                      const ratingData = getVenueRating(venue.id);
                      return (
                        <div 
                          key={venue.id} 
                          onClick={() => {
                            setSelectedVenue(venue.id);
                            setShowReviewsPanel(false);
                          }}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedVenue === venue.id 
                              ? 'border-[#f97316] bg-orange-50 ring-1 ring-[#f97316] shadow-sm' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-[#ea580c]' : 'text-gray-900'}`}>
                                {venue.name}
                              </h4>
                              <div className="text-xs mt-1 flex items-center text-gray-500">
                                <Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-medium text-xs block">{venue.price}</span>
                            </div>
                          </div>
                          
                          {selectedVenue === venue.id && (
                            <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center">
                              <button 
                                className="flex items-center text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReviewsPanel(true);
                                }}
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1.5" />
                                {ratingData.count > 0 ? `${ratingData.avg} (${ratingData.count} Reviews)` : "No reviews yet"}
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </button>
                              <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </TabsContent>
                </Tabs>

                <div className="p-4 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Amenities included:</p>
                    <div className="flex flex-wrap gap-1">
                      {activeVenueData.amenities?.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal text-[10px] px-2 py-0.5">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" onClick={() => setShowVenueModal(false)} className="flex-1 rounded-lg border-gray-300 font-medium hover:bg-gray-50 text-slate-700">
                      Close
                    </Button>
                    <Button onClick={handleProceedToNewBooking} className="flex-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-medium shadow-md">
                      {/* DYNAMIC BUTTON TEXT DEPENDING KUNG MAY INI-EDIT KA */}
                      {editingBooking ? "Update Booking" : "Book Now"}
                    </Button>
                  </div>
                </div>

              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ReserveDialog 
        open={showReserveModal} 
        onOpenChange={(val) => {
           setShowReserveModal(val)
           if(!val) setEditingBooking(null)
        }} 
        selectedVenueId={selectedVenue}
        editingBooking={editingBooking}
        onSubmitSuccess={handleBookingSubmit}
        onBackToVenues={() => {
          setShowReserveModal(false);
          // WAG CLEAR EDITING BOOKING DITO PARA HINDI MAWALA YUNG DATA PAG NAG-BACK
          setTimeout(() => {
            setShowVenueModal(true);
          }, 300);
        }}
      />
      
    </div>
  )
}