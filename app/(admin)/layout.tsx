"use client"

import type React from "react"
// Ibinalik sa original na working imports mo
import { ReportsProvider } from "@admin/contexts/reports-context"
import { CMSProvider } from "@admin/contexts/cms-context"
import { StaffProvider } from "@admin/contexts/staff-context"

// Import ng MainLayout gamit ang tamang path
import { MainLayout } from "@/components/main-layout" 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CMSProvider>
      <StaffProvider>
        <ReportsProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ReportsProvider>
      </StaffProvider>
    </CMSProvider>
  )
}