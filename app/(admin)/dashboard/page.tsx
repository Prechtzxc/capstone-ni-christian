"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  RotateCcw,
  Shield,
  Clock,
  Lock,
  Unlock,
  Settings,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  LayoutDashboard
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome to the One Estela Place reservation system.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white shadow-sm">
            <Download className="h-4 w-4 mr-2" /> Export Summary
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">12</div>
            <p className="text-xs text-green-600 font-medium mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">145</div>
            <p className="text-xs text-green-600 font-medium mt-1">+24 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">32</div>
            <p className="text-xs text-green-600 font-medium mt-1">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">4.8</div>
            <p className="text-xs text-green-600 font-medium mt-1">+0.2 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Calendar Section */}
      <div className="mt-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Calendar className="h-6 w-6 text-purple-600" />
            Booking Calendar - Venue Management
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-white shadow-sm">
              <Settings className="h-4 w-4 mr-2 text-gray-600" />
              Calendar Rules
            </Button>
            <Button size="sm" variant="outline" className="bg-white shadow-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              Time Slots
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Calendar View */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                <CardTitle className="text-lg">June 2025 - Venue Availability</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {/* Calendar Header */}
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Sun</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Mon</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Tue</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Wed</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Thu</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Fri</div>
                  <div className="font-semibold text-gray-500 pb-2 border-b border-gray-100">Sat</div>

                  {/* Calendar Days (Row 1) */}
                  <div className="p-3 text-gray-400 font-medium">1</div>
                  <div className="p-3 text-gray-400 font-medium">2</div>
                  <div className="p-3 text-gray-400 font-medium">3</div>
                  <div className="p-3 text-gray-400 font-medium">4</div>
                  <div className="p-3 text-gray-400 font-medium">5</div>
                  <div className="p-3 text-gray-400 font-medium">6</div>
                  <div className="p-3 text-gray-400 font-medium">7</div>

                  {/* Calendar Days (Row 2) */}
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">8</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">9</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">10</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">11</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">12</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">13</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">14</div>

                  {/* Calendar Days (Row 3) */}
                  <div className="p-3 bg-red-500 text-white shadow-sm rounded-md font-bold cursor-pointer hover:bg-red-600 transition-colors">
                    15
                  </div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">16</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">17</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">18</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">19</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">20</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">21</div>

                  {/* Calendar Days (Row 4) */}
                  <div className="p-3 bg-red-500 text-white shadow-sm rounded-md font-bold cursor-pointer hover:bg-red-600 transition-colors">
                    22
                  </div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">23</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">24</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">25</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">26</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">27</div>
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">28</div>

                  {/* Calendar Days (Row 5) */}
                  <div className="p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-md cursor-pointer transition-colors">29</div>
                  <div className="p-3 bg-red-500 text-white shadow-sm rounded-md font-bold cursor-pointer hover:bg-red-600 transition-colors">
                    30
                  </div>
                </div>

                {/* Calendar Legend */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm bg-gray-50 py-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded shadow-sm"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <div className="w-4 h-4 bg-yellow-400 rounded shadow-sm"></div>
                    <span>Blocked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Calendar Controls & Quick Reservations */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                <CardTitle className="text-lg">Availability Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Date Management</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start bg-white shadow-sm border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors">
                      <Lock className="h-4 w-4 mr-2 text-red-500" /> Block Selected Dates
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start bg-white shadow-sm border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors">
                      <Unlock className="h-4 w-4 mr-2 text-green-500" /> Open Selected Dates
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Schedule Rules</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start bg-white shadow-sm border-gray-200">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" /> Manage Event Schedules
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start bg-white shadow-sm border-gray-200">
                      <Settings className="h-4 w-4 mr-2 text-gray-500" /> Booking Rules
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                <CardTitle className="text-lg">Current Reservations</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Jun 15 - Wedding</div>
                      <div className="text-gray-500 text-xs mt-0.5">Maria Santos</div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">Reserved</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Jun 22 - Corporate</div>
                      <div className="text-gray-500 text-xs mt-0.5">Tech Solutions</div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">Reserved</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Jun 30 - Birthday</div>
                      <div className="text-gray-500 text-xs mt-0.5">John Miller</div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">Reserved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
        <Card className="shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Wedding Reception</td>
                  <td className="px-6 py-4 text-gray-600">Jun 15, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Maria Santos</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Corporate Seminar</td>
                  <td className="px-6 py-4 text-gray-600">Jun 22, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Tech Solutions Inc.</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Birthday Party</td>
                  <td className="px-6 py-4 text-gray-600">Jun 30, 2025</td>
                  <td className="px-6 py-4 text-gray-600">John Miller</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Charity Gala</td>
                  <td className="px-6 py-4 text-gray-600">Jul 05, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Hope Foundation</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New Request
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Owner Controls Table */}
      <div className="mt-12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Shield className="h-6 w-6 text-blue-600" />
            Booking Management - Owner Controls
          </h2>
          <div className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Final Authority Override Active
          </div>
        </div>

        <Card className="shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Manager Decision</th>
                  <th className="px-6 py-4 text-right">Owner Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Wedding Reception</td>
                  <td className="px-6 py-4 text-gray-600">Jun 15, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Maria Santos</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green-600">Approved</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:border-amber-200">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Corporate Seminar</td>
                  <td className="px-6 py-4 text-gray-600">Jun 22, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Tech Solutions Inc.</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Review</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 italic">Awaiting Decision</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Birthday Party</td>
                  <td className="px-6 py-4 text-gray-600">Jun 30, 2025</td>
                  <td className="px-6 py-4 text-gray-600">John Miller</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green-600">Approved</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:border-amber-200">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Charity Gala</td>
                  <td className="px-6 py-4 text-gray-600">Jul 05, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Hope Foundation</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Manager Denied</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-red-600">Denied - Conflict</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Shield className="h-3 w-3 mr-2" /> Override
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Product Launch</td>
                  <td className="px-6 py-4 text-gray-600">Jul 12, 2025</td>
                  <td className="px-6 py-4 text-gray-600">Innovation Corp</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">New Request</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 italic">Pending Review</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Legend */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" /> <span>Approve</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" /> <span>Deny</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-gray-500" /> <span>Reschedule/Edit</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" /> <span>Override Manager</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}