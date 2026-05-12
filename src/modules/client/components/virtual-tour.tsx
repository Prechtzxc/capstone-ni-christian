"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  RotateCcw, ZoomIn, ZoomOut, Navigation, X, ChevronLeft, ChevronRight, Users, CheckCircle2, PlayCircle, PauseCircle, MapPin
} from "lucide-react"

interface VirtualTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TourAngle {
  id: string
  name: string
  image: string
  thumbnail: string
}

interface TourArea {
  id: string
  name: string
  description: string
  capacity?: string
  amenities?: string[]
  angles: TourAngle[]
  category: "event" | "office"
  floor?: "ground" | "second"
}

export function VirtualTour({ open, onOpenChange }: VirtualTourProps) {
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  
  // Panning & Rotation States
  const [panX, setPanX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  
  const [activeTab, setActiveTab] = useState<"event" | "office">("event")
  const tourRef = useRef<HTMLDivElement>(null)

  const tourAreas: TourArea[] = [
    {
      id: "milestone-event-place",
      name: "The Milestone Event Place",
      description: "Our premier event space can accommodate up to 500 guests for milestone celebrations",
      capacity: "Up to 500 guests",
      amenities: ["Stage", "Sound System", "Lighting", "Catering Kitchen"],
      category: "event",
      angles: [
        { id: "main-entrance", name: "Main Entrance", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&h=200&fit=crop" },
        { id: "stage-view", name: "Stage View", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop" },
        { id: "dining-area", name: "Dining Area", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=200&fit=crop" },
      ],
    },
    {
      id: "moment-event-place",
      name: "Moment Event Place",
      description: "Intimate space perfect for capturing special moments and smaller gatherings",
      capacity: "Up to 150 guests",
      amenities: ["Preparation Area", "Lounge", "Private Entrance", "Premium Lighting"],
      category: "event",
      angles: [
        { id: "vanity-area", name: "Preparation Area", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" },
        { id: "lounge-area", name: "Lounge Area", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop" },
      ],
    },
    {
      id: "conference-room",
      name: "Conference Room",
      description: "Professional meeting space equipped with modern presentation facilities",
      capacity: "Up to 50 attendees",
      amenities: ["Projector", "Whiteboard", "Video Conferencing", "High-Speed WiFi"],
      category: "event",
      angles: [
        { id: "presentation-area", name: "Presentation Area", image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop" },
        { id: "meeting-setup", name: "Meeting Setup", image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=300&h=200&fit=crop" },
      ],
    },
    {
      id: "office-room-1",
      name: "Office Room 1",
      description: "Modern office space with natural lighting and premium amenities",
      capacity: "4-6 workstations",
      amenities: ["High-Speed WiFi", "Air Conditioning", "Natural Light", "Parking"],
      category: "office",
      floor: "ground",
      angles: [
        { id: "room-1-main", name: "Main Office View", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop" },
      ],
    },
    {
      id: "office-room-9",
      name: "Executive Suite",
      description: "Elevated workspace with enhanced privacy and premium views",
      capacity: "4-6 workstations",
      amenities: ["Enhanced Privacy", "Premium Views", "Quiet Environment", "Executive Access"],
      category: "office",
      floor: "second",
      angles: [
        { id: "room-9-main", name: "Elevated Office", image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=1400&h=700&fit=crop", thumbnail: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=300&h=200&fit=crop" },
      ],
    },
  ]

  const currentArea = tourAreas[currentAreaIndex]
  const currentAngle = currentArea.angles[currentAngleIndex]
  const filteredAreas = tourAreas.filter(a => a.category === activeTab)

  // FIX: AUTO ROTATE LOGIC (Umiikot nang kusa!)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRotating && !isDragging) {
      interval = setInterval(() => {
        setPanX(prev => prev - 0.8); // Speed of auto-rotation
      }, 16);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  // DRAGGING LOGIC
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart(e.clientX) }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart
    setPanX(prev => prev + deltaX * 0.5)
    setDragStart(e.clientX)
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => { setIsDragging(true); setDragStart(e.touches[0].clientX) }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - dragStart
    setPanX(prev => prev + deltaX * 0.5)
    setDragStart(e.touches[0].clientX)
  }
  const handleTouchEnd = () => setIsDragging(false)

  // CONTROLS
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2.5))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 1))
  const resetView = () => { setPanX(0); setZoom(1); setIsAutoRotating(true) }

  const nextAngle = () => { setCurrentAngleIndex((prev) => (prev + 1) % currentArea.angles.length); resetView() }
  const prevAngle = () => { setCurrentAngleIndex((prev) => (prev - 1 + currentArea.angles.length) % currentArea.angles.length); resetView() }

  const switchAreaById = (id: string) => {
    const index = tourAreas.findIndex(a => a.id === id)
    if (index !== -1) {
      setCurrentAreaIndex(index)
      setCurrentAngleIndex(0)
      resetView()
    }
  }

  const closeTour = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] w-full h-[90vh] p-0 overflow-hidden border-none bg-black rounded-[2rem] shadow-2xl z-[99999] [&>button]:hidden">
        <DialogTitle className="sr-only">Virtual Tour</DialogTitle>
        
        {/* DRAGGABLE 360 PANORAMA BACKGROUND */}
        <div
          ref={tourRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-full h-full transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoom})`,
              backgroundImage: `url(${currentAngle.image})`,
              backgroundSize: 'cover',
              backgroundPositionX: `${panX}px`,
              backgroundPositionY: 'center',
              backgroundRepeat: 'repeat-x' // Allows infinite panning horizontally
            }}
          />
        </div>

        {/* TOP LEFT: VENUE INFORMATION */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-[#ea580c] text-white border-none px-3 py-1 font-black tracking-widest uppercase text-[10px] shadow-sm pointer-events-auto">
                {currentArea.category === "event" ? "Event Venue" : "Office Space"}
              </Badge>
              {currentArea.capacity && (
                <Badge variant="outline" className="text-white border-white/30 font-bold bg-white/10 px-3 py-1 shadow-sm backdrop-blur-md">
                  <Users className="w-3.5 h-3.5 mr-1.5" /> {currentArea.capacity}
                </Badge>
              )}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-xl leading-tight mb-2">
              {currentArea.name}
            </h2>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed drop-shadow-md">
              {currentArea.description}
            </p>
            
            {currentArea.amenities && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4">
                {currentArea.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center text-xs font-bold tracking-wide text-white/90 uppercase drop-shadow-md">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                    {amenity}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOP RIGHT: CLOSE BUTTON */}
        <button 
          onClick={closeTour} 
          className="absolute top-6 right-6 z-[99999] w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-white hover:text-black backdrop-blur-md text-white rounded-full transition-all active:scale-95 border border-white/20 shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CENTER SIDES: ANGLE NAVIGATION */}
        {currentArea.angles.length > 1 && (
          <>
            <button onClick={prevAngle} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-md hover:bg-black/80 transition-all hover:scale-110 border border-white/10 shadow-xl">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={nextAngle} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-md hover:bg-black/80 transition-all hover:scale-110 border border-white/10 shadow-xl">
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* BOTTOM SECTION: THUMBNAIL GALLERY & CONTROLS */}
        <div className="absolute bottom-0 left-0 right-0 pt-20 pb-6 px-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none z-20 flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 pointer-events-auto">
            
            {/* LEFT: TABS FOR VENUE CATEGORY */}
            <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
              <button 
                onClick={() => setActiveTab("event")} 
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "event" ? "bg-white text-black shadow-md" : "text-white/70 hover:text-white"}`}
              >
                Event Venues
              </button>
              <button 
                onClick={() => setActiveTab("office")} 
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "office" ? "bg-white text-black shadow-md" : "text-white/70 hover:text-white"}`}
              >
                Office Spaces
              </button>
            </div>

            {/* RIGHT: VIEWER CONTROLS */}
            <div className="flex items-center gap-1.5 bg-black/60 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
              <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`p-2.5 rounded-xl transition-colors ${isAutoRotating ? 'bg-[#ea580c] text-white' : 'text-white hover:bg-white/20'}`} title={isAutoRotating ? "Pause Rotation" : "Play Rotation"}>
                {isAutoRotating ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
              </button>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button onClick={handleZoomOut} className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"><ZoomOut className="w-5 h-5" /></button>
              <button onClick={resetView} className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"><RotateCcw className="w-5 h-5" /></button>
              <button onClick={handleZoomIn} className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"><ZoomIn className="w-5 h-5" /></button>
              <div className="hidden sm:flex items-center px-3 text-white/90 text-[10px] font-black gap-2 uppercase tracking-widest border-l border-white/20 ml-1 pl-4">
                <Navigation className="w-3.5 h-3.5" /> Drag to Pan
              </div>
            </div>

          </div>

          {/* HORIZONTAL THUMBNAIL GALLERY */}
          <div className="w-full overflow-x-auto custom-scrollbar pb-2 pointer-events-auto">
            <div className="flex gap-4 w-max">
              {filteredAreas.map((area) => {
                const globalIndex = tourAreas.findIndex(a => a.id === area.id)
                const isActive = globalIndex === currentAreaIndex

                return (
                  <div 
                    key={area.id} 
                    onClick={() => switchAreaById(area.id)} 
                    className={`relative w-48 h-28 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                      isActive ? 'border-[#ea580c] scale-105 shadow-[0_0_20px_rgba(234,88,12,0.5)] z-10' : 'border-white/10 hover:border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={area.angles[0].thumbnail} alt={area.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-bold leading-tight drop-shadow-md">
                        {area.name}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#ea580c] rounded-full animate-pulse shadow-[0_0_8px_#ea580c]" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}