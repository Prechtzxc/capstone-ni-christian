"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "@/src/modules/shared/contexts/chat-context"

export function MessengerChatInterface() {
  const { messages, sendMessage, isConnected } = useChat()
  const [input, setInput] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Group messages to find unique clients for the sidebar
  const clientsMap = new Map()
  messages.forEach(msg => {
    if (msg.senderType === "client") {
      clientsMap.set(msg.senderId, {
        id: msg.senderId,
        name: msg.senderName,
        lastMessage: msg.content,
        time: msg.timestamp
      })
    }
  })
  const clients = Array.from(clientsMap.values())

  // Auto-select the first client if the admin hasn't clicked one yet
  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id)
    }
  }, [clients, selectedClientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 2. Filter messages for the active conversation pane
  const activeMessages = messages.filter(msg =>
    (msg.senderType === "client" && msg.senderId === selectedClientId) ||
    (msg.senderType === "admin" && msg.recipientId === selectedClientId)
  )

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedClientId) return

    // Admin MUST send the selectedClientId so the socket knows who to deliver it to
    sendMessage(input, selectedClientId) 
    setInput("")
  }

  const activeClient = clients.find(c => c.id === selectedClientId)

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      
      {/* Sidebar: Client List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-lg text-gray-900">Conversations</h2>
          <div className="flex items-center gap-2 mt-1 text-sm">
             <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
             <span className="text-gray-500">{isConnected ? "System Online" : "Disconnected"}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {clients.length === 0 ? (
             <div className="p-6 text-center text-gray-500 text-sm">No client conversations yet.</div>
          ) : (
            clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                  selectedClientId === client.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-gray-900">{client.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(client.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Active Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedClientId ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
              <div>
                <h3 className="font-semibold text-gray-900">{activeClient?.name}</h3>
                <p className="text-xs text-gray-500">Client ID: {selectedClientId.slice(0, 8)}...</p>
              </div>
            </div>

            {/* Active Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
              {activeMessages.map((msg) => {
                const isAdmin = msg.senderType === "admin"
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isAdmin ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                    }`}>
                      <p className="text-sm md:text-base">{msg.content}</p>
                      <span className={`text-[11px] block mt-1.5 ${isAdmin ? "text-blue-100" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex gap-3">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Reply to ${activeClient?.name}...`}
                  className="flex-1 rounded-full"
                />
                <Button type="submit" className="bg-blue-600 text-white rounded-full px-6">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <ShieldAlert className="w-16 h-16 text-gray-200 mb-4" />
            <p>Select a conversation from the sidebar to view messages.</p>
          </div>
        )}
      </div>
    </div>
  )
}