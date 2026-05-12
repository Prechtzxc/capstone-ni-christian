"use client"

import AdminChatPanel from "@/src/modules/admin/components/admin-chat-panel"

export default function AdminChatPage() {
  return (
    <div className="p-4 md:p-6 w-full max-w-none h-[calc(100vh-2rem)] flex flex-col">
      {/* TANGGAL NA YUNG TEXT DITO, DIRECT CHAT PANEL NA AGAD */}
      <div className="flex-1 min-h-0">
        <AdminChatPanel />
      </div>
    </div>
  )
}