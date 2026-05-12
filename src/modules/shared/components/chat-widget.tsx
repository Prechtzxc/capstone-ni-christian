"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "../contexts/chat-context"
import { Send, X, MessageSquare, ShieldCheck, CheckCircle2, Phone, Video, MoreVertical, Paperclip, Clock, ChevronDown } from "lucide-react"
import { useAuth } from "@/src/modules/shared/auth/auth-context"

// =========================================================================
// MGA PRE-DEFINED QUESTIONS MO BAKS! (Laging naka-pin sa baba!)
// =========================================================================
const QUICK_REPLIES = [
  { id: "qr1", text: "How to book a venue?", reply: "To book a venue, head over to the 'My Bookings' tab on your sidebar, click 'Book Another Event', and choose your preferred schedule and venue! 😊" },
  { id: "qr2", text: "What are the payment options?", reply: "We accept Bank Transfers and Cash. You can choose to pay in Full or just a Down Payment to secure your slot." },
  { id: "qr3", text: "Can I cancel a booking?", reply: "Yes! You can cancel any 'Pending' booking directly from the 'My Bookings' tab. Just click the 'Cancel' button." }
]

export function ChatWindow({ mode }: { mode: "widget" | "full" }) {
  const { messages, sendMessage, toggleChat, currentClientId, markAdminAsRead, triggerWelcomeMessage } = useChat()
  const { user } = useAuth()
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const myMessages = messages.filter(m => 
    m.senderId === currentClientId || m.targetId === currentClientId
  )

  useEffect(() => {
    triggerWelcomeMessage()
  }, [triggerWelcomeMessage])

  useEffect(() => {
    markAdminAsRead()
  }, [myMessages, markAdminAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [myMessages, isTyping])

  // Normal Send (Manual Type)
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return
    
    sendMessage(inputValue.trim(), "user")
    setInputValue("")
    
    // Fake typing loader for normal messages
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      sendMessage("Thanks for reaching out! A venue manager will be with you shortly to assist with this.", "bot")
    }, 2000)
  }

  // Pre-defined Question Click Handler! 
  const handleQuickReply = (qr: {text: string, reply: string}) => {
    sendMessage(qr.text, "user") // 1. Send user question
    setIsTyping(true)            // 2. Show bot is typing
    
    setTimeout(() => {
      setIsTyping(false)         // 3. Hide typing
      sendMessage(qr.reply, "bot") // 4. Send the specific bot answer!
    }, 1500)
  }

  // Pinalaki ko yung floating widget height and width dito!
  const containerClasses = mode === "widget" 
    ? "flex flex-col h-[600px] w-[380px] bg-white rounded-[24px] shadow-2xl border border-gray-200 overflow-hidden" 
    : "flex flex-col h-full w-full bg-white overflow-hidden"

  return (
    <div className={containerClasses}>
      
      {/* CHAT HEADER */}
      <div className={`flex items-center justify-between shrink-0 z-20 transition-colors duration-300 ${mode === 'widget' ? 'bg-[#ea580c] p-4 md:p-5 text-white shadow-md' : 'bg-white p-4 md:p-6 border-b border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${mode === 'widget' ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#ea580c]'}`}>
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-400 border-2 rounded-full ${mode === 'widget' ? 'border-[#ea580c]' : 'border-white'}`}></div>
          </div>
          <div>
            <h3 className={`font-bold text-base md:text-lg ${mode === 'widget' ? 'text-white' : 'text-slate-900'}`}>Estela Place Admin</h3>
            <p className={`text-[11px] md:text-xs font-medium flex items-center mt-0.5 ${mode === 'widget' ? 'text-orange-100' : 'text-emerald-600'}`}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Online and ready to help
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {mode === "full" && (
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          )}
          {mode === "widget" && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8 transition-colors" onClick={toggleChat}>
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#fafaf9] flex flex-col gap-6" style={{ scrollbarWidth: 'thin' }}>
        
        {myMessages.map((msg) => {
          const isAdmin = msg.sender === 'admin' || msg.sender === 'bot'
          return (
            <div key={msg.id} className={`flex w-full ${isAdmin ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-2 md:gap-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                
                {/* AVATAR */}
                <div className="shrink-0 mt-auto hidden sm:block">
                  {isAdmin ? (
                    <div className="w-8 h-8 bg-orange-100 text-[#ea580c] rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                </div>

                {/* MESSAGE BUBBLE */}
                <div className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                  <div 
                    className={`p-3 md:p-4 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm
                      ${isAdmin 
                        ? 'bg-white border border-gray-100 text-slate-800 rounded-bl-none' 
                        : 'bg-[#ea580c] text-white rounded-br-none'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            </div>
          )
        })}

        {/* TYPING INDICATOR UI */}
        {isTyping && (
          <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-2 md:gap-3 max-w-[85%] md:max-w-[70%] flex-row">
              <div className="shrink-0 mt-auto hidden sm:block">
                <div className="w-8 h-8 bg-orange-100 text-[#ea580c] rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-white border border-gray-100 rounded-bl-none shadow-sm flex items-center gap-1.5 h-[40px] md:h-[48px]">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER AREA */}
      <div className="bg-white border-t border-gray-100 shrink-0 z-10 flex flex-col">
        
        {/* PRE-DEFINED QUESTIONS (PINNED HORIZONTAL SCROLL) */}
        {!isTyping && (
          <div className="px-4 py-3 flex gap-2 overflow-x-auto shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] bg-slate-50/50 border-b border-gray-100" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr.id}
                onClick={() => handleQuickReply(qr)}
                className="whitespace-nowrap text-xs font-bold text-[#ea580c] bg-white border border-orange-200 hover:bg-[#fff7ed] px-4 py-2 rounded-full transition-colors shadow-sm shrink-0"
              >
                {qr.text}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BOX */}
        <div className="p-3 md:p-4">
          <form onSubmit={handleSend} className="flex items-end gap-2 md:gap-3 relative">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[24px] p-1.5 md:p-2 flex items-center transition-colors focus-within:border-[#ea580c] focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50">
              
              <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-full shrink-0 h-8 w-8 md:h-10 md:w-10">
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 border-none shadow-none bg-transparent focus-visible:ring-0 px-2 md:px-3 text-[14px] md:text-[15px] h-8 md:h-10"
              />
              
            </div>

            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-full h-11 w-11 md:h-14 md:w-14 shrink-0 shadow-md transition-transform active:scale-[0.95] disabled:opacity-50 flex items-center justify-center p-0"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5 md:ml-1" />
            </Button>
          </form>
        </div>

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
          className="h-14 w-14 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
        >
          <MessageSquare className="w-6 h-6" />
          
          {unreadClientCount > 0 && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      )}
    </div>
  )
}