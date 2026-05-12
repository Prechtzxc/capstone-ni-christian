import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// 1. IMPORT YOUR PROVIDERS
import { AuthProvider } from "@/src/modules/shared/auth/auth-context"
import { BookingProvider } from "@/src/modules/client/contexts/booking-context"
import { MessageProvider } from "@/src/modules/admin/contexts/message-context"
import { ChatProvider } from "@/src/modules/shared/contexts/chat-context"
import { ChatbotProvider } from "@/src/modules/shared/components/chatbot-service"
import { PaymentProofProvider } from "@/src/modules/admin/contexts/payment-proof-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "One Estela Place",
  description: "Booking and Management Portal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. NEST YOUR PROVIDERS */}
        <AuthProvider>
          <BookingProvider>
            <PaymentProofProvider>
              <MessageProvider>
                <ChatbotProvider>
                  <ChatProvider>
                    {children}
                  </ChatProvider>
                </ChatbotProvider>
              </MessageProvider>
            </PaymentProofProvider>
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}