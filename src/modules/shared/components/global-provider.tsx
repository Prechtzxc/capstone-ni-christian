"use client"

import type React from "react"
// CHANGED: Using the correct root path to prevent the duplicate context crash
import { AuthProvider } from "@/src/modules/shared/auth/auth-context"
import { ChatProvider } from "@shared/contexts/chat-context"
import { ChatbotProvider } from "@shared/components/chatbot-service"
import { BookingProvider } from "@client/contexts/booking-context"
import { MessageProvider } from "@admin/contexts/message-context"
import { PaymentProofProvider } from "@admin/contexts/payment-proof-context"
import { Toaster } from "@shared/components/ui/toaster"

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <ChatProvider>
          <BookingProvider>
            <MessageProvider>
              <PaymentProofProvider> 
                {children}
                <Toaster />
              </PaymentProofProvider>
            </MessageProvider>
          </BookingProvider>
        </ChatProvider>
      </ChatbotProvider>
    </AuthProvider>
  )
}