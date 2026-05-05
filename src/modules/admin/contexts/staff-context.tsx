'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface StaffAccount {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  status: 'Active' | 'Inactive'
  createdAt: string
  createdBy: string
}

interface StaffContextType {
  staff: StaffAccount[]
  addStaff: (staffData: Omit<StaffAccount, 'id' | 'createdAt' | 'createdBy'>) => void
  updateStaff: (id: string, staffData: Partial<StaffAccount>) => void
  deactivateStaff: (id: string) => void
  activateStaff: (id: string) => void
  getStaffById: (id: string) => StaffAccount | undefined
}

const StaffContext = createContext<StaffContextType | undefined>(undefined)

// Mock initial staff data
const initialStaffData: StaffAccount[] = [
  {
    id: 'staff-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@oneestela.com',
    phone: '+1-555-0101',
    position: 'Event Manager',
    hireDate: '2023-06-15',
    status: 'Active',
    createdAt: '2023-06-15T10:00:00Z',
    createdBy: 'admin@oneestela.com',
  },
  {
    id: 'staff-002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@oneestela.com',
    phone: '+1-555-0102',
    position: 'Customer Service Representative',
    hireDate: '2023-08-20',
    status: 'Active',
    createdAt: '2023-08-20T10:00:00Z',
    createdBy: 'admin@oneestela.com',
  },
  {
    id: 'staff-003',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@oneestela.com',
    phone: '+1-555-0103',
    position: 'Facilities Manager',
    hireDate: '2023-05-10',
    status: 'Active',
    createdAt: '2023-05-10T10:00:00Z',
    createdBy: 'admin@oneestela.com',
  },
]

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffAccount[]>(initialStaffData)

  const addStaff = useCallback(
    (staffData: Omit<StaffAccount, 'id' | 'createdAt' | 'createdBy'>) => {
      const newStaff: StaffAccount = {
        ...staffData,
        id: `staff-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@oneestela.com',
      }
      setStaff((prev) => [...prev, newStaff])
      return newStaff
    },
    [],
  )

  const updateStaff = useCallback((id: string, staffData: Partial<StaffAccount>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...staffData } : s)))
  }, [])

  const deactivateStaff = useCallback((id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Inactive' } : s)))
  }, [])

  const activateStaff = useCallback((id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Active' } : s)))
  }, [])

  const getStaffById = useCallback(
    (id: string) => {
      return staff.find((s) => s.id === id)
    },
    [staff],
  )

  const value: StaffContextType = {
    staff,
    addStaff,
    updateStaff,
    deactivateStaff,
    activateStaff,
    getStaffById,
  }

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider')
  }
  return context
}
