"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode, useMemo } from "react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { connectToChatSocket, sendSocketMessage } from "../lib/chat-socket"

export type Message = {
  id: string
  text: string
  sender: "user" | "bot" | "admin"
  senderId: string
  senderName: string
  targetId?: string 
  timestamp: Date
  isRead: boolean
}

interface ChatFlags {
  welcomeSent: boolean
  autoReplySent: boolean
}

interface ChatContextType {
  messages: Message[]
  sendMessage: (text: string, senderOverride?: "user" | "bot" | "admin", targetId?: string) => void
  unreadCount: number 
  unreadClientCount: number 
  markAsRead: (clientId: string) => void
  markAdminAsRead: () => void 
  isOpen: boolean
  toggleChat: () => void
  triggerWelcomeMessage: () => void
  chatFlags: ChatFlags
  clearChatHistory: () => void
  currentClientId: string 
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const CHAT_STORAGE_KEY = "capstone_chat_history"
const defaultFlags: ChatFlags = { welcomeSent: false, autoReplySent: false }

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatFlags, setChatFlags] = useState<ChatFlags>(defaultFlags)
  const [isOpen, setIsOpen] = useState(false)
  
  const { user } = useAuth()

  const currentClientId = useMemo(() => {
    if (user?.id) return `user-${user.id}` 
    if (typeof window !== "undefined") {
      let guestId = localStorage.getItem("mock_guest_id")
      if (!guestId) {
        guestId = "guest-" + Math.random().toString(36).substring(7)
        localStorage.setItem("mock_guest_id", guestId)
      }
      return guestId
    }
    return "guest-temp"
  }, [user?.id]) 

  const chatFlagsKey = `capstone_chat_flags_${currentClientId}`
  const welcomeLock = useRef(false)
  const autoReplyLock = useRef(false)

  // FIX 1: SAFE LOAD. Babasahin lang history isang beses.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChat = localStorage.getItem(CHAT_STORAGE_KEY)
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          if (parsed.length > 0) {
            setMessages(parsed)
          }
        } catch (e) { console.error("Failed to parse chat", e) }
      }
    }
  }, [])

  // FIX 2: BULLETPROOF SAVE. Magsa-save lang HINDI na blangko ang chat para di mabura ng aksidente.
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFlags = localStorage.getItem(chatFlagsKey)
      if (savedFlags) {
        try { 
          const parsedFlags = JSON.parse(savedFlags)
          setChatFlags(parsedFlags)
          welcomeLock.current = parsedFlags.welcomeSent
          autoReplyLock.current = parsedFlags.autoReplySent
        } catch (e) {}
      } else {
        setChatFlags(defaultFlags)
        welcomeLock.current = false
        autoReplyLock.current = false
      }
    }
  }, [chatFlagsKey])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(chatFlagsKey, JSON.stringify(chatFlags))
    }
  }, [chatFlags, chatFlagsKey])

  const unreadCount = useMemo(() => {
    const unreadUserIds = new Set<string>()
    messages.forEach(m => {
      if (m.sender === "user" && !m.isRead) {
        unreadUserIds.add(m.senderId)
      }
    })
    return unreadUserIds.size
  }, [messages])

  const unreadClientCount = useMemo(() => {
    return messages.filter(m => (m.sender === "admin" || m.sender === "bot") && m.targetId === currentClientId && !m.isRead).length
  }, [messages, currentClientId])

  const markAsRead = useCallback((clientId: string) => {
    setMessages(prev => {
      const hasUnread = prev.some(m => m.senderId === clientId && !m.isRead)
      if (!hasUnread) return prev; 
      return prev.map(m => {
        if (m.senderId === clientId && !m.isRead) {
          return { ...m, isRead: true }
        }
        return m
      })
    })
  }, [])

  const markAdminAsRead = useCallback(() => {
    setMessages(prev => {
      const hasUnread = prev.some(m => (m.sender === "admin" || m.sender === "bot") && m.targetId === currentClientId && !m.isRead)
      if (!hasUnread) return prev; 
      return prev.map(m => {
        if ((m.sender === "admin" || m.sender === "bot") && m.targetId === currentClientId && !m.isRead) {
          return { ...m, isRead: true }
        }
        return m
      })
    })
  }, [currentClientId])

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    const timeoutId = setTimeout(() => {
      channel = connectToChatSocket((incoming: Message) => {
        const msg = { ...incoming, timestamp: new Date(incoming.timestamp) }
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg]
        })
      })
    }, 100);
    return () => { clearTimeout(timeoutId); channel?.close(); }
  }, [])

  const triggerWelcomeMessage = useCallback(() => {
    if (user?.role === "admin") return;
    if (welcomeLock.current) return; 

    welcomeLock.current = true; 
    setChatFlags(prev => ({ ...prev, welcomeSent: true }))
    
    setTimeout(() => {
      const welcomeMsg: Message = {
        id: "welcome-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
        text: "Hello! I'm here to help you with your venue booking. How can I assist you today.",
        sender: "bot",
        senderId: "system",
        senderName: "Support Bot",
        targetId: currentClientId, 
        timestamp: new Date(),
        isRead: false 
      }
      setMessages(curr => {
        if (curr.some(m => m.text.includes("Hello! I'm here to help") && m.targetId === currentClientId)) return curr;
        return [...curr, welcomeMsg]
      })
    }, 400)
  }, [currentClientId, user?.role])

  const sendMessage = useCallback((text: string, senderOverride?: "user" | "bot" | "admin", targetIdOverride?: string) => {
    const activeSender = senderOverride || (user?.role === "admin" ? "admin" : "user")
    const senderId = activeSender === "admin" ? "admin-1" : currentClientId
    const senderName = activeSender === "admin" ? "Venue Admin" : (user?.name || "Guest User")

    const newMessage: Message = {
      id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9),
      text,
      sender: activeSender,
      senderId,
      senderName,
      targetId: targetIdOverride || (activeSender === "user" ? "admin" : currentClientId), 
      timestamp: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, newMessage])
    if (activeSender !== "bot") sendSocketMessage(newMessage)

    if (activeSender === "user" && !autoReplyLock.current) {
      autoReplyLock.current = true; 
      setChatFlags(prev => ({ ...prev, autoReplySent: true }))
      
      setTimeout(() => {
        const autoReply: Message = {
          id: "auto-reply-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
          text: "Thank you for reaching out! A venue manager will be with you shortly.",
          sender: "bot",
          senderId: "system",
          senderName: "Venue Support",
          targetId: currentClientId, 
          timestamp: new Date(),
          isRead: false 
        }
        setMessages(curr => {
          if (curr.some(m => m.text.includes("A venue manager will be with you shortly") && m.targetId === currentClientId)) return curr;
          return [...curr, autoReply]
        })
        sendSocketMessage(autoReply)
      }, 1000)
    }
  }, [user, currentClientId])

  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev
      return next
    })
  }, [])

  const clearChatHistory = useCallback(() => {
    setMessages([])
    setChatFlags(defaultFlags)
    welcomeLock.current = false
    autoReplyLock.current = false
    localStorage.removeItem(CHAT_STORAGE_KEY)
    localStorage.removeItem(chatFlagsKey)
  }, [chatFlagsKey])

  return (
    <ChatContext.Provider value={{ 
      messages, sendMessage, unreadCount, unreadClientCount, markAsRead, markAdminAsRead, isOpen, toggleChat, 
      triggerWelcomeMessage, chatFlags, clearChatHistory, currentClientId 
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChat must be used within a ChatProvider")
  return context
}