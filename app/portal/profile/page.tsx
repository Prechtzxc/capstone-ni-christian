"use client"

import { useAuth } from "@/src/modules/shared/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and personal information.</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="Add phone number" />
            </div>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}