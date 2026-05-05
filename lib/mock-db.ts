// ==========================================
// INTERFACES
// ==========================================

export interface User {
  id: string
  name: string
  email: string
  password?: string
  avatar?: string
  role: "user" | "admin" | "owner"
}

export interface Booking {
  id: string
  userId: string
  eventName: string
  eventType: string
  guestCount: number
  date: string
  startTime: string
  endTime: string
  specialRequests: string
  status: "pending" | "confirmed" | "declined" | "completed" | "cancelled"
  submittedAt: string
  total?: string
  userInfo: {
    name: string
    email: string
    phone: string
  }
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  message: string
  submittedAt: string
  status: "new" | "read" | "replied"
  priority: "low" | "medium" | "high"
}

export interface PaymentProof {
  id: string
  bookingId: string
  fileId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: string
  uploadedBy: string
  status: "pending" | "verified" | "rejected"
  verifiedAt?: string
  verifiedBy?: string
  adminNote?: string
  paymentMethod: string
  paymentAmount: string
  paymentDate: string
  paymentReference?: string
}

// ==========================================
// MOCK DATABASE
// ==========================================

export const mockDatabase = {
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "user@oneestela.com",
      password: "user123",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user" as const,
    },
    {
      id: "2",
      name: "Demo Admin",
      email: "demo@oneestela.com",
      password: "demo123",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin" as const,
    },
    {
      id: "3",
      name: "Admin User",
      email: "admin@oneestela.com",
      password: "admin123",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin" as const,
    },
    {
      id: "4",
      name: "Owner",
      email: "owner@oneestela.com",
      password: "owner123",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "owner" as const,
    },
  ] as User[],

  bookings: [
    {
      id: "booking-1",
      userId: "1",
      eventName: "Sarah's Wedding Reception",
      eventType: "wedding",
      guestCount: 150,
      date: "2025-07-15",
      startTime: "6:00 PM",
      endTime: "11:00 PM",
      specialRequests: "Need extra lighting for photography",
      status: "confirmed",
      submittedAt: "2025-05-15T10:00:00Z",
      total: "$3,500",
      userInfo: {
        name: "Demo User",
        email: "user@oneestela.com",
        phone: "(555) 123-4567",
      },
    },
    {
      id: "booking-2",
      userId: "1",
      eventName: "Company Annual Meeting",
      eventType: "corporate",
      guestCount: 80,
      date: "2025-08-22",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      specialRequests: "Need projector and microphone setup",
      status: "pending",
      submittedAt: "2025-05-20T14:30:00Z",
      total: "$2,200",
      userInfo: {
        name: "Demo User",
        email: "user@oneestela.com",
        phone: "(555) 123-4567",
      },
    },
  ] as Booking[],

  messages: [
    {
      id: "msg-1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 123-4567",
      eventType: "Wedding",
      eventDate: "2025-08-15",
      message: "Hi, I'm interested in booking your venue for my wedding. Could you please send me more information about packages and pricing?",
      submittedAt: "2025-05-20T10:30:00Z",
      status: "new",
      priority: "high",
    },
    {
      id: "msg-2",
      name: "Michael Chen",
      email: "m.chen@company.com",
      phone: "(555) 987-6543",
      eventType: "Corporate",
      eventDate: "2025-07-10",
      message: "We're planning a corporate retreat for 80 people. Do you have availability and what are your catering options?",
      submittedAt: "2025-05-19T14:15:00Z",
      status: "read",
      priority: "medium",
    },
  ] as ContactMessage[],

  paymentProofs: [] as PaymentProof[],
}