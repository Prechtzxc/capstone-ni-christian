"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Wifi,
  Monitor,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("event-venues")
  const tourRef = useRef<HTMLDivElement>(null)

  // Complete tour areas with event venues and office spaces
  const tourAreas: TourArea[] = [
    // Event Venues
    {
      id: "milestone-event-place",
      name: "The Milestone Event Place",
      description: "Our premier event space can accommodate up to 500 guests for milestone celebrations",
      capacity: "Up to 500 guests",
      amenities: ["Stage", "Sound System", "Lighting", "Catering Kitchen"],
      category: "event",
      angles: [
        {
          id: "main-entrance",
          name: "Main Entrance View",
          image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=150&h=90&fit=crop",
        },
        {
          id: "stage-view",
          name: "Stage View",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&h=90&fit=crop",
        },
        {
          id: "dining-area",
          name: "Dining Area",
          image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=150&h=90&fit=crop",
        },
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
        {
          id: "vanity-area",
          name: "Preparation Area",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=90&fit=crop",
        },
        {
          id: "lounge-area",
          name: "Lounge Area",
          image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&h=90&fit=crop",
        },
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
        {
          id: "presentation-area",
          name: "Presentation Area",
          image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=150&h=90&fit=crop",
        },
        {
          id: "meeting-setup",
          name: "Meeting Setup",
          image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "business-operation-meeting-room",
      name: "Business Operation Meeting Room",
      description: "Executive meeting space designed for business operations and strategic planning",
      capacity: "Up to 20 executives",
      amenities: ["Executive Seating", "Smart Board", "Climate Control", "Premium Audio"],
      category: "event",
      angles: [
        {
          id: "boardroom-view",
          name: "Boardroom View",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&h=90&fit=crop",
        },
        {
          id: "executive-seating",
          name: "Executive Seating",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=90&fit=crop",
        },
      ],
    },
    // Ground Floor Office Spaces (Rooms 1-8)
    {
      id: "office-room-1",
      name: "Office Room 1",
      description: "Modern office space with natural lighting and premium amenities",
      capacity: "4-6 workstations",
      amenities: ["High-Speed WiFi", "Air Conditioning", "Natural Light", "Parking"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-1-main",
          name: "Main Office View",
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=90&fit=crop",
        },
        {
          id: "room-1-workstation",
          name: "Workstation Area",
          image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-2",
      name: "Office Room 2",
      description: "Spacious office with meeting area and private workspace",
      capacity: "6-8 workstations",
      amenities: ["Meeting Area", "Private Workspace", "Storage", "Printer Access"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-2-main",
          name: "Main Office View",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=90&fit=crop",
        },
        {
          id: "room-2-meeting",
          name: "Meeting Area",
          image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-3",
      name: "Office Room 3",
      description: "Corner office with panoramic views and executive setup",
      capacity: "3-4 workstations",
      amenities: ["Panoramic Views", "Executive Desk", "Reception Area", "Premium Furniture"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-3-main",
          name: "Executive View",
          image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=150&h=90&fit=crop",
        },
        {
          id: "room-3-reception",
          name: "Reception Area",
          image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-4",
      name: "Office Room 4",
      description: "Open-plan office ideal for collaborative teams",
      capacity: "8-10 workstations",
      amenities: ["Open Layout", "Collaboration Space", "Whiteboard", "Team Kitchen"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-4-main",
          name: "Open Office View",
          image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=150&h=90&fit=crop",
        },
        {
          id: "room-4-collab",
          name: "Collaboration Area",
          image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-5",
      name: "Office Room 5",
      description: "Private office suite with dedicated entrance",
      capacity: "2-3 workstations",
      amenities: ["Private Entrance", "Dedicated Parking", "Security System", "Storage Room"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-5-main",
          name: "Private Office",
          image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=150&h=90&fit=crop",
        },
        {
          id: "room-5-entrance",
          name: "Private Entrance",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-6",
      name: "Office Room 6",
      description: "Tech-enabled office with smart features and modern design",
      capacity: "5-6 workstations",
      amenities: ["Smart Lighting", "IoT Integration", "Wireless Charging", "Digital Displays"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-6-main",
          name: "Smart Office View",
          image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=150&h=90&fit=crop",
        },
        {
          id: "room-6-tech",
          name: "Tech Setup",
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-7",
      name: "Office Room 7",
      description: "Creative studio space with flexible layout options",
      capacity: "4-8 workstations",
      amenities: ["Flexible Layout", "Creative Tools", "Presentation Wall", "Brainstorm Area"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-7-main",
          name: "Creative Studio",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&h=90&fit=crop",
        },
        {
          id: "room-7-creative",
          name: "Creative Area",
          image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-8",
      name: "Office Room 8",
      description: "Premium office with executive amenities and city views",
      capacity: "3-5 workstations",
      amenities: ["City Views", "Executive Amenities", "Premium Furniture", "Concierge Service"],
      category: "office",
      floor: "ground",
      angles: [
        {
          id: "room-8-main",
          name: "Premium Office",
          image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560472355-536de3962603?w=150&h=90&fit=crop",
        },
        {
          id: "room-8-view",
          name: "City View",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=90&fit=crop",
        },
      ],
    },
    // Second Floor Office Spaces (Rooms 9-16)
    {
      id: "office-room-9",
      name: "Office Room 9",
      description: "Elevated workspace with enhanced privacy and premium views",
      capacity: "4-6 workstations",
      amenities: ["Enhanced Privacy", "Premium Views", "Quiet Environment", "Executive Access"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-9-main",
          name: "Elevated Office",
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=90&fit=crop",
        },
        {
          id: "room-9-view",
          name: "Premium View",
          image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-10",
      name: "Office Room 10",
      description: "Spacious second-floor office with conference capabilities",
      capacity: "6-8 workstations",
      amenities: ["Conference Table", "Video Conferencing", "Presentation Screen", "Sound System"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-10-main",
          name: "Conference Office",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=90&fit=crop",
        },
        {
          id: "room-10-conference",
          name: "Conference Setup",
          image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-11",
      name: "Office Room 11",
      description: "Corner office suite with panoramic city views",
      capacity: "3-4 workstations",
      amenities: ["Panoramic Views", "Corner Location", "Natural Light", "Premium Finishes"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-11-main",
          name: "Corner Suite",
          image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=90&fit=crop",
        },
        {
          id: "room-11-panoramic",
          name: "Panoramic View",
          image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-12",
      name: "Office Room 12",
      description: "Collaborative workspace with team-focused amenities",
      capacity: "8-10 workstations",
      amenities: ["Team Workspace", "Collaboration Tools", "Breakout Areas", "Shared Resources"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-12-main",
          name: "Team Workspace",
          image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=150&h=90&fit=crop",
        },
        {
          id: "room-12-breakout",
          name: "Breakout Area",
          image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-13",
      name: "Office Room 13",
      description: "Executive suite with private meeting room and reception",
      capacity: "2-3 workstations",
      amenities: ["Private Meeting Room", "Reception Area", "Executive Furniture", "VIP Access"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-13-main",
          name: "Executive Suite",
          image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=150&h=90&fit=crop",
        },
        {
          id: "room-13-meeting",
          name: "Private Meeting",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-14",
      name: "Office Room 14",
      description: "Innovation lab with cutting-edge technology and flexible design",
      capacity: "5-6 workstations",
      amenities: ["Innovation Lab", "Cutting-edge Tech", "Flexible Design", "R&D Facilities"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-14-main",
          name: "Innovation Lab",
          image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=150&h=90&fit=crop",
        },
        {
          id: "room-14-tech",
          name: "Tech Center",
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-15",
      name: "Office Room 15",
      description: "Creative hub with artistic elements and inspiring environment",
      capacity: "4-8 workstations",
      amenities: ["Creative Hub", "Artistic Elements", "Inspiring Design", "Creative Tools"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-15-main",
          name: "Creative Hub",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&h=90&fit=crop",
        },
        {
          id: "room-15-artistic",
          name: "Artistic Space",
          image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&h=90&fit=crop",
        },
      ],
    },
    {
      id: "office-room-16",
      name: "Office Room 16",
      description: "Penthouse office with luxury amenities and spectacular views",
      capacity: "3-5 workstations",
      amenities: ["Penthouse Level", "Luxury Amenities", "Spectacular Views", "Premium Service"],
      category: "office",
      floor: "second",
      angles: [
        {
          id: "room-16-main",
          name: "Penthouse Office",
          image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560472355-536de3962603?w=150&h=90&fit=crop",
        },
        {
          id: "room-16-luxury",
          name: "Luxury View",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=90&fit=crop",
        },
      ],
    },
  ]

  const currentArea = tourAreas[currentAreaIndex]
  const currentAngle = currentArea.angles[currentAngleIndex]

  // Filter areas by category
  const eventVenues = tourAreas.filter((area) => area.category === "event")
  const groundFloorOffices = tourAreas.filter((area) => area.category === "office" && area.floor === "ground")
  const secondFloorOffices = tourAreas.filter((area) => area.category === "office" && area.floor === "second")

  // Handle mouse/touch dragging for panoramic panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const newPanX = panX + deltaX * 0.5
    setPanX(Math.max(Math.min(newPanX, 300), -300)) // Limit panning range
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const newPanX = panX + deltaX * 0.5
    setPanX(Math.max(Math.min(newPanX, 300), -300))
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const resetView = () => {
    setPanX(0)
    setZoom(1)
  }

  const nextAngle = () => {
    setCurrentAngleIndex((prev) => (prev + 1) % currentArea.angles.length)
    resetView()
  }

  const prevAngle = () => {
    setCurrentAngleIndex((prev) => (prev - 1 + currentArea.angles.length) % currentArea.angles.length)
    resetView()
  }

  const switchArea = (areaIndex: number) => {
    setCurrentAreaIndex(areaIndex)
    setCurrentAngleIndex(0)
    resetView()
  }

  const switchAngle = (angleIndex: number) => {
    setCurrentAngleIndex(angleIndex)
    resetView()
  }

  const closeTour = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 border-0 bg-black">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: 360 Panoramic View (Maximized) */}
        {/* ========================================== */}
        <div className="relative flex-1 bg-black overflow-hidden flex flex-col h-[50vh] md:h-auto">
          
          {/* Top Overlays */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-none flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-xl md:text-3xl font-bold">Virtual Tour - {currentArea.name}</h2>
              <p className="text-xs md:text-base opacity-90 mt-1 max-w-xl">{currentArea.description}</p>
            </div>
            {/* Top Right Badges */}
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0 hidden md:inline-flex">
                {currentAngle.name}
              </Badge>
              {currentArea.capacity && (
                <Badge variant="secondary" className="bg-blue-600/90 text-white backdrop-blur-sm border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {currentArea.capacity}
                </Badge>
              )}
            </div>
          </div>

          {/* Panoramic View Container */}
          <div
            ref={tourRef}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              backgroundImage: `url(${currentAngle.image})`,
              backgroundSize: `${150 * zoom}% ${100 * zoom}%`,
              backgroundPosition: `${panX}px center`,
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Controls (Zoom, Reset) */}
          <div className="absolute bottom-24 right-4 z-20 flex flex-col space-y-2">
            <Button size="sm" variant="secondary" onClick={handleZoomIn} className="bg-white/90 hover:bg-white shadow-md">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={handleZoomOut} className="bg-white/90 hover:bg-white shadow-md">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={resetView} className="bg-white/90 hover:bg-white shadow-md">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Angle Navigation */}
          <div className="absolute bottom-24 left-4 z-20 flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={prevAngle}
              className="bg-white/90 hover:bg-white shadow-md"
              disabled={currentArea.angles.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Previous</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={nextAngle}
              className="bg-white/90 hover:bg-white shadow-md"
              disabled={currentArea.angles.length <= 1}
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-4 h-4 md:ml-1" />
            </Button>
          </div>

          {/* Navigation Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs md:text-sm z-20 pointer-events-none whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4" />
              <span className="hidden md:inline">Drag to pan • Use controls to zoom</span>
              <span className="md:hidden">Drag to explore</span>
            </div>
          </div>

          {/* Thumbnails */}
          {currentArea.angles.length > 1 && (
            <div className="absolute top-24 right-4 z-20 flex flex-col space-y-2 pointer-events-none md:top-auto md:bottom-6 md:left-4 md:right-4 md:flex-row md:justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 overflow-auto pointer-events-auto">
                {currentArea.angles.map((angle, angleIndex) => (
                  <button
                    key={angle.id}
                    onClick={() => switchAngle(angleIndex)}
                    className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all ${
                      angleIndex === currentAngleIndex
                        ? "ring-2 ring-blue-400 scale-105"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    title={angle.name}
                  >
                    <img
                      src={angle.thumbnail || "/placeholder.svg"}
                      alt={angle.name}
                      className="w-16 h-10 object-cover"
                    />
                    {angleIndex === currentAngleIndex && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Tour Areas & Action Buttons  */}
        {/* ========================================== */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden">
          
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
            <h3 className="font-bold text-lg text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Tour Areas
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={closeTour}
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scrollable Tour Areas Tabs */}
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="event-venues" className="text-xs">
                  Event Venues
                </TabsTrigger>
                <TabsTrigger value="office-spaces" className="text-xs">
                  Office Spaces
                </TabsTrigger>
              </TabsList>

              {/* EVENT VENUES TAB */}
              <TabsContent value="event-venues" className="mt-0 space-y-2">
                {eventVenues.map((area) => {
                  const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                  return (
                    <button
                      key={area.id}
                      onClick={() => switchArea(globalIndex)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        globalIndex === currentAreaIndex
                          ? "bg-blue-50 border-blue-600 shadow-sm"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`font-medium ${globalIndex === currentAreaIndex ? "text-blue-700" : "text-gray-900"}`}>
                            {area.name}
                          </div>
                          {area.capacity && (
                            <div className="text-xs mt-1 flex items-center text-gray-500">
                              <Users className="w-3 h-3 mr-1" />
                              {area.capacity}
                            </div>
                          )}
                        </div>
                        {globalIndex === currentAreaIndex && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mt-1.5" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </TabsContent>

              {/* OFFICE SPACES TAB */}
              <TabsContent value="office-spaces" className="mt-0 space-y-6">
                
                {/* Ground Floor */}
                <div>
                  <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <Monitor className="w-3 h-3 mr-1" />
                    Ground Floor
                  </h5>
                  <div className="space-y-2">
                    {groundFloorOffices.map((area) => {
                      const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                      return (
                        <button
                          key={area.id}
                          onClick={() => switchArea(globalIndex)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            globalIndex === currentAreaIndex
                              ? "bg-blue-50 border-blue-600 shadow-sm"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${globalIndex === currentAreaIndex ? "text-blue-700" : "text-gray-900"}`}>
                                {area.name}
                              </div>
                              {area.capacity && (
                                <div className="text-xs mt-1 flex items-center text-gray-500">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  {area.capacity}
                                </div>
                              )}
                            </div>
                            {globalIndex === currentAreaIndex && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mt-1.5" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Second Floor */}
                <div>
                  <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <Monitor className="w-3 h-3 mr-1" />
                    Second Floor
                  </h5>
                  <div className="space-y-2">
                    {secondFloorOffices.map((area) => {
                      const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                      return (
                        <button
                          key={area.id}
                          onClick={() => switchArea(globalIndex)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            globalIndex === currentAreaIndex
                              ? "bg-blue-50 border-blue-600 shadow-sm"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${globalIndex === currentAreaIndex ? "text-blue-700" : "text-gray-900"}`}>
                                {area.name}
                              </div>
                              {area.capacity && (
                                <div className="text-xs mt-1 flex items-center text-gray-500">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  {area.capacity}
                                </div>
                              )}
                            </div>
                            {globalIndex === currentAreaIndex && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mt-1.5" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom Footer: Amenities & Buttons */}
          <div className="p-5 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2 font-medium">Amenities included:</p>
              {currentArea.amenities && (
                <div className="flex flex-wrap gap-1.5">
                  {currentArea.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={closeTour}
                className="flex-1 py-5 rounded-lg"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  closeTour()
                  toast({
                    title: "Ready to book?",
                    description: `Sign in to reserve ${currentArea.name} for your event!`,
                  })
                }}
                className="flex-1 py-5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white"
              >
                Sign In to Book
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}