"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mockDatabase, type ContactMessage } from "@/lib/mock-db"

interface MessageContextType {
  messages: ContactMessage[]
  addMessage: (message: Omit<ContactMessage, "id" | "submittedAt" | "status" | "priority">) => void
  updateMessageStatus: (id: string, status: ContactMessage["status"]) => void
  getUnreadCount: () => number
  getAllMessages: () => ContactMessage[]
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    const savedMessages = localStorage.getItem("contactMessages")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Load from central mock database
      setMessages(mockDatabase.messages)
      localStorage.setItem("contactMessages", JSON.stringify(mockDatabase.messages))
    }
  }, [])

  const addMessage = (messageData: Omit<ContactMessage, "id" | "submittedAt" | "status" | "priority">) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: `msg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "new",
      priority: messageData.eventDate ? "high" : "medium",
    }
    const updatedMessages = [newMessage, ...messages]
    setMessages(updatedMessages)
    localStorage.setItem("contactMessages", JSON.stringify(updatedMessages))
    mockDatabase.messages.push(newMessage)
  }

  const updateMessageStatus = (id: string, status: ContactMessage["status"]) => {
    const updatedMessages = messages.map((message) => (message.id === id ? { ...message, status } : message))
    setMessages(updatedMessages)
    localStorage.setItem("contactMessages", JSON.stringify(updatedMessages))
  }

  const getUnreadCount = () => {
    return messages.filter((message) => message.status === "new").length
  }

  const getAllMessages = () => {
    return messages
  }

  return (
    <MessageContext.Provider value={{ messages, addMessage, updateMessageStatus, getUnreadCount, getAllMessages }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider")
  }
  return context
}