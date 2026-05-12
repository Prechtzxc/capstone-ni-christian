"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mockDatabase, type PaymentProof } from "@/lib/mock-db"

interface PaymentProofContextType {
  paymentProofs: PaymentProof[]
  uploadPaymentProof: (
    bookingId: string,
    file: File,
    paymentDetails: { paymentMethod: string; paymentAmount: string; paymentDate: string; paymentReference?: string },
  ) => Promise<PaymentProof>
  updatePaymentProof: (
    proofId: string,
    file: File | null,
    paymentDetails: { paymentMethod: string; paymentAmount: string; paymentDate: string; paymentReference?: string }
  ) => Promise<boolean>
  getPaymentProofByBooking: (bookingId: string) => PaymentProof | undefined
  getAllPaymentProofs: () => PaymentProof[]
  getPendingPaymentProofs: () => PaymentProof[]
  verifyPaymentProof: (proofId: string, adminId: string, note?: string) => void
  rejectPaymentProof: (proofId: string, adminId: string, note: string) => void
}

const PaymentProofContext = createContext<PaymentProofContextType | undefined>(undefined)
const STORAGE_KEY = "payment-proofs"

const dispatchNotification = (target: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
  if (typeof window !== "undefined") {
    try {
      const notifs = JSON.parse(localStorage.getItem("oneestela_notifications") || "[]")
      notifs.unshift({ id: Date.now().toString() + Math.random(), target, title, message, type, date: new Date().toISOString(), read: false })
      localStorage.setItem("oneestela_notifications", JSON.stringify(notifs))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (e) {
      console.warn("Notification skipped: Storage full")
    }
  }
}

export function PaymentProofProvider({ children }: { children: React.ReactNode }) {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])

  useEffect(() => {
    const loadProofs = () => {
      const savedProofs = localStorage.getItem(STORAGE_KEY)
      if (savedProofs) {
        setPaymentProofs(JSON.parse(savedProofs))
      } else {
        setPaymentProofs(mockDatabase.paymentProofs)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDatabase.paymentProofs)) } catch (e) {}
      }
    }

    loadProofs()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadProofs()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("paymentsUpdated", loadProofs) 

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("paymentsUpdated", loadProofs)
    }
  }, [])

  const syncData = (newData: PaymentProof[]) => {
    setPaymentProofs(newData) 
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      window.dispatchEvent(new Event("paymentsUpdated")) 
    } catch (error: any) {
      console.warn("Storage Full! Attempting aggressive cleanup...")
      try {
        const emergencySlice = newData.slice(-2) 
        setPaymentProofs(emergencySlice)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencySlice))
        window.dispatchEvent(new Event("paymentsUpdated"))
      } catch (e) {
        console.error("Storage completely full! Running in-memory mode for this transaction.")
      }
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width; let height = img.height;
          
          const MAX_WIDTH = 300 

          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.3)
          resolve(compressedBase64)
        }
        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const getUserIdFromBooking = (bId: string) => {
      try {
        const allBookings = JSON.parse(localStorage.getItem("oneestela_global_bookings_v2") || "[]")
        return allBookings.find((b: any) => b.id === bId)?.userId || ""
      } catch (e) { return "" }
  }

  const uploadPaymentProof = async (
    bookingId: string, file: File, paymentDetails: any
  ): Promise<PaymentProof> => {
    try {
      let base64Image = "";
      
      // FIX: Check muna kung image bago i-compress! Para iwas crash sa dummy cash file
      if (file.type.startsWith("image/")) {
        base64Image = await compressImage(file)
      } else {
        base64Image = "data:text/plain;base64,Y2FzaA==" // Dummy string pag cash payment
      }

      const paymentProof: PaymentProof = {
        id: `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        bookingId, fileId: `mock-file-${Date.now()}`, fileName: file.name, fileUrl: base64Image,
        fileSize: file.size, fileType: file.type, uploadedAt: new Date().toISOString(),
        uploadedBy: bookingId, status: "pending", ...paymentDetails,
      }

      const updatedProofs = [...paymentProofs, paymentProof]
      syncData(updatedProofs) 
      
      const uId = getUserIdFromBooking(bookingId)
      dispatchNotification("admin", "Payment Uploaded", `A new payment proof was uploaded for booking ID: ${bookingId}.`, "info")
      if (uId) dispatchNotification(uId, "Payment Submitted", `Your payment proof has been sent for admin verification.`, "success")

      return paymentProof
    } catch (error: any) { 
      console.error("Context Error:", error);
      throw new Error(`System Error: ${error?.message || "Compression failed"}`) 
    }
  }

  const updatePaymentProof = async (
    proofId: string, file: File | null, paymentDetails: any
  ): Promise<boolean> => {
    try {
      let fileUpdates = {}
      if (file) {
        let base64Image = "";
        
        // FIX: Parehas na check para sa resubmit
        if (file.type.startsWith("image/")) {
          base64Image = await compressImage(file)
        } else {
          base64Image = "data:text/plain;base64,Y2FzaA=="
        }

        fileUpdates = { fileId: `mock-file-${Date.now()}`, fileName: file.name, fileUrl: base64Image, fileSize: file.size, fileType: file.type }
      }

      let bId = "";
      const updatedProofs = paymentProofs.map((proof) => {
        if (proof.id === proofId) {
          bId = proof.bookingId;
          return { ...proof, ...paymentDetails, ...fileUpdates, status: "resubmitted" as any, uploadedAt: new Date().toISOString() }
        }
        return proof
      })
      
      syncData(updatedProofs)

      if (bId) {
         const uId = getUserIdFromBooking(bId)
         dispatchNotification("admin", "Payment Resubmitted", `Payment proof for booking ${bId} was updated.`, "info")
         if (uId) dispatchNotification(uId, "Payment Resubmitted", `Your updated payment proof is now under review.`, "success")
      }

      return true
    } catch (error) { return false }
  }

  const getPaymentProofByBooking = (bookingId: string): PaymentProof | undefined => paymentProofs.find((proof) => proof.bookingId === bookingId)
  const getAllPaymentProofs = (): PaymentProof[] => [...paymentProofs].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  const getPendingPaymentProofs = (): PaymentProof[] => paymentProofs.filter((proof) => proof.status === "pending" || proof.status === ("resubmitted" as any))

  const verifyPaymentProof = (proofId: string, adminId: string, note?: string) => {
    let bId = "";
    const updatedProofs = paymentProofs.map((proof) => {
      if (proof.id === proofId) { bId = proof.bookingId; return { ...proof, status: "verified" as const, verifiedAt: new Date().toISOString(), verifiedBy: adminId, adminNote: note } }
      return proof
    })
    syncData(updatedProofs)

    if (bId) {
      const uId = getUserIdFromBooking(bId)
      if (uId) dispatchNotification(uId, "Payment Verified!", `Your payment has been verified. Your booking is now Confirmed.`, "success")
    }
  }

  const rejectPaymentProof = (proofId: string, adminId: string, note: string) => {
    let bId = "";
    const updatedProofs = paymentProofs.map((proof) => {
      if (proof.id === proofId) { bId = proof.bookingId; return { ...proof, status: "rejected" as const, verifiedAt: new Date().toISOString(), verifiedBy: adminId, adminNote: note } }
      return proof
    })
    syncData(updatedProofs)

    if (bId) {
      const uId = getUserIdFromBooking(bId)
      if (uId) dispatchNotification(uId, "Payment Rejected", `Your payment proof was rejected. Note: ${note}`, "error")
    }
  }

  return (
    <PaymentProofContext.Provider value={{ paymentProofs, uploadPaymentProof, updatePaymentProof, getPaymentProofByBooking, getAllPaymentProofs, getPendingPaymentProofs, verifyPaymentProof, rejectPaymentProof }}>
      {children}
    </PaymentProofContext.Provider>
  )
}

export function usePaymentProof() {
  const context = useContext(PaymentProofContext)
  if (context === undefined) throw new Error("usePaymentProof must be used within a PaymentProofProvider")
  return context
}