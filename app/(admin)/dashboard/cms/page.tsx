'use client'

import { useState } from 'react'
import { MainLayout } from '@shared/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card'
import { Button } from '@shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs'
import { useCMS } from '@admin/contexts/cms-context'
import { CMSHomepageEditor } from '@admin/components/cms-homepage-editor'
import { CMSVenueEditor } from '@admin/components/cms-venue-editor'
import { CMSOfficeRoomEditor } from '@admin/components/cms-office-room-editor'
import { ImageIcon, Home, Building2, Save } from 'lucide-react'

export default function CMSPage() {
  const { cmsData } = useCMS()
  const [activeTab, setActiveTab] = useState('homepage')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management System</h1>
            <p className="text-muted-foreground">Manage all website content, images, and descriptions</p>
          </div>
          <Button className="gap-2" size="lg">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="homepage" className="gap-2">
              <Home className="h-4 w-4" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              <Building2 className="h-4 w-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="offices" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Office Spaces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
                <CardDescription>Edit all homepage sections including hero, about, and CTA sections</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSHomepageEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Venues</CardTitle>
                <CardDescription>Manage venue information, descriptions, images, and capacity details</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSVenueEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Office Spaces</CardTitle>
                <CardDescription>Manage ground floor and second floor office room content and images</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSOfficeRoomEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Real-Time Updates</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900">
            All changes made in this CMS are automatically reflected on the public website and within the 360-degree virtual tour. No coding or server restarts required.
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
