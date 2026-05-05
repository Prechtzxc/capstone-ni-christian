"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { FileUploadService, type UploadedFile } from "@/lib/file-upload"
import { mockDatabase, type PaymentProof } from "@/lib/mock-db"

interface PaymentProofContextType {
  paymentProofs: PaymentProof[]
  uploadPaymentProof: (
    bookingId: string,
    file: File,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    },
  ) => Promise<PaymentProof>
  // ADDED: updatePaymentProof interface
  updatePaymentProof: (
    proofId: string,
    file: File | null,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    }
  ) => Promise<boolean>
  getPaymentProofByBooking: (bookingId: string) => PaymentProof | undefined
  getAllPaymentProofs: () => PaymentProof[]
  getPendingPaymentProofs: () => PaymentProof[]
  verifyPaymentProof: (proofId: string, adminId: string, note?: string) => void
  rejectPaymentProof: (proofId: string, adminId: string, note: string) => void
  getPaymentProofFile: (fileId: string) => UploadedFile | null
}

const PaymentProofContext = createContext<PaymentProofContextType | undefined>(undefined)

export function PaymentProofProvider({ children }: { children: React.ReactNode }) {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const fileUploadService = FileUploadService.getInstance()

  useEffect(() => {
    const savedProofs = localStorage.getItem("payment-proofs")
    if (savedProofs) {
      setPaymentProofs(JSON.parse(savedProofs))
    } else {
      // Default to database
      setPaymentProofs(mockDatabase.paymentProofs)
    }
  }, [])

  useEffect(() => {
    if (paymentProofs.length > 0) {
      localStorage.setItem("payment-proofs", JSON.stringify(paymentProofs))
    }
  }, [paymentProofs])

  const uploadPaymentProof = async (
    bookingId: string,
    file: File,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    },
  ): Promise<PaymentProof> => {
    try {
      const uploadedFile = await fileUploadService.uploadFile(file, bookingId)

      const paymentProof: PaymentProof = {
        id: `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        bookingId,
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        fileUrl: uploadedFile.url,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: bookingId,
        status: "pending",
        ...paymentDetails,
      }

      setPaymentProofs((prev) => [...prev, paymentProof])
      mockDatabase.paymentProofs.push(paymentProof)
      return paymentProof
    } catch (error: any) {
      throw new Error(`Failed to upload payment proof: ${error.message}`)
    }
  }

  // ADDED: updatePaymentProof function implementation
  const updatePaymentProof = async (
    proofId: string,
    file: File | null,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    }
  ): Promise<boolean> => {
    try {
      let fileUpdates = {}

      // If the user uploaded a new receipt during the edit, process the file
      if (file) {
        const existingProof = paymentProofs.find((p) => p.id === proofId)
        if (existingProof) {
          const uploadedFile = await fileUploadService.uploadFile(file, existingProof.bookingId)
          fileUpdates = {
            fileId: uploadedFile.id,
            fileName: uploadedFile.name,
            fileUrl: uploadedFile.url,
            fileSize: uploadedFile.size,
            fileType: uploadedFile.type,
          }
        }
      }

      // Update the proof in state
      setPaymentProofs((prev) =>
        prev.map((proof) => {
          if (proof.id === proofId) {
            return {
              ...proof,
              ...paymentDetails,
              ...fileUpdates,
              status: "resubmitted" as any, // Cast as any if your mock-db type strictly requires pending/verified/rejected
              uploadedAt: new Date().toISOString(), // Refresh the timestamp
            }
          }
          return proof
        })
      )
      
      return true
    } catch (error) {
      console.error("Failed to update payment proof:", error)
      return false
    }
  }

  const getPaymentProofByBooking = (bookingId: string): PaymentProof | undefined => {
    return paymentProofs.find((proof) => proof.bookingId === bookingId)
  }

  const getAllPaymentProofs = (): PaymentProof[] => {
    return paymentProofs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  const getPendingPaymentProofs = (): PaymentProof[] => {
    return paymentProofs.filter((proof) => proof.status === "pending" || proof.status === ("resubmitted" as any))
  }

  const verifyPaymentProof = (proofId: string, adminId: string, note?: string) => {
    setPaymentProofs((prev) =>
      prev.map((proof) =>
        proof.id === proofId
          ? {
              ...proof,
              status: "verified" as const,
              verifiedAt: new Date().toISOString(),
              verifiedBy: adminId,
              adminNote: note,
            }
          : proof,
      ),
    )
  }

  const rejectPaymentProof = (proofId: string, adminId: string, note: string) => {
    setPaymentProofs((prev) =>
      prev.map((proof) =>
        proof.id === proofId
          ? {
              ...proof,
              status: "rejected" as const,
              verifiedAt: new Date().toISOString(),
              verifiedBy: adminId,
              adminNote: note,
            }
          : proof,
      ),
    )
  }

  const getPaymentProofFile = (fileId: string): UploadedFile | null => {
    return fileUploadService.getFile(fileId)
  }

  return (
    <PaymentProofContext.Provider
      value={{
        paymentProofs,
        uploadPaymentProof,
        updatePaymentProof, // ADDED: Exposed the function here
        getPaymentProofByBooking,
        getAllPaymentProofs,
        getPendingPaymentProofs,
        verifyPaymentProof,
        rejectPaymentProof,
        getPaymentProofFile,
      }}
    >
      {children}
    </PaymentProofContext.Provider>
  )
}

export function usePaymentProof() {
  const context = useContext(PaymentProofContext)
  if (context === undefined) {
    throw new Error("usePaymentProof must be used within a PaymentProofProvider")
  }
  return context
}