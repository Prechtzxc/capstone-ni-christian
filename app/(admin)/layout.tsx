"use client"

import type React from "react"
import { ReportsProvider } from "@admin/contexts/reports-context"
import { CMSProvider } from "@admin/contexts/cms-context"
import { StaffProvider } from "@admin/contexts/staff-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CMSProvider>
      <StaffProvider>
        <ReportsProvider>
          {/* Admin specific sidebar/navigation will go here later */}
          {children}
        </ReportsProvider>
      </StaffProvider>
    </CMSProvider>
  )
}