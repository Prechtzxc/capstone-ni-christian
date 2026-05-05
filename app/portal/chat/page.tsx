"use client"

import { useEffect } from "react"
// FIXED: Removed <MainLayout> as it belongs to the Admin Dashboard.
// The Portal already has its own layout from app/portal/layout.tsx
import { ChatWindow } from "../../../src/modules/shared/components/unified-chat-widget"
import { useChat } from "../../../src/modules/shared/contexts/chat-context"

export default function ClientSupportChatPage() {
  const { triggerWelcomeMessage } = useChat()

  // Ensure the welcome message fires when the user lands on the full support page
  useEffect(() => {
    triggerWelcomeMessage()
  }, [triggerWelcomeMessage])

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-40px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-500 mt-1">Chat directly with our venue managers for assistance.</p>
      </div>
      
      {/* Container for the unified chat window */}
      <div className="flex-1 min-h-0 p-4 lg:p-6 bg-gray-50/30">
        <ChatWindow mode="full" />
      </div>
    </div>
  )
}