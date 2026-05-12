"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogClose, DialogHeader } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { 
  UploadCloud, CheckCircle2, Clock, FileImage, 
  MapPin, X, XCircle, Eye, Wallet, Loader2 
} from "lucide-react"

import { PaymentProofProvider, usePaymentProof } from "@/src/modules/admin/contexts/payment-proof-context"
import { useBookings } from "@/src/modules/client/contexts/booking-context"
import { useAuth } from "@/src/modules/shared/auth/auth-context"

function PaymentsContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { uploadPaymentProof, updatePaymentProof, paymentProofs } = usePaymentProof()
  const { bookings, updateBookingStatus } = useBookings()

  const [bookingToPay, setBookingToPay] = useState<any>(null)
  const [paymentMode, setPaymentMode] = useState<"initial" | "balance">("initial")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [paymentType, setPaymentType] = useState("full")
  const [paymentMethod, setPaymentMethod] = useState("bank")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [editingProofId, setEditingProofId] = useState<string | null>(null)
  
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  const myBookings = user ? bookings.filter(b => b.userId === user.id) : []
  const myBookingIds = myBookings.map(b => b.id)
  const myTransactions = paymentProofs.filter(p => myBookingIds.includes(p.bookingId))

  const pendingTransactions = myTransactions.filter(p => p.status !== "verified")
  const completedTransactions = myTransactions.filter(p => p.status === "verified")

  const actionableBookings = myBookings.map(booking => {
    const bookingTxns = myTransactions.filter(t => t.bookingId === booking.id)
    const hasPendingReview = bookingTxns.some(t => t.status === "pending" || t.status === "resubmitted")
    const hasRejected = bookingTxns.some(t => t.status === "rejected")
    const verifiedDown = bookingTxns.some(t => t.status === "verified" && t.paymentType === "down")
    const verifiedBalance = bookingTxns.some(t => t.status === "verified" && t.paymentType === "balance")

    let action = "none"
    if (booking.status === "pending" && !hasPendingReview && !hasRejected) action = "initial"
    else if (booking.status === "confirmed" && verifiedDown && !verifiedBalance && !hasPendingReview && !hasRejected) action = "balance"
    return { ...booking, actionNeeded: action }
  }).filter(b => b.actionNeeded !== "none")

  // Dynamic computation ng babayaran
  const displayAmount = paymentMode === "balance" ? "₱ 750.00" : (paymentType === "full" ? "₱ 1,500.00" : "₱ 750.00")

  const handleViewImage = (proof: any) => {
    if (proof.paymentMethod === 'cash') return
    const isBrokenUrl = !proof.fileUrl || proof.fileUrl.startsWith("blob:")
    setSelectedImage(isBrokenUrl ? "/placeholder.jpg" : proof.fileUrl)
    setShowImageDialog(true)
  }

  const handleEditRejected = (proof: any) => {
    const relatedBooking = myBookings.find(b => b.id === proof.bookingId)
    setEditingProofId(proof.id)
    setBookingToPay(relatedBooking)
    setPaymentMode(proof.paymentType === "balance" ? "balance" : "initial")
    setPaymentType(proof.paymentType || "full")
    setPaymentMethod(proof.paymentMethod)
    setReferenceNumber(proof.paymentReference === 'CASH-PAYMENT' ? "" : proof.paymentReference)
    setShowUploadModal(true)
  }

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookingToPay) {
      toast({ title: "Error", description: "No booking selected.", variant: "destructive" })
      return
    }

    let uploadFile = file
    if (paymentMethod === 'cash') {
      uploadFile = new File(["cash"], "cash.txt", { type: "text/plain" })
    }

    if (!uploadFile || (paymentMethod !== 'cash' && !referenceNumber.trim())) {
      toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" })
      return
    }

    setIsUploading(true)

    try {
      const details = {
        paymentMethod, 
        paymentAmount: displayAmount,
        paymentDate: new Date().toISOString(),
        paymentReference: paymentMethod === 'cash' ? 'CASH-PAYMENT' : referenceNumber.trim(),
        paymentType: paymentMode === "balance" ? "balance" : paymentType 
      }

      if (editingProofId) {
        await updatePaymentProof(editingProofId, uploadFile, details)
        toast({ title: "Resubmitted!", description: "Sent to admin for evaluation.", className: "bg-blue-600 text-white" })
      } else {
        await uploadPaymentProof(bookingToPay.id, uploadFile, details)
        toast({ title: "Success!", description: "Payment submitted for verification.", className: "bg-emerald-600 text-white" })
      }

      if (paymentMode === "initial") {
        updateBookingStatus(bookingToPay.id, "verifying")
      }
      
      setShowUploadModal(false)
      setBookingToPay(null)
      setEditingProofId(null)
      setFile(null)
      setPaymentMethod("bank")
      setReferenceNumber("")

    } catch (error) { 
      toast({ title: "Upload Failed", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 pb-24 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Payments</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Manage your event bills and transaction history.</p>
        </div>
      </div>

      {/* OUTSTANDING BILLS */}
      {actionableBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 px-1 uppercase tracking-widest">Unpaid Bills</h2>
          <div className="grid gap-3">
            {actionableBookings.map((u) => (
              <Card key={u.id} className="border-none shadow-sm rounded-[20px] bg-white overflow-hidden">
                <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1.5">
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase">
                      {u.actionNeeded === "balance" ? "Final Balance" : "Reservation Fee"}
                    </Badge>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">{u.eventName}</h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {u.venue}</p>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 md:border-none">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Due</p>
                      <p className="text-xl font-black text-slate-900">{u.actionNeeded === "balance" ? "₱750.00" : "₱1,500.00"}</p>
                    </div>
                    <Button 
                      onClick={() => { 
                        setBookingToPay(u); 
                        setPaymentMode(u.actionNeeded);
                        // Reset to default "full" when opening modal if it's an initial payment
                        if (u.actionNeeded !== "balance") setPaymentType("full");
                        setShowUploadModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 font-bold shadow-sm shrink-0"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS HISTORY */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-slate-900 px-1 uppercase tracking-widest">History</h2>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-slate-200/50 p-1 rounded-xl w-full mb-4">
            <TabsTrigger value="pending" className="flex-1 rounded-lg font-bold text-xs">Reviewing ({pendingTransactions.length})</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-lg font-bold text-xs">Paid ({completedTransactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            {pendingTransactions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-[20px] shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Pending Payments</p>
                </div>
            ) : (
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {pendingTransactions.map((p) => (
                  <div key={p.id} className={`p-4 md:p-5 flex flex-col gap-3 ${p.status === 'rejected' ? 'bg-rose-50/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                          {p.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 truncate max-w-[150px] md:max-w-xs">{myBookings.find(b => b.id === p.bookingId)?.eventName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {p.paymentType} • {p.paymentMethod === 'cash' ? 'Cash' : `Ref: ${p.paymentReference}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-slate-900">{p.paymentAmount}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${p.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {p.status === 'resubmitted' ? 'Reviewing' : p.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                      {p.status === 'rejected' && p.adminNote ? (
                        <p className="text-[11px] font-medium text-rose-600 line-clamp-1 flex-1 mr-2 bg-rose-50 px-2 py-1 rounded-md">Note: {p.adminNote}</p>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                      
                      <div className="flex gap-2 shrink-0">
                        {p.paymentMethod !== 'cash' && (
                          <Button variant="ghost" size="sm" onClick={() => handleViewImage(p)} className="h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs px-3">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        )}
                        {p.status === 'rejected' && (
                          <Button size="sm" onClick={() => handleEditRejected(p)} className="h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4">
                            Resubmit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedTransactions.length === 0 ? (
                 <div className="p-8 text-center bg-white rounded-[20px] shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Completed Payments</p>
                </div>
            ) : (
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {completedTransactions.map((p) => (
                  <div key={p.id} className="p-4 md:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 truncate max-w-[140px] md:max-w-xs">{myBookings.find(b => b.id === p.bookingId)?.eventName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                           {p.paymentType} • {p.paymentMethod === 'cash' ? 'Cash' : p.paymentReference}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-black text-slate-900">{p.paymentAmount}</p>
                      {p.paymentMethod !== 'cash' && (
                        <Button variant="ghost" size="sm" onClick={() => handleViewImage(p)} className="h-6 text-[10px] rounded-md bg-slate-50 text-slate-500 font-bold px-2">
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* OVERFLOW-FIXED MOBILE MODAL */}
      <Dialog open={showUploadModal} onOpenChange={(open) => {
        if (!open) { setEditingProofId(null); setBookingToPay(null); }
        setShowUploadModal(open)
      }}>
        <DialogContent className="w-[95vw] max-w-[420px] p-0 bg-white rounded-[24px] overflow-hidden border-none shadow-2xl max-h-[90dvh] flex flex-col [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>Submit your payment details here.</DialogDescription>
          </DialogHeader>

          {/* Fixed Sticky Header ng Modal */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
             <h2 className="text-lg font-black text-slate-900 tracking-tight">Pay Bill</h2>
             <DialogClose className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                 <X className="w-4 h-4 text-slate-500" />
             </DialogClose>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            
            <div className="bg-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden flex justify-between items-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Amount Due</p>
                 <p className="text-3xl font-black text-white">{displayAmount}</p>
               </div>
               <Badge className="relative z-10 bg-white/10 text-white border-none font-bold text-[10px] uppercase shadow-none">{paymentMode}</Badge>
            </div>

            <form onSubmit={handleUploadReceipt} className="space-y-5 pb-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200 text-xs font-bold focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl z-[99999]">
                      <SelectItem value="bank">Bank/E-Wallet</SelectItem>
                      <SelectItem value="cash">Walk-in Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Payment Plan</label>
                  <Select value={paymentMode === "balance" ? "balance" : paymentType} onValueChange={setPaymentType} disabled={paymentMode === "balance"}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200 text-xs font-bold focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl z-[99999]">
                      {paymentMode === "balance" ? (
                        <SelectItem value="balance">Balance Due</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="full">Full Payment</SelectItem>
                          <SelectItem value="down">Downpayment</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentMethod !== 'cash' ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Reference Number</label>
                    <Input required value={referenceNumber} onChange={e=>setReferenceNumber(e.target.value)} placeholder="Enter Ref ID" className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold placeholder:font-medium placeholder:text-slate-400 focus-visible:ring-blue-500" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Upload Receipt</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                      <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {file ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5"/></div>
                          <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{file.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                          <UploadCloud className="w-8 h-8 mb-1 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">Tap here to upload screenshot</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <Wallet className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    <strong>Walk-in Cash:</strong> No upload needed. Please settle this amount at our office to confirm your booking.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={isUploading} className="w-full h-14 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg active:scale-95 transition-all">
                {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Payment"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="w-[95vw] max-w-3xl h-[85dvh] p-2 bg-slate-900 rounded-3xl border-none shadow-none flex flex-col justify-center items-center [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>View Receipt</DialogTitle>
            <DialogDescription>A full view of the payment receipt.</DialogDescription>
          </DialogHeader>
          
          <DialogClose className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all text-white">
             <X className="w-5 h-5" />
          </DialogClose>
          
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2">
            <img 
              src={selectedImage} 
              alt="Payment proof" 
              className="max-w-full max-h-full object-contain rounded-xl" 
              onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} 
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default function PaymentsPage() {
  return (
    <PaymentProofProvider>
      <PaymentsContent />
    </PaymentProofProvider>
  )
}