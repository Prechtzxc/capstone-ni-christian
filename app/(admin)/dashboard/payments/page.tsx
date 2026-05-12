"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { usePaymentProof } from "@/src/modules/admin/contexts/payment-proof-context"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"
import {
  FileImage, CheckCircle, XCircle, Clock, Eye, Download, CreditCard, Calendar, User, DollarSign, Receipt, Wallet, UploadCloud, AlertCircle
} from "lucide-react"

export default function PaymentsPage() {
  const { getAllPaymentProofs, verifyPaymentProof, rejectPaymentProof } = usePaymentProof()
  const { bookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()

  const [selectedProof, setSelectedProof] = useState<any>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  // FIX: Dinagdag ang "incomplete" action
  const [reviewAction, setReviewAction] = useState<"verify" | "reject" | "incomplete">("verify")
  const [adminNote, setAdminNote] = useState("")
  
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  const allProofs = getAllPaymentProofs()
  const pendingProofs = allProofs.filter(p => p.status === "pending" || p.status === "resubmitted")
  const verifiedProofs = allProofs.filter((proof) => proof.status === "verified")
  const rejectedProofs = allProofs.filter((proof) => proof.status === "rejected")

  const handleReviewProof = (proof: any, action: "verify" | "reject" | "incomplete") => {
    setSelectedProof(proof)
    setReviewAction(action)
    setAdminNote("")
    setShowReviewDialog(true)
  }

  const handleSubmitReview = () => {
    if (!selectedProof) return
    const adminId = "admin-1" 

    if (reviewAction === "verify") {
      verifyPaymentProof(selectedProof.id, adminId, adminNote)
      // Pag approve, magiging CONFIRMED na (Downpayment is fully paid)
      updateBookingStatus(selectedProof.bookingId, "confirmed" as any)

      window.dispatchEvent(new CustomEvent("paymentVerifiedByAdmin", { detail: selectedProof.bookingId }));
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("storage"));

      toast({
        title: "Payment Verified",
        description: "Payment has been verified. The client's booking is now Confirmed.",
        className: "bg-emerald-600 text-white"
      })
    } else if (reviewAction === "incomplete") {
      verifyPaymentProof(selectedProof.id, adminId, adminNote)
      // I-ma-mark as INCOMPLETE DOWNPAYMENT ang status ng booking
      updateBookingStatus(selectedProof.bookingId, "incomplete_downpayment" as any)

      window.dispatchEvent(new CustomEvent("paymentVerifiedByAdmin", { detail: selectedProof.bookingId }));
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("storage"));

      toast({
        title: "Incomplete Downpayment",
        description: "Payment accepted but marked as incomplete. Client needs to pay the remaining downpayment balance.",
        className: "bg-amber-600 text-white"
      })
    } else {
      if (!adminNote.trim()) {
        toast({
          title: "Note required",
          description: "Please provide a reason for rejecting the payment proof.",
          variant: "destructive",
        })
        return
      }
      rejectPaymentProof(selectedProof.id, adminId, adminNote)
      updateBookingStatus(selectedProof.bookingId, "pending" as any)
      
      window.dispatchEvent(new CustomEvent("paymentRejectedByAdmin", { detail: selectedProof.bookingId }));
      window.dispatchEvent(new Event("bookingsUpdated"));

      toast({
        title: "Payment Rejected",
        description: "Payment proof has been rejected. Client has been notified.",
        variant: "destructive",
      })
    }
    setShowReviewDialog(false)
    setSelectedProof(null)
    setAdminNote("")
  }

  const handleViewImage = (proof: any) => {
    if (proof.paymentMethod === 'cash') {
      toast({ title: "Cash Verification", description: "This is a cash declaration. There is no image attached." })
      return;
    }
    const isBrokenUrl = !proof.fileUrl || proof.fileUrl.startsWith("blob:");
    setSelectedImage(isBrokenUrl ? "/placeholder.jpg" : proof.fileUrl);
    setShowImageDialog(true);
  }

  const handleDownloadFile = (proof: any) => {
    if (proof.paymentMethod === 'cash') return;
    const isBrokenUrl = !proof.fileUrl || proof.fileUrl.startsWith("blob:");
    const link = document.createElement("a")
    link.href = isBrokenUrl ? "/placeholder.jpg" : proof.fileUrl
    link.download = proof.fileName || "receipt.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-6 w-6" />
      case "rejected": return <XCircle className="h-6 w-6" />
      case "resubmitted": return <UploadCloud className="h-6 w-6" />
      case "pending": default: return <Clock className="h-6 w-6" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-emerald-100 text-emerald-700"
      case "rejected": return "bg-rose-100 text-rose-700"
      case "resubmitted": return "bg-blue-100 text-blue-700"
      case "pending": default: return "bg-amber-100 text-amber-700"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const PaymentProofCard = ({ proof }: { proof: any }) => {
    const booking = bookings?.find((b: any) => b.id === proof.bookingId)

    // SMART BALANCE DETECTOR PARA SA ADMIN
    const bookingTxns = allProofs.filter(p => p.bookingId === proof.bookingId && p.status === 'verified');
    let totalPaid = 0;
    
    // I-co-compute niya lahat ng VERIFIED na bayad mula sa customer na ito
    bookingTxns.forEach(t => {
       const amt = parseInt(t.paymentAmount?.toString().replace(/[^0-9]/g, '')) || 0;
       if (amt > 0) {
         totalPaid += amt;
       } else {
         // Fallback kung text yung nilagay dati
         if (t.paymentType === 'full') totalPaid += 10000;
         else if (t.paymentType === 'down' || t.paymentType === 'balance') totalPaid += 5000;
       }
    });

    const totalCost = 10000; // Mock total cost, pwedeng palitan kapag dynamic na
    const requiredDownpayment = 5000; 

    const remainingDownpayment = Math.max(0, requiredDownpayment - totalPaid);
    const remainingEventBalance = Math.max(0, totalCost - totalPaid);

    const isNeedsAction = proof.status === 'pending' || proof.status === 'resubmitted';

    return (
      <Card className="mb-6 overflow-hidden border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300">
        <div className={`p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isNeedsAction ? (proof.status === 'resubmitted' ? 'bg-blue-50/50' : 'bg-amber-50/50') : 'bg-slate-50/50'}`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white 
              ${isNeedsAction ? (proof.status === 'resubmitted' ? 'text-blue-500 border border-blue-200' : 'text-amber-500 border border-amber-200') : 
                proof.status === 'verified' ? 'text-emerald-500 border border-emerald-200' : 'text-rose-500 border border-rose-200'}`}>
               {getStatusIcon(proof.status)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <CardTitle className="text-lg font-bold text-slate-900">{booking?.eventName || "Event Payment"}</CardTitle>
                 {booking?.status === "incomplete_downpayment" && (
                    <Badge className="bg-rose-500 text-white hover:bg-rose-500 border-none font-bold shadow-none px-2 py-0">INCOMPLETE DP</Badge>
                 )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1.5">
                 {remainingDownpayment > 0 ? (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold shadow-none px-2 py-0">
                      Rem. Downpayment: ₱{remainingDownpayment.toLocaleString()}
                    </Badge>
                 ) : remainingEventBalance > 0 ? (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold shadow-none px-2 py-0">
                      DP Paid • Rem. Event Balance: ₱{remainingEventBalance.toLocaleString()}
                    </Badge>
                 ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black shadow-none px-2 py-0">
                      FULLY PAID
                    </Badge>
                 )}
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(proof.status)} px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full shadow-none border-none self-start md:self-center`}>
            {proof.status === 'resubmitted' ? 'Resubmitted' : proof.status === 'pending' ? 'Pending Review' : proof.status}
          </Badge>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-[#f97316] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Method</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{proof.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Declared</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{proof.paymentAmount}</p>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 border-slate-300 text-slate-500">
                    {proof.paymentType === 'balance' ? 'BALANCE' : proof.paymentType === 'down' ? 'DOWN' : 'FULL'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(proof.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">{booking?.userInfo?.name || "Unknown Client"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 flex-1">
              {proof.paymentMethod === 'cash' ? (
                <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-fit">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-bold">Client declared Cash Payment (Walk-in)</span>
                </div>
              ) : (
                <>
                  {proof.paymentReference && proof.paymentReference !== 'N/A' && (
                    <div className="flex items-center text-sm font-medium">
                      <span className="text-slate-500 mr-2">Ref No:</span> 
                      <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{proof.paymentReference}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                    <FileImage className="h-4 w-4 text-[#ea580c]" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{proof.fileName}</span>
                    <span className="text-xs text-slate-400 font-bold ml-2">({formatFileSize(proof.fileSize)})</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {proof.paymentMethod !== 'cash' && (
                <>
                  <Button variant="outline" className="rounded-xl h-10 font-bold border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleViewImage(proof)}>
                    <Eye className="h-4 w-4 mr-2 text-blue-500" /> View File
                  </Button>
                  <Button variant="outline" className="rounded-xl h-10 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hidden sm:flex" onClick={() => handleDownloadFile(proof)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </>
              )}

              {/* FIX: DINAGDAG ANG 3 BUTTONS (Approve, Incomplete DP, Reject) */}
              {isNeedsAction && (
                <>
                  <div className="w-px h-8 bg-slate-200 mx-2 hidden lg:block"></div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 font-bold px-4 shadow-sm" onClick={() => handleReviewProof(proof, "verify")}>
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Approve Payment
                  </Button>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 font-bold px-4 shadow-sm" onClick={() => handleReviewProof(proof, "incomplete")}>
                    <AlertCircle className="h-4 w-4 mr-1.5" /> Incomplete Downpayment
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl h-10 font-bold px-4" onClick={() => handleReviewProof(proof, "reject")}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Verification</h1>
        <p className="text-slate-500 font-medium">Review and verify client payment receipts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</CardTitle><Receipt className="h-5 w-5 text-slate-300" /></CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{allProofs.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all border-b-4 border-b-amber-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-widest">Pending</CardTitle><Clock className="h-5 w-5 text-amber-400" /></CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{pendingProofs.length}</div>
            {pendingProofs.length > 0 && <Badge className="bg-amber-100 text-amber-700 mt-2 border-none shadow-none font-bold">Needs Action</Badge>}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Verified</CardTitle><CheckCircle className="h-5 w-5 text-emerald-400" /></CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{verifiedProofs.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-bold text-rose-500 uppercase tracking-widest">Rejected</CardTitle><XCircle className="h-5 w-5 text-rose-400" /></CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{rejectedProofs.length}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 h-14 w-full md:w-auto overflow-x-auto justify-start flex-nowrap hide-scrollbar">
          <TabsTrigger value="pending" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 font-bold px-5"><Clock className="h-4 w-4" /><span>Pending ({pendingProofs.length})</span></TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 font-bold px-5"><CheckCircle className="h-4 w-4" /><span>Verified ({verifiedProofs.length})</span></TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 font-bold px-5"><XCircle className="h-4 w-4" /><span>Rejected ({rejectedProofs.length})</span></TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold px-5"><span>All ({allProofs.length})</span></TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">{pendingProofs.length === 0 ? (<div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"><Clock className="h-16 w-16 mx-auto mb-4 text-slate-200" /><h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3></div>) : (pendingProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />))}</TabsContent>
        <TabsContent value="verified" className="mt-6">{verifiedProofs.length === 0 ? (<div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"><CheckCircle className="h-16 w-16 mx-auto mb-4 text-slate-200" /><h3 className="text-lg font-bold text-slate-900">No Verified Payments</h3></div>) : (verifiedProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />))}</TabsContent>
        <TabsContent value="rejected" className="mt-6">{rejectedProofs.length === 0 ? (<div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"><XCircle className="h-16 w-16 mx-auto mb-4 text-slate-200" /><h3 className="text-lg font-bold text-slate-900">No Rejected Payments</h3></div>) : (rejectedProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />))}</TabsContent>
        <TabsContent value="all" className="mt-6">{allProofs.length === 0 ? (<div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"><Receipt className="h-16 w-16 mx-auto mb-4 text-slate-200" /><h3 className="text-lg font-bold text-slate-900">No Data Available</h3></div>) : (allProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />))}</TabsContent>
      </Tabs>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className={`text-2xl font-black ${reviewAction === 'verify' ? 'text-emerald-600' : reviewAction === 'incomplete' ? 'text-amber-600' : 'text-rose-600'}`}>
              {reviewAction === "verify" ? "Confirm Payment & Booking" : reviewAction === "incomplete" ? "Mark Incomplete Downpayment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1">
              {reviewAction === "verify"
                ? "Are you sure you want to approve this payment? The booking will be marked as officially Secured/Confirmed."
                : reviewAction === "incomplete"
                ? "Accept this payment but mark the booking as 'Incomplete Downpayment'. The client still needs to settle the remaining downpayment balance."
                : "Please provide a reason to let the client know why their payment was rejected."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="adminNote" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {reviewAction === "verify" || reviewAction === "incomplete" ? "Admin Note (Optional)" : "Rejection Reason *"}
              </Label>
              <Textarea
                id="adminNote"
                className={`resize-none h-32 rounded-xl text-sm p-4 ${reviewAction === 'reject' ? 'border-rose-200 focus-visible:ring-rose-500 bg-rose-50' : reviewAction === 'incomplete' ? 'border-amber-200 focus-visible:ring-amber-500 bg-amber-50' : 'border-slate-200 focus-visible:ring-emerald-500 bg-slate-50'}`}
                placeholder={reviewAction === "verify" ? "Add an internal note..." : reviewAction === "incomplete" ? "e.g. 1k balance remaining for DP..." : "e.g. Screenshot is too blurry / Wrong amount..."}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required={reviewAction === "reject"}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="rounded-xl h-12 font-bold px-6 border-slate-200 text-slate-600">Cancel</Button>
            <Button onClick={handleSubmitReview} className={`rounded-xl h-12 font-bold px-8 text-white shadow-sm transition-transform active:scale-[0.98] ${reviewAction === "verify" ? "bg-emerald-500 hover:bg-emerald-600" : reviewAction === "incomplete" ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-500 hover:bg-rose-600"}`}>
              {reviewAction === "verify" ? "Yes, Confirm" : reviewAction === "incomplete" ? "Mark Incomplete" : "Submit Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-6 bg-white rounded-3xl border-none shadow-2xl z-[99999]">
          <DialogHeader className="shrink-0 mb-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-[#ea580c]" /> Payment Receipt Proof
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative group">
            <img 
              src={selectedImage} 
              alt="Payment proof" 
              className="w-full h-full object-contain drop-shadow-sm" 
              onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }}
            />
          </div>
          <div className="shrink-0 mt-4 flex justify-end">
             <Button variant="outline" onClick={() => setShowImageDialog(false)} className="rounded-xl font-bold px-8 h-12 border-slate-200 text-slate-700">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}