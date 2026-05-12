"use client"

import { useEffect } from "react"
import { ChatWindow } from "@/src/modules/shared/components/unified-chat-widget"
import { useChat } from "@/src/modules/shared/contexts/chat-context"

export default function ClientSupportChatPage() {
  const { triggerWelcomeMessage } = useChat()

  useEffect(() => {
    triggerWelcomeMessage()
  }, [triggerWelcomeMessage])

  return (
    // Malinis na layout, saktong-sakto sa loob ng portal, walang sumasablay na margin!
    <div className="flex-1 flex flex-col h-[calc(100vh-40px)] md:h-[calc(100vh-80px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <ChatWindow mode="full" />
    </div>
  )
}