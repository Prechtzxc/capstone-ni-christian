"use client"

import AdminChatPanel from "@/src/modules/admin/components/admin-chat-panel"

export default function AdminChatPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 w-full max-w-none h-[calc(100vh-2rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customer Support</h1>
        <p className="text-gray-500 text-sm">Live chat synchronization.</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <AdminChatPanel />
      </div>
    </div>
  )
}