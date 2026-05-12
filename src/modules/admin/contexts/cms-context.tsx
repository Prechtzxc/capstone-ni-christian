'use client'

import React, { createContext, useContext } from 'react'
import { useHomepageContent, useVenues, useOfficeRoomsByFloor } from '@shared/hooks/use-cms-content'
import { contentService, Venue, OfficeRoom, HomepageContent } from '@shared/lib/content-service'

export interface CMSContextType {
  homepage: HomepageContent | null
  venues: Venue[]
  officeRoomsGround: OfficeRoom[]
  officeRoomsSecond: OfficeRoom[]
  isLoading: boolean
  updateHomepage: (updates: Partial<HomepageContent>) => void
  addVenue: (venue: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateVenue: (id: string, updates: Partial<Venue>) => void
  deleteVenue: (id: string) => void
  addOfficeRoom: (room: Omit<OfficeRoom, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateOfficeRoom: (id: string, updates: Partial<OfficeRoom>) => void
  deleteOfficeRoom: (id: string) => void
}

const CMSContext = createContext<CMSContextType | undefined>(undefined)

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const { content: homepage, updateContent: updateHomepage } = useHomepageContent()
  const { venues } = useVenues()
  const { rooms: officeRoomsGround } = useOfficeRoomsByFloor('ground')
  const { rooms: officeRoomsSecond } = useOfficeRoomsByFloor('second')

  const value: CMSContextType = {
    homepage,
    venues,
    officeRoomsGround,
    officeRoomsSecond,
    isLoading: !homepage || !venues,
    updateHomepage,
    addVenue: (venue) => contentService.addVenue(venue),
    updateVenue: (id, updates) => contentService.updateVenue(id, updates),
    deleteVenue: (id) => contentService.deleteVenue(id),
    addOfficeRoom: (room) => contentService.addOfficeRoom(room),
    updateOfficeRoom: (id, updates) => contentService.updateOfficeRoom(id, updates),
    deleteOfficeRoom: (id) => contentService.deleteOfficeRoom(id),
  }

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>
}

export function useCMS() {
  const context = useContext(CMSContext)
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider')
  }
  return context
}
