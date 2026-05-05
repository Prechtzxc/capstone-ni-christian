"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { findBestMatch, generateFollowUps } from "@/lib/chatbot-knowledge"

interface ChatbotMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: string
  followUps?: string[]
  escalated?: boolean
}

interface ChatbotContextType {
  messages: ChatbotMessage[]
  isTyping: boolean
  sendMessage: (message: string) => Promise<void>
  sendFollowUp: (followUp: string) => Promise<void>
  clearChat: () => void
  escalateToHuman: () => void
  isEscalated: boolean
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

// Store chat history in database-like structure with timestamps and metadata
interface ChatLog {
  conversationId: string
  userId: string
  userEmail?: string
  messages: ChatbotMessage[]
  isEscalated: boolean
  escalatedAt?: string
  startTime: string
  endTime?: string
  lastUpdated: string
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const [conversationId] = useState(`conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatbotMessage = {
      id: `bot-${Date.now()}`,
      content:
        "Hello! Welcome to One Estela Place! 👋 I'm your virtual assistant. I can help you with venue availability, office space details, pricing, and reservation steps. How can I assist you today?",
      isBot: true,
      timestamp: new Date().toISOString(),
      followUps: [
        "Check venue availability",
        "View office spaces",
        "Get pricing information",
        "Learn about reservation process",
      ],
    }
    setMessages([welcomeMessage])
  }, [])

  // Store chat messages in database (using localStorage as persistence layer)
  const logChatToDB = (updatedMessages: ChatbotMessage[], escalated: boolean = isEscalated) => {
    const chatLog: ChatLog = {
      conversationId,
      userId: `user-${Date.now()}`, // In production, get from auth
      userEmail: localStorage.getItem("userEmail") || "anonymous@example.com",
      messages: updatedMessages,
      isEscalated: escalated,
      escalatedAt: escalated ? new Date().toISOString() : undefined,
      startTime: localStorage.getItem(`chat-start-${conversationId}`) || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    // Save to localStorage (in production, this would be saved to actual database)
    localStorage.setItem(`chat-log-${conversationId}`, JSON.stringify(chatLog))
    
    // Also maintain a list of all conversations for admin reference
    const allConversations = JSON.parse(localStorage.getItem("all-chat-conversations") || "[]")
    if (!allConversations.find((c: ChatLog) => c.conversationId === conversationId)) {
      allConversations.push({
        conversationId,
        userEmail: chatLog.userEmail,
        isEscalated: escalated,
        messageCount: updatedMessages.length,
        startTime: chatLog.startTime,
        lastUpdated: chatLog.lastUpdated,
      })
      localStorage.setItem("all-chat-conversations", JSON.stringify(allConversations))
    } else {
      // Update existing conversation record
      const updated = allConversations.map((c: ChatLog) =>
        c.conversationId === conversationId
          ? {
              ...c,
              isEscalated: escalated,
              messageCount: updatedMessages.length,
              lastUpdated: chatLog.lastUpdated,
            }
          : c,
      )
      localStorage.setItem("all-chat-conversations", JSON.stringify(updated))
    }
  }

  const simulateTyping = async (duration = 1500) => {
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, duration))
    setIsTyping(false)
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isEscalated) return

    // Add user message
    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      content: message.trim(),
      isBot: false,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => {
      const updated = [...prev, userMessage]
      logChatToDB(updated, isEscalated)
      return updated
    })

    // Simulate bot typing
    await simulateTyping()

    // Get bot response
    const botResponse = findBestMatch(message)

    // Check if escalation is needed
    if (botResponse.escalate) {
      setIsEscalated(true)

      const escalationMessage: ChatbotMessage = {
        id: `bot-${Date.now()}`,
        content: `${botResponse.message}\n\n🔄 **We're connecting you to a live representative to assist you further.** \nOne of our specialists will join this conversation shortly to answer your specific questions and help with your reservation.`,
        isBot: true,
        timestamp: new Date().toISOString(),
        escalated: true,
      }

      setMessages((prev) => {
        const updated = [...prev, escalationMessage]
        logChatToDB(updated, true)
        return updated
      })

      // Notify admin about escalation
      setTimeout(() => {
        const escalationNotification = {
          type: "chatEscalation",
          conversationId,
          userMessage: message,
          userEmail: localStorage.getItem("userEmail") || "anonymous@example.com",
          chatHistory: [...messages, userMessage, escalationMessage],
          timestamp: new Date().toISOString(),
        }

        localStorage.setItem("admin-escalation", JSON.stringify(escalationNotification))
        setTimeout(() => localStorage.removeItem("admin-escalation"), 1000)
      }, 500)

      return
    }

    // Add bot response
    const botMessage: ChatbotMessage = {
      id: `bot-${Date.now()}`,
      content: botResponse.message,
      isBot: true,
      timestamp: new Date().toISOString(),
      followUps: botResponse.followUp || generateFollowUps(botResponse.category),
    }

    setMessages((prev) => {
      const updated = [...prev, botMessage]
      logChatToDB(updated, isEscalated)
      return updated
    })
  }

  const sendFollowUp = async (followUp: string) => {
    await sendMessage(followUp)
  }

  const escalateToHuman = () => {
    setIsEscalated(true)

    const escalationMessage: ChatbotMessage = {
      id: `bot-${Date.now()}`,
      content:
        "🔄 **We're connecting you to a live representative to assist you further.** \nI'm transferring you to one of our specialists who can provide personalized assistance. Please hold on while I connect you.",
      isBot: true,
      timestamp: new Date().toISOString(),
      escalated: true,
    }

    setMessages((prev) => {
      const updated = [...prev, escalationMessage]
      logChatToDB(updated, true)
      return updated
    })

    // Notify admin
    setTimeout(() => {
      const escalationNotification = {
        type: "manualEscalation",
        conversationId,
        userEmail: localStorage.getItem("userEmail") || "anonymous@example.com",
        chatHistory: [...messages, escalationMessage],
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem("admin-escalation", JSON.stringify(escalationNotification))
      setTimeout(() => localStorage.removeItem("admin-escalation"), 1000)
    }, 500)
  }

  const clearChat = () => {
    setMessages([])
    setIsEscalated(false)

    // Re-initialize with welcome message
    setTimeout(() => {
      const welcomeMessage: ChatbotMessage = {
        id: `bot-${Date.now()}`,
        content: "Hello! Welcome back to One Estela Place! How can I assist you today?",
        isBot: true,
        timestamp: new Date().toISOString(),
        followUps: [
          "Check venue availability",
          "View office spaces",
          "Get pricing information",
          "Learn about reservation process",
        ],
      }
      setMessages([welcomeMessage])
    }, 100)
  }

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isTyping,
        sendMessage,
        sendFollowUp,
        clearChat,
        escalateToHuman,
        isEscalated,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}
