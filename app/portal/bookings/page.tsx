"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation" 
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/src/modules/client/contexts/booking-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  Calendar as CalendarIcon, Plus, Clock, Users, MoveHorizontal, X, Loader2, 
  ChevronLeft, ChevronRight, MapPin, Star, Edit, XCircle, CheckCircle2,
  Search, History as HistoryIcon, CreditCard, AlertCircle, Info
} from "lucide-react"

import { ReserveDialog } from "@/components/reserve-dialog"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { VirtualTour } from "@/src/modules/client/components/virtual-tour"

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

export default function BookingsPage() {
  const router = useRouter() 
  const { user } = useAuth()
  const { toast } = useToast()
  
  const { bookings, requestCancellation } = useBookings()
  
  const [venues, setVenues] = useState<any[]>([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(true)

  const [showVenueModal, setShowVenueModal] = useState(false)
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<string>("v1")
  const [filterVenue, setFilterVenue] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("pending") 
  const [searchQuery, setSearchQuery] = useState("")

  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [reviewedBookings, setReviewedBookings] = useState<string[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [bookingToReview, setBookingToReview] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [showReviewsPanel, setShowReviewsPanel] = useState(false)

  const [bgPos, setBgPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  if (!user) return null

  const myBookings = bookings.filter(b => b.userId === user.id).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const allVenues = [...dummyEventVenues, ...dummyOfficeSpaces]

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoadingVenues(true)
        setTimeout(() => {
          setVenues([...dummyEventVenues, ...dummyOfficeSpaces])
          setIsLoadingVenues(false)
        }, 800)
      } catch (error) {
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
    const animation = setInterval(() => setBgPosition((prev) => prev - 0.5), 20)
    return () => clearInterval(animation)
  }, [isDragging, showVenueModal, activeVenueData])

  const onDragStart = (clientX: number) => { setIsDragging(true); dragStart.current = clientX - bgPos; }
  const onDragMove = (clientX: number) => { if (isDragging) setBgPosition(clientX - dragStart.current); }
  const onDragEnd = () => setIsDragging(false)

  const handleProceedToNewBooking = () => {
    setShowVenueModal(false)
    setTimeout(() => setShowReserveModal(true), 300)
  }

  const executeCancellationRequest = () => {
      if (!cancelReason.trim()) {
         toast({ title: "Reason Required", description: "Please provide a reason for cancelling.", variant: "destructive" })
         return;
      }

      if (cancelId) {
         const target = myBookings.find((b: any) => b.id === cancelId)
         if (target) {
             const currentNotifs = JSON.parse(localStorage.getItem("admin_notifications") || "[]")
             currentNotifs.push({ message: `Client ${user.name} requested to cancel their booking: ${target.eventName}. Reason: ${cancelReason}` })
             localStorage.setItem("admin_notifications", JSON.stringify(currentNotifs))
             window.dispatchEvent(new Event("storage")) 
         }
         requestCancellation(cancelId, cancelReason)
         setCancelId(null)
         setCancelReason("")
         toast({ title: "Cancellation Requested", description: "Your cancellation request is now under review by the admin." })
      }
  }

  const checkCancelEligibility = (dateStr: string) => {
      const eventDate = new Date(dateStr)
      const today = new Date()
      const diffTime = eventDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 14
  }

  const handleSimulatePayment = (paidBooking: any) => {
    try { localStorage.setItem("pending_payment_booking", JSON.stringify(paidBooking)); } catch (error) {}
    toast({ title: "Proceeding to Payment", description: "Redirecting you to My Transactions..." });
    setTimeout(() => { router.push('/portal/payments'); }, 1000);
  }

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      toast({ title: "Oops!", description: "Please write a comment before submitting.", variant: "destructive" })
      return;
    }
    const matchedVenue = venues.find(v => v.name.toLowerCase() === (bookingToReview?.venue || bookingToReview?.venueName || "Conference Hall").toLowerCase()) || venues[0];
    const newReview = {
      id: Date.now(), venueId: matchedVenue?.id || "v1", user: user?.name || "Verified Client",
      rating: rating, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), comment: comment
    }
    setReviewsList([newReview, ...reviewsList])
    if (bookingToReview?.id) setReviewedBookings([...reviewedBookings, bookingToReview.id])
    setShowReviewModal(false); setComment(""); setRating(5);
    toast({ title: "Review Submitted!", description: "Thank you for sharing your experience." })
  }

  const getVenueRating = (vId: string) => {
    const revs = reviewsList.filter(r => r.venueId === vId);
    if (revs.length === 0) return { avg: "0.0", count: 0 };
    const avg = (revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1);
    return { avg, count: revs.length };
  }

  const getVenueImage = (venueName: string) => {
    const match = allVenues.find(v => (venueName || "").toLowerCase().includes(v.name.toLowerCase()));
    return match?.image || dummyEventVenues[0].image;
  }

  const myFilteredBookings = myBookings.filter(b => {
    const status = b.status?.toLowerCase() || "pending";
    let matchStatus = false;
    if (activeTab === "approved") matchStatus = (status === "confirmed" || status === "approved");
    // FIX: ISINAMA ANG INCOMPLETE DOWNPAYMENT SA PENDING TAB PARA MAKITA NG USER KUNG MAY KULANG
    else if (activeTab === "pending") matchStatus = (status === "pending" || status === "verifying" || status === "cancellation_requested" || status === "incomplete_downpayment");
    else if (activeTab === "declined") matchStatus = (status === "declined" || status === "cancelled");
    else matchStatus = status === activeTab;

    const matchVenue = filterVenue === "all" || (b.venue || "").includes(filterVenue);
    const matchSearch = (b.eventName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchVenue && matchSearch;
  })

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 mt-1">Manage your event reservations and schedules.</p>
        </div>
        <Button className="bg-[#ea580c] hover:bg-[#c2410c] shadow-lg text-white font-bold px-6 h-12 rounded-xl transition-transform active:scale-95" onClick={() => setShowVenueModal(true)}>
          <Plus className="h-5 w-5 mr-2" /> Book Another Event
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex w-full xl:w-auto gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto min-w-0">
          {["Pending", "Approved", "Completed", "Declined"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap text-center ${activeTab === tab.toLowerCase() ? "bg-white text-[#ea580c] shadow-sm ring-1 ring-[#ea580c]/20" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <Select value={filterVenue} onValueChange={setFilterVenue}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-gray-200 font-medium text-slate-700 h-11 rounded-xl">
              <div className="flex items-center gap-2 truncate"><MapPin className="w-4 h-4 text-[#ea580c] shrink-0" /><SelectValue placeholder="All Venues" /></div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {allVenues.map(v => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search event..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-gray-200 w-full font-medium rounded-xl h-11" />
          </div>
        </div>
      </div>

      {/* GRID CARD LAYOUT */}
      {myFilteredBookings.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <HistoryIcon className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-slate-900 font-bold text-xl">No records found</h3>
          <p className="text-slate-400 text-sm mt-1">{searchQuery ? `No results found for "${searchQuery}".` : `You don't have any ${activeTab} reservations.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myFilteredBookings.map((booking) => {
            const currentStatus = booking.status?.toLowerCase() || "pending";
            const isConfirmed = currentStatus === "confirmed" || currentStatus === "approved";
            const isCancellationRequested = currentStatus === "cancellation_requested";
            const isEligibleForCancel = checkCancelEligibility(booking.date);
            const venueImage = getVenueImage(booking.venue || "");

            let statusColor = "bg-amber-500 text-white";
            if (currentStatus === "verifying") statusColor = "bg-blue-500 text-white";
            if (isConfirmed) statusColor = "bg-emerald-500 text-white";
            if (currentStatus === "completed") statusColor = "bg-slate-600 text-white";
            if (currentStatus === "declined" || currentStatus === "cancelled") statusColor = "bg-rose-500 text-white";
            if (isCancellationRequested) statusColor = "bg-rose-500 text-white animate-pulse";
            // FIX: COLOR PARA SA INCOMPLETE DP
            if (currentStatus === "incomplete_downpayment") statusColor = "bg-amber-600 text-white";

            return (
              <Card key={booking.id} className="overflow-hidden rounded-[24px] border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col bg-white">
                
                <div className="relative h-48 w-full bg-slate-100 shrink-0">
                  <img src={venueImage} alt={booking.venue} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  <Badge className={`absolute top-4 right-4 border-none shadow-sm uppercase text-[10px] font-black tracking-widest px-3 py-1 ${statusColor}`}>
                    {/* FIX: LOGIC PARA SA BADGE TEXT NI CUSTOMER */}
                    {isCancellationRequested ? 'CANCEL UNDER REVIEW' : currentStatus === 'incomplete_downpayment' ? 'INCOMPLETE DP' : currentStatus.replace('_', ' ')}
                  </Badge>

                  <Badge className="absolute top-4 left-4 bg-white/95 text-slate-800 hover:bg-white border-none shadow-sm backdrop-blur-sm uppercase text-[10px] font-black tracking-widest px-3 py-1 truncate max-w-[150px]">
                    {booking.venue || "Event Venue"}
                  </Badge>

                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xl font-black shadow-black drop-shadow-md">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 mb-4 truncate" title={booking.eventName}>
                    {booking.eventName || "Event Booking"}
                  </h3>
                  
                  <div className="space-y-2.5 mb-6">
                    {booking.time && (
                      <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg"><Clock className="w-4 h-4 mr-2 text-[#ea580c]" /> {booking.time}</div>
                    )}
                    <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg truncate"><MapPin className="w-4 h-4 mr-2 text-blue-500" /> {booking.venue}</div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-2">
                      
                      {/* FIX: PWEDE NA MAGBAYAD KAHIT INCOMPLETE DP PARA MABUO NILA */}
                      {(currentStatus === 'pending' || currentStatus === 'incomplete_downpayment') && (
                        <Button onClick={() => handleSimulatePayment(booking)} className="w-full bg-[#10b981] hover:bg-[#059669] text-white shadow-sm h-11 font-bold rounded-xl transition-transform active:scale-95">
                          <CreditCard className="w-4 h-4 mr-2" /> {currentStatus === 'incomplete_downpayment' ? 'Pay Remaining DP' : 'Pay Now'}
                        </Button>
                      )}

                      {currentStatus === 'verifying' && (
                        <Button disabled className="w-full bg-blue-50 text-blue-700 shadow-none h-11 font-bold rounded-xl opacity-80"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Admin Reviewing</Button>
                      )}

                      {isCancellationRequested && (
                         <div className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                            <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                            <p className="text-xs font-bold text-rose-700">Cancellation request is being reviewed by the admin.</p>
                         </div>
                      )}

                      <div className="flex gap-2 w-full">
                        {isConfirmed && currentStatus !== 'cancelled' && currentStatus !== 'declined' && currentStatus !== 'completed' && !isCancellationRequested && (
                          <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"><Edit className="w-4 h-4 mr-2"/> Modify</Button>
                        )}

                        {currentStatus !== "cancelled" && currentStatus !== "declined" && currentStatus !== "completed" && !isCancellationRequested && (
                          <Button variant="destructive" className="flex-1 rounded-xl h-11 font-bold shadow-sm" disabled={isConfirmed && !isEligibleForCancel} onClick={() => setCancelId(booking.id)}>
                            <XCircle className="w-4 h-4 mr-2"/> Cancel Request
                          </Button>
                        )}
                      </div>

                      {currentStatus === 'completed' && (
                        reviewedBookings.includes(booking.id) ? (
                          <Button disabled variant="outline" className="w-full rounded-xl h-11 font-bold bg-slate-50 text-slate-400">Completed & Reviewed</Button>
                        ) : (
                          <Button className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-sm h-11 font-bold rounded-xl" onClick={() => { setBookingToReview(booking); setShowReviewModal(true); }}>
                            <Star className="w-4 h-4 mr-2 fill-white" /> Rate & Review
                          </Button>
                        )
                      )}
                    </div>

                    {currentStatus !== "cancelled" && currentStatus !== "declined" && currentStatus !== "completed" && !isCancellationRequested && (
                      <div className="text-center w-full mt-2">
                        {isConfirmed ? (
                          isEligibleForCancel ? <span className="text-[11px] text-emerald-600 font-bold">Cancellation is allowed (&gt;14 days before).</span> : <span className="text-[11px] text-rose-500 font-bold">Locked: Less than 14 days before the event.</span>
                        ) : <span className="text-[11px] text-slate-400 font-medium">You can cancel this while it's still pending.</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* REMAINDER OF UI (MODALS & DIALOGS) */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
         <DialogContent className="sm:max-w-[450px] p-6 bg-white rounded-[24px] border-none shadow-xl z-[99999]">
           <div className="text-center mb-6">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rate your experience</h2>
           </div>
           <div className="flex justify-center gap-2 mb-6">
             {[1, 2, 3, 4, 5].map((star) => (
               <button key={star} onClick={() => setRating(star)} className="transform transition-transform hover:scale-110 focus:outline-none">
                 <Star className={`w-10 h-10 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
               </button>
             ))}
           </div>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-bold text-slate-700 mb-2 block">Share your feedback</label>
               <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? What can we improve?" className="w-full flex min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c] transition-all resize-none" />
             </div>
             <div className="flex gap-3 pt-2">
               <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowReviewModal(false)}>Cancel</Button>
               <Button className="flex-1 rounded-xl h-12 bg-slate-900 font-bold text-white hover:bg-slate-800" onClick={handleSubmitReview}>Submit Review</Button>
             </div>
           </div>
         </DialogContent>
      </Dialog>

      <Dialog open={showVenueModal} onOpenChange={(val) => { setShowVenueModal(val); if(!val) setShowReviewsPanel(false); }}>
        <DialogContent className="!max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 border-0 bg-black [&>button]:hidden shadow-2xl z-[99999]">
          <DialogTitle className="sr-only">Virtual Tour and Venue Selection</DialogTitle>
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
                    <Badge className="bg-[#f97316] text-white border-0 shadow-sm px-3 py-1"><Users className="w-3 h-3 mr-1" /> Up to {activeVenueData.capacity}</Badge>
                    <Badge className="bg-green-600 text-white border-0 shadow-sm px-3 py-1">{activeVenueData.price}</Badge>
                  </div>
                </div>

                <div 
                  className={`absolute inset-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={(e) => onDragStart(e.clientX)} onMouseMove={(e) => onDragMove(e.clientX)} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
                  style={{ backgroundImage: `url('${activeVenueData.image}')`, backgroundSize: 'auto 100%', backgroundPositionX: `${bgPos}px`, backgroundRepeat: 'repeat-x' }}
                />
              </div>

              <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 flex flex-col bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden relative">
                {showReviewsPanel && (
                  <div className="absolute inset-0 z-30 bg-slate-50 flex flex-col animate-in slide-in-from-right-full duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0 shadow-sm">
                      <button className="font-bold text-sm text-slate-600 hover:text-slate-900 flex items-center transition-colors" onClick={() => setShowReviewsPanel(false)}><ChevronLeft className="w-5 h-5 mr-1" /> {activeVenueData.name} Reviews</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="bg-white p-6 border-b border-gray-100 flex flex-col items-center justify-center text-center">
                        <h4 className="text-4xl font-black text-slate-900">{getVenueRating(activeVenueData.id).avg} <span className="text-lg font-bold text-slate-400">/ 5</span></h4>
                        <div className="flex items-center mt-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${Number(getVenueRating(activeVenueData.id).avg) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
                        <p className="text-xs text-slate-500 font-medium mt-2">{getVenueRating(activeVenueData.id).count} Ratings</p>
                      </div>
                      <div className="p-4 space-y-3">
                        {reviewsList.filter(r => r.venueId === activeVenueData.id).length === 0 ? (
                          <div className="text-center py-10"><Star className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No reviews yet.</p></div>
                        ) : (
                          reviewsList.filter(r => r.venueId === activeVenueData.id).map((review) => (
                            <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{review.user.charAt(0)}</div>
                                  <div><p className="text-sm font-bold text-slate-900">{review.user}</p><p className="text-[10px] text-slate-400 font-medium">{review.date}</p></div>
                                </div>
                              </div>
                              <div className="flex mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
                              <p className="text-sm text-slate-600 leading-relaxed">"{review.comment}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-[#f97316]" /> Tour Areas</h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowVenueModal(false)} className="text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8 p-0 transition-colors"><X className="w-5 h-5" /></Button>
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
                        <div key={venue.id} onClick={() => { setSelectedVenue(venue.id); setShowReviewsPanel(false); }} className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedVenue === venue.id ? 'border-[#f97316] bg-orange-50 ring-1 ring-[#f97316] shadow-sm' : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1"><h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-[#ea580c]' : 'text-gray-900'}`}>{venue.name}</h4><div className="text-xs mt-1 flex items-center text-gray-500"><Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}</div></div>
                            <div className="text-right"><span className="text-green-600 font-medium text-xs block">{venue.price}</span></div>
                          </div>
                          {selectedVenue === venue.id && (
                            <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center">
                              <button className="flex items-center text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors" onClick={(e) => { e.stopPropagation(); setShowReviewsPanel(true); }}><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1.5" />{ratingData.count > 0 ? `${ratingData.avg} (${ratingData.count} Reviews)` : "No reviews yet"}<ChevronRight className="w-3.5 h-3.5 ml-0.5" /></button>
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
                        <div key={venue.id} onClick={() => { setSelectedVenue(venue.id); setShowReviewsPanel(false); }} className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedVenue === venue.id ? 'border-[#f97316] bg-orange-50 ring-1 ring-[#f97316] shadow-sm' : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1"><h4 className={`font-semibold text-sm ${selectedVenue === venue.id ? 'text-[#ea580c]' : 'text-gray-900'}`}>{venue.name}</h4><div className="text-xs mt-1 flex items-center text-gray-500"><Users className="w-3 h-3 mr-1" /> Up to {venue.capacity}</div></div>
                            <div className="text-right"><span className="text-green-600 font-medium text-xs block">{venue.price}</span></div>
                          </div>
                          {selectedVenue === venue.id && (
                            <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center">
                              <button className="flex items-center text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors" onClick={(e) => { e.stopPropagation(); setShowReviewsPanel(true); }}><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1.5" />{ratingData.count > 0 ? `${ratingData.avg} (${ratingData.count} Reviews)` : "No reviews yet"}<ChevronRight className="w-3.5 h-3.5 ml-0.5" /></button>
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
                      {activeVenueData.amenities?.map((amenity, index) => <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 font-normal text-[10px] px-2 py-0.5">{amenity}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" onClick={() => setShowVenueModal(false)} className="flex-1 rounded-lg border-gray-300 font-medium text-slate-700">Close</Button>
                    <Button onClick={handleProceedToNewBooking} className="flex-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-medium shadow-md">Book Now</Button>
                  </div>
                </div>

              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ReserveDialog open={showReserveModal} onOpenChange={(val) => setShowReserveModal(val)} selectedVenueId={selectedVenue} onBackToVenues={() => { setShowReserveModal(false); setTimeout(() => setShowVenueModal(true), 300); }} />

      <Dialog open={!!cancelId} onOpenChange={(open) => {
        if (!open) { setCancelId(null); setCancelReason(""); }
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 z-[99999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600"><AlertCircle className="w-6 h-6" /> Request Cancellation</DialogTitle>
            <DialogDescription className="text-slate-600 pt-3 text-base">
              To cancel your booking, please provide a brief reason. Your request will be sent to the admin for review.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-2">
            <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-widest">Reason for cancellation *</label>
            <textarea 
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, Change of mind..."
              className="w-full flex min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-5">
            <Button variant="outline" onClick={() => { setCancelId(null); setCancelReason(""); }} className="rounded-xl h-11 px-6">Keep Booking</Button>
            <Button variant="destructive" disabled={!cancelReason.trim()} onClick={executeCancellationRequest} className="rounded-xl h-11 px-6 font-bold">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}