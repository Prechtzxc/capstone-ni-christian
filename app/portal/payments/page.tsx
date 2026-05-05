"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { usePaymentProof } from "@/components/payment-proof-context"
import { useBookings } from "@/components/booking-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Receipt, Banknote, Calendar, CreditCard, Loader2, FileEdit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TransactionsPage() {
  const { user } = useAuth()
  const { paymentProofs, uploadPaymentProof, updatePaymentProof } = usePaymentProof()
  const { getUserBookings } = useBookings()
  const { toast } = useToast()
  
  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState("")
  const [paymentType, setPaymentType] = useState("Full Payment") // New state for Down/Full
  const [method, setMethod] = useState("Bank Transfer") // Restricted to Bank Transfer / Cash
  const [reference, setReference] = useState("")
  const [file, setFile] = useState<File | null>(null)

  if (!user) return null

  const myBookings = getUserBookings(user.id)
  const myBookingIds = myBookings.map(b => b.id)
  const myTransactions = paymentProofs.filter(p => myBookingIds.includes(p.bookingId))

  const getEventName = (bookingId: string) => {
    const booking = myBookings.find(b => b.id === bookingId)
    return booking ? booking.eventName : "Event Payment"
  }

  // --- AMOUNT COMPUTATION LOGIC ---
  const selectedBookingData = myBookings.find(b => b.id === selectedBooking)
  // Kinukuha ang presyo sa event data. Naglagay ako ng fallback na 10000 at 5000 kung sakaling wala pa sa DB niyo.
  const eventFullPrice = selectedBookingData?.price || selectedBookingData?.totalPrice || 10000 
  const eventDownPayment = selectedBookingData?.downPayment || (eventFullPrice / 2) // Default 50% kung walang specific downpayment sa DB
  
  const amountToPay = paymentType === "Down Payment" ? eventDownPayment : eventFullPrice

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const openEditModal = (transaction: any) => {
    setEditingId(transaction.id)
    setSelectedBooking(transaction.bookingId)
    
    // Check kung downpayment ba o full based sa stored amount (optional enhancement)
    const storedAmount = Number(transaction.paymentAmount.replace(/[^0-9.]/g, ''))
    if (selectedBookingData && storedAmount < (selectedBookingData.price || 10000)) {
      setPaymentType("Down Payment")
    } else {
      setPaymentType("Full Payment")
    }

    setMethod(transaction.paymentMethod === "Cash" ? "Cash" : "Bank Transfer")
    setReference(transaction.paymentReference || "")
    setFile(null)
    setShowEditModal(true)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: Pag Bank Transfer, kailangan ng file. Pag Cash, okay lang walang file.
    if (!selectedBooking || (method === "Bank Transfer" && !file && !editingId)) {
      toast({
        title: "Missing fields",
        description: method === "Bank Transfer" ? "Please fill out all required fields and upload a receipt." : "Please select an event.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        paymentMethod: method,
        paymentType: paymentType, // Para ma-save din sa backend kung Down o Full
        paymentAmount: `₱${amountToPay}`, 
        paymentDate: new Date().toISOString().split('T')[0],
        paymentReference: method === "Bank Transfer" ? reference : "CASH-PAYMENT"
      }

      if (editingId && updatePaymentProof) {
        await updatePaymentProof(editingId, file, payload)
        toast({
          title: "Payment Resubmitted!",
          description: "Your corrected payment proof has been sent for verification.",
        })
      } else {
        await uploadPaymentProof(selectedBooking, file, payload)
        toast({
          title: "Payment Submitted!",
          description: method === "Cash" ? "Your cash payment intent has been logged." : "Your payment proof has been uploaded.",
        })
      }
      
      // Reset
      setShowUploadModal(false)
      setShowEditModal(false)
      setFile(null)
      setReference("")
      setSelectedBooking("")
      setEditingId(null)
      setPaymentType("Full Payment")
      setMethod("Bank Transfer")
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error processing your receipt. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* TINANGGAL NA YUNG UPLOAD PAYMENT BUTTON DITO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-gray-500 mt-1">Review your payment history and submit new payment proofs.</p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>A complete record of all your payments.</CardDescription>
        </CardHeader>
        <CardContent>
          {myTransactions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-sm">
                You haven't submitted any payments yet. Once you upload a receipt, it will appear here.
              </p>
              <Button variant="outline" onClick={() => {
                setEditingId(null);
                setShowUploadModal(true);
              }}>
                Submit a Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DITO MAG RERENDER YUNG TRANSACTIONS PAG MERON NA */}
              {myTransactions.map((transaction) => {
                const displayAmount = transaction.paymentAmount.replace('$', '₱')
                
                return (
                  <div key={transaction.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full hidden sm:flex ${transaction.status === 'rejected' ? 'bg-red-50' : 'bg-green-50'}`}>
                        <Banknote className={`h-6 w-6 ${transaction.status === 'rejected' ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {getEventName(transaction.bookingId)}
                        </h4>
                        <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Paid on: {transaction.paymentDate}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Method: {transaction.paymentMethod}
                          </span>
                        </div>
                        
                        {transaction.status === "rejected" && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => openEditModal(transaction)}>
                              <FileEdit className="w-3 h-3 mr-2" />
                              Fix & Resubmit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
                      <span className="text-xl font-bold text-gray-900">
                        {displayAmount}
                      </span>
                      <Badge 
                        variant={
                          transaction.status === "verified" ? "default" :
                          transaction.status === "pending" ? "secondary" : 
                          transaction.status === "resubmitted" ? "secondary" : "destructive"
                        }
                        className="mt-1 capitalize"
                      >
                        {transaction.status === "resubmitted" ? "Resubmitted" : transaction.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL PARA SA PAYMENT */}
      <Dialog 
        open={showUploadModal || showEditModal} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowUploadModal(false)
            setShowEditModal(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Resubmit Payment Proof" : "Submit Payment Proof"}</DialogTitle>
            <DialogDescription>
              {editingId 
                ? "Update your payment details and attach a new valid receipt below."
                : "Fill out the details for your transaction."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
            
            {/* EVENT SELECTION */}
            <div className="space-y-2">
              <Label htmlFor="booking">Select Event *</Label>
              <select
                id="booking"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:bg-gray-100 disabled:opacity-50"
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                required
                disabled={!!editingId}
              >
                <option value="" disabled>Choose an event to pay for...</option>
                {myBookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.eventName} ({b.date})</option>
                ))}
              </select>
            </div>

            {/* PAYMENT TYPE (Full or Down) */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <select
                id="paymentType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                required
              >
                <option value="Full Payment">Full Payment</option>
                <option value="Down Payment">Down Payment</option>
              </select>
            </div>

            {/* PAYMENT METHOD (Pinalaki, walang grid) */}
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <select
                id="method"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash (In-person)</option>
              </select>
            </div>

            {/* FIXED AMOUNT */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid (₱) *</Label>
              <Input
                id="amount"
                type="text"
                value={selectedBooking ? amountToPay.toLocaleString() : "0"}
                readOnly
                className="bg-gray-100 cursor-not-allowed font-semibold text-gray-700"
              />
              <p className="text-xs text-muted-foreground">
                {selectedBooking 
                  ? (paymentType === "Down Payment" ? "Fixed down payment for this event." : "Total price of this event.")
                  : "Please select an event first."}
              </p>
            </div>

            {/* CONDITIONAL RENDERING: Lalabas lang kapag Bank Transfer ang pinili */}
            {method === "Bank Transfer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number (Optional)</Label>
                  <Input
                    id="reference"
                    placeholder="e.g. GCASH-12345678"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload New Receipt {editingId ? "*" : "*"}</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required={!editingId} 
                    className="cursor-pointer"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                editingId ? "Update & Resubmit" : "Submit Payment"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}