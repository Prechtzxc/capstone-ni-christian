"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  Calendar as CalendarIcon, 
  LayoutDashboard,
  Clock,
  MessageSquare,
  MapPin,
  BellRing,
  ArrowRight,
  CalendarCheck
} from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  // UPDATE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(currentTime)

  // MOCK DATA: PENDING REQUESTS (Action Center)
  const pendingRequests = [
    { id: 101, client: "Maria Clara", event: "18th Birthday", venue: "Grand Ballroom", date: "Oct 15, 2026", time: "05:00 PM - 10:00 PM", submitted: "15 mins ago" },
    { id: 102, client: "Peter Parker", event: "Team Building", venue: "Co-working Space", date: "Sep 20, 2026", time: "09:00 AM - 03:00 PM", submitted: "1 hour ago" },
    { id: 103, client: "John Wilson", event: "Business Meeting", venue: "Conference Hall", date: "Sep 25, 2026", time: "01:00 PM - 04:00 PM", submitted: "3 hours ago" }
  ]

  // MOCK DATA: UPCOMING APPROVED EVENTS
  const upcomingEvents = [
    { id: 201, client: "Anna Reyes", event: "Wedding Reception", venue: "Garden Pavilion", date: "Today", time: "06:00 PM - 11:00 PM" },
    { id: 202, client: "ABC Corp", event: "Year-End Party", venue: "Grand Ballroom", date: "Tomorrow", time: "05:00 PM - 12:00 AM" },
    { id: 203, client: "Sarah Geronimo", event: "Album Launch", venue: "Conference Hall", date: "May 10, 2026", time: "02:00 PM - 06:00 PM" }
  ]

  // MOCK DATA: RECENT INQUIRIES (Chat System)
  const recentInquiries = [
    { id: 1, name: "Juan Dela Cruz", message: "Hi, is the Garden Pavilion available next week?", time: "10m ago", unread: true },
    { id: 2, name: "Maria Clara", message: "Thank you for approving our booking!", time: "1h ago", unread: true },
    { id: 3, name: "Company XYZ", message: "Do you offer catering packages?", time: "3h ago", unread: false },
    { id: 4, name: "Peter Parker", message: "Can we extend our hours?", time: "1d ago", unread: false }
  ]

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
          </div>
          <p className="text-slate-500 font-medium">Welcome back! Here's the latest update on your bookings and inquiries.</p>
        </div>
        
        <div className="flex items-center shrink-0">
          <Badge variant="outline" className="bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm border-gray-200 rounded-xl flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            {formattedDate}
          </Badge>
        </div>
      </div>

      {/* TOP STATS CARDS - Ginawa ko ng 3 columns para sakop ang 100% width! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* CLICKABLE CARD: PENDING APPROVALS */}
        <Card 
          onClick={() => router.push('/dashboard/bookings')}
          className="border-none shadow-sm bg-gradient-to-br from-white to-amber-50/30 overflow-hidden relative cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</p>
              <div className="p-2.5 bg-amber-100/50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{pendingRequests.length}</h3>
                <p className="text-sm font-bold text-amber-600">Action required</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>

        {/* CLICKABLE CARD: UPCOMING EVENTS */}
        <Card 
          onClick={() => router.push('/dashboard/bookings')}
          className="border-none shadow-sm bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Events Today</p>
              <div className="p-2.5 bg-blue-100/50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{upcomingEvents.length}</h3>
                <p className="text-sm font-bold text-blue-600">Approved bookings</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>

        {/* CLICKABLE CARD: UNREAD MESSAGES */}
        <Card 
          onClick={() => router.push('/dashboard/chat')}
          className="border-none shadow-sm bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden relative cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiries</p>
              <div className="p-2.5 bg-indigo-100/50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{recentInquiries.filter(i => i.unread).length}</h3>
                <p className="text-sm font-bold text-indigo-600">Unread messages</p>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* MAIN SECTION - TWO COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start w-full">
        
        {/* LEFT COLUMN: BOOKINGS MANAGEMENT */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* ACTION CENTER - PENDING BOOKINGS */}
          <Card className="border border-amber-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-amber-50 pb-4 flex flex-row items-center justify-between bg-amber-50/30">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-500" /> Action Center
                </CardTitle>
                <CardDescription className="text-amber-700/70 font-medium">Booking submissions needing your approval.</CardDescription>
              </div>
              <Button 
                size="sm"
                onClick={() => router.push('/dashboard/bookings')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
              >
                View All Bookings <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center font-black text-amber-600 text-sm border border-amber-100 shrink-0">
                        {req.client.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{req.client}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500 mt-0.5">
                          <span className="flex items-center text-blue-600 font-bold">
                            <MapPin className="w-3 h-3 mr-1" /> {req.venue}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" /> {req.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className="text-xs font-bold text-amber-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {req.submitted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: RECENT INQUIRIES (CHAT) */}
        <div className="xl:col-span-1">
          <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
            <CardHeader className="border-b border-slate-50 pb-4 bg-white flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" /> Recent Inquiries
                </CardTitle>
                <CardDescription>Messages from clients.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {recentInquiries.map((chat) => (
                  <div key={chat.id} className={`p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${chat.unread ? 'bg-indigo-50/30' : ''}`} onClick={() => router.push('/dashboard/chat')}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${chat.unread ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {chat.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={`text-sm truncate ${chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{chat.name}</h4>
                        <span className={`text-[10px] whitespace-nowrap ${chat.unread ? 'font-bold text-indigo-600' : 'text-slate-400'}`}>{chat.time}</span>
                      </div>
                      <p className={`text-xs truncate ${chat.unread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                        {chat.message}
                      </p>
                    </div>
                    {chat.unread && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-50">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/chat')}
                  className="w-full text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View All Inquiries <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}