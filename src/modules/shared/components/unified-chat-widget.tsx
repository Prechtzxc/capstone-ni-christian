"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "../contexts/chat-context"
import { Send, Bot, X, MessageSquare } from "lucide-react"

export function ChatWindow({ mode }: { mode: "widget" | "full" }) {
  // Kinuha natin ang triggerWelcomeMessage dito!
  const { messages, sendMessage, toggleChat, currentClientId, markAdminAsRead, triggerWelcomeMessage } = useChat()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const myMessages = messages.filter(m => 
    m.senderId === currentClientId || m.targetId === currentClientId
  )

  // FIX: Kapag nag-mount/nagbukas itong chat window (either float o full page), saka palang mag-trigger ng Welcome Message!
  useEffect(() => {
    triggerWelcomeMessage()
  }, [triggerWelcomeMessage])

  // FIX: Kapag naka-focus or naka-open ang chat, automatic mark as read!
  useEffect(() => {
    markAdminAsRead()
  }, [myMessages, markAdminAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [myMessages])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return
    
    sendMessage(inputValue.trim(), "user")
    setInputValue("")
  }

  const containerClasses = mode === "widget" 
    ? "flex flex-col h-[500px] w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" 
    : "flex flex-col h-full w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]"

  return (
    <div className={containerClasses}>
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Venue Support</h3>
            <p className="text-xs text-blue-100 font-medium">Usually replies instantly</p>
          </div>
        </div>
        {mode === "widget" && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 hover:text-white rounded-full h-8 w-8" onClick={toggleChat}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {myMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
              msg.sender === "user" 
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
              <span className={`text-[10px] mt-1 block font-medium ${msg.sender === "user" ? "text-blue-200 text-right" : "text-gray-400 text-left"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input 
            placeholder="Type your message..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-slate-50 border-gray-200 focus-visible:ring-blue-500 rounded-full px-4 h-10"
          />
          <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shrink-0 h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export function UnifiedChatWidget() {
  const { isOpen, toggleChat, unreadClientCount } = useChat()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
          <ChatWindow mode="widget" />
        </div>
      )}
      
      {!isOpen && (
        <Button 
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
        >
          <MessageSquare className="w-6 h-6" />
          
          {unreadClientCount > 0 && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      )}
    </div>
  )
}