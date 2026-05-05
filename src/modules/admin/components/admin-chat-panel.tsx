"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@/src/modules/shared/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, ShieldCheck } from "lucide-react"

export default function AdminChatPanel() {
  const { messages, sendMessage, markAsRead } = useChat()
  const [input, setInput] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedClientId) {
      markAsRead(selectedClientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId])

  const chatThreads = useMemo(() => {
    const groups: Record<string, { name: string, lastMessage: string, timestamp: number, hasUnread: boolean, hasUserMessage: boolean }> = {}
    
    messages.forEach(m => {
      let threadId = ""
      let threadName = ""

      if (m.sender === "user") {
        threadId = m.senderId
        threadName = m.senderName
      } else if (m.sender === "admin" || m.sender === "bot") {
        threadId = m.targetId || ""
      }

      if (!threadId || threadId === "admin" || threadId === "system") return;

      if (!groups[threadId]) {
        groups[threadId] = {
          name: threadName || "Client",
          lastMessage: m.text,
          timestamp: m.timestamp.getTime(),
          hasUnread: m.sender === "user" && !m.isRead,
          hasUserMessage: m.sender === "user" 
        }
      } else {
        groups[threadId].lastMessage = m.text
        groups[threadId].timestamp = m.timestamp.getTime()
        if (m.sender === "user" && !m.isRead) {
          groups[threadId].hasUnread = true
        }
        if (threadName) {
          groups[threadId].name = threadName 
        }
        if (m.sender === "user") {
          groups[threadId].hasUserMessage = true
        }
      }
    })
    
    return Object.entries(groups)
      .filter(([_, data]) => data.hasUserMessage)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
  }, [messages])

  useEffect(() => {
    if (!selectedClientId && chatThreads.length > 0) {
      setSelectedClientId(chatThreads[0][0])
    } else if (chatThreads.length === 0) {
      setSelectedClientId(null)
    }
  }, [chatThreads, selectedClientId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, selectedClientId])

  const activeMessages = messages.filter(m => 
    m.senderId === selectedClientId || m.targetId === selectedClientId
  )

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedClientId) return
    sendMessage(input, "admin", selectedClientId) 
    setInput("")
  }

  const selectedClientName = chatThreads.find(t => t[0] === selectedClientId)?.[1].name || "Client"

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* LEFT SIDEBAR: Messenger Thread List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-900 text-lg">Conversations</h2>
          <div className="flex items-center text-xs text-green-600 mt-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Live Sync Active
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatThreads.length > 0 ? (
            chatThreads.map(([clientId, data]) => {
              const isSelected = selectedClientId === clientId
              return (
                <div 
                  key={clientId}
                  onClick={() => setSelectedClientId(clientId)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors relative overflow-hidden ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* RED LINE INDICATOR SA PINAKAGILID */}
                  {data.hasUnread && !isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-md"></div>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <User size={20} />
                  </div>
                  <div className="overflow-hidden flex-1 pl-1">
                    <p className={`text-sm truncate ${data.hasUnread && !isSelected ? 'font-extrabold text-black' : 'font-medium'}`}>{data.name}</p>
                    <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-100' : (data.hasUnread ? 'text-gray-900 font-bold' : 'text-gray-500')}`}>
                      {data.lastMessage}
                    </p>
                  </div>
                  {/* RED DOT SA KANAN */}
                  {data.hasUnread && !isSelected && (
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 shadow-sm"></div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 mt-10">No active conversations.</div>
          )}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedClientId ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm z-10">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <User size={16} />
               </div>
              <h3 className="font-bold text-gray-900">{selectedClientName}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50" ref={scrollRef}>
              {activeMessages.map((msg) => {
                const isAdmin = msg.sender === "admin"
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                      isAdmin ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] mt-1.5 block font-medium ${isAdmin ? "text-blue-200" : "text-gray-400"}`}>
                        {msg.sender === "bot" ? "Automated Support" : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex gap-3">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Reply to ${selectedClientName}...`} className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-11" />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-sm"><Send size={18} className="mr-2" />Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <ShieldCheck size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">No Conversation Selected.</p>
          </div>
        )}
      </div>
    </div>
  )
}