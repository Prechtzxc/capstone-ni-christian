"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Button } from "@shared/components/ui/button"
import { Badge } from "@shared/components/ui/badge"
import { Calendar, Clock, Users, Download, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@shared/hooks/use-toast"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { useBookings } from "@client/contexts/booking-context"
import { usePaymentProof } from "@admin/contexts/payment-proof-context"
import { CancellationDialog } from "@admin/components/cancellation-dialog"
import { ModifyBookingDialog } from "@admin/components/modify-booking-dialog"
import { PaymentProofUpload } from "@admin/components/payment-proof-upload"

interface TransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionsDialog({ open, onOpenChange }: TransactionsDialogProps) {
  const { user } = useAuth()
  const { getUserBookings, cancelBooking, modifyBooking } = useBookings()
  const { getPaymentProofByBooking } = usePaymentProof()
  const { toast } = useToast()
  const [showCancellationDialog, setShowCancellationDialog] = useState(false)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [showPaymentUpload, setShowPaymentUpload] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const userBookings = user ? getUserBookings(user.id) : []

  const handleDownloadReceipt = (transactionId: string) => {
    toast({
      title: "Receipt downloaded",
      description: `Receipt for ${transactionId} has been downloaded.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking)
    setShowCancellationDialog(true)
  }

  const handleModifyBooking = (booking: any) => {
    setSelectedBooking(booking)
    setShowModifyDialog(true)
  }

  const handleUploadPaymentProof = (booking: any) => {
    setSelectedBooking(booking)
    setShowPaymentUpload(true)
  }

  const confirmCancellation = () => {
    if (selectedBooking) {
      cancelBooking(selectedBooking.id)
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      })
      setShowCancellationDialog(false)
    }
  }

  const saveModifiedBooking = (updatedBooking: any) => {
    modifyBooking(updatedBooking.id, updatedBooking)
    toast({
      title: "Booking updated",
      description: "Your booking has been successfully updated.",
    })
    setShowModifyDialog(false)
  }

  const getPaymentStatus = (booking: any) => {
    const paymentProof = getPaymentProofByBooking(booking.id)
    if (!paymentProof) return null

    return {
      status: paymentProof.status,
      icon: paymentProof.status === "verified" ? CheckCircle : paymentProof.status === "rejected" ? AlertCircle : Clock,
      color:
        paymentProof.status === "verified"
          ? "text-green-500"
          : paymentProof.status === "rejected"
            ? "text-red-500"
            : "text-yellow-500",
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Transactions</DialogTitle>
          <DialogDescription>View all your past and upcoming reservations</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {userBookings.map((booking) => {
            const paymentStatus = getPaymentStatus(booking)

            return (
              <div key={booking.id} className="rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{booking.eventName}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {paymentStatus && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <paymentStatus.icon className={`h-3 w-3 ${paymentStatus.color}`} />
                            <span>Payment {paymentStatus.status}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {booking.guestCount} guests
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(booking.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Event Type: {booking.eventType}</p>
                        {booking.specialRequests && (
                          <p className="text-sm text-gray-600">Special Requests: {booking.specialRequests}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{booking.total || "Pending Quote"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(booking.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>

                  {/* Payment Proof Upload Button */}
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUploadPaymentProof(booking)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {getPaymentProofByBooking(booking.id) ? "View Payment Proof" : "Upload Payment Proof"}
                    </Button>
                  )}

                  {booking.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => handleModifyBooking(booking)}>
                      Modify Booking
                    </Button>
                  )}
                  {(booking.status === "confirmed" || booking.status === "pending") &&
                    new Date(booking.date) > new Date() && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking)}>
                        Cancel Booking
                      </Button>
                    )}
                </div>
              </div>
            )
          })}
          {userBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No bookings found</p>
              <p className="text-sm text-gray-400">Your booking requests will appear here once submitted.</p>
            </div>
          )}
        </div>
      </DialogContent>

      <CancellationDialog
        open={showCancellationDialog}
        onOpenChange={setShowCancellationDialog}
        booking={selectedBooking}
        onConfirm={confirmCancellation}
      />

      <ModifyBookingDialog
        open={showModifyDialog}
        onOpenChange={setShowModifyDialog}
        booking={selectedBooking}
        onSave={saveModifiedBooking}
      />

      <PaymentProofUpload
        open={showPaymentUpload}
        onOpenChange={setShowPaymentUpload}
        bookingId={selectedBooking?.id || ""}
      />
    </Dialog>
  )
}
