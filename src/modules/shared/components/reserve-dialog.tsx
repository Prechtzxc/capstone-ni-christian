"use client"

import type { React } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

// Ensure these point to your root components folder!
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReserveDialog({ open, onOpenChange }: ReserveDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { bookings, addBooking } = useBookings()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "wedding", // default
    guestCount: "",
    date: "",
    startTime: "",
    endTime: "",
    specialRequests: "",
  })

  // Helper to get today's date in YYYY-MM-DD format for the min date attribute
  const today = new Date().toISOString().split("T")[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Authentication Check
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to book an event.",
        variant: "destructive",
      })
      onOpenChange(false)
      return
    }

    // 2. Conflict Prevention (Double Booking Check)
    const isDateTaken = bookings.some(
      (b) => 
        b.date === formData.date && 
        (b.status === "confirmed" || b.status === "pending")
    )

    if (isDateTaken) {
      toast({
        title: "Date Unavailable",
        description: "Sorry, this date is already booked. Please select another day.",
        variant: "destructive",
      })
      return
    }

    // 3. Process Booking
    setIsLoading(true)

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500))

    addBooking({
      userId: user.id,
      eventName: formData.eventName,
      eventType: formData.eventType,
      guestCount: parseInt(formData.guestCount),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      specialRequests: formData.specialRequests,
      status: "pending", // All new bookings start as pending
      userInfo: {
        name: user.name,
        email: user.email,
        phone: "(555) 000-0000", // In a real app, you'd pull this from a full user profile
      },
    })

    setIsLoading(false)
    onOpenChange(false)

    // Reset form
    setFormData({
      eventName: "",
      eventType: "wedding",
      guestCount: "",
      date: "",
      startTime: "",
      endTime: "",
      specialRequests: "",
    })

    toast({
      title: "Booking Submitted!",
      description: "We have received your request and will review it shortly.",
    })

    // Optionally redirect the user to their transactions page so they can see it!
    // router.push("/transactions") 
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reserve One Estela Place</DialogTitle>
          <DialogDescription>
            Fill out the details below to request a reservation. Our team will review your request and get back to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              placeholder="e.g., Sarah's 25th Birthday"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <select
                id="eventType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.eventType}
                onChange={handleChange}
                required
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestCount">Estimated Guests</Label>
              <Input
                id="guestCount"
                type="number"
                min="1"
                max="250"
                placeholder="Max 250"
                value={formData.guestCount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Event Date</Label>
            <Input
              id="date"
              type="date"
              min={today} // Prevents past dates
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests & Details</Label>
            <Textarea
              id="specialRequests"
              placeholder="Tell us about catering needs, setup preferences, etc."
              className="resize-none"
              rows={3}
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Reservation Request"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}