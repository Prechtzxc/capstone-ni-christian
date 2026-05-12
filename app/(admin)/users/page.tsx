'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Mail, CheckCircle, AlertCircle } from 'lucide-react'

// Mock data for registered customer accounts
const registeredCustomers = [
  { id: 1, name: 'James Wilson', email: 'james.wilson@email.com', registeredDate: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Emily Brown', email: 'emily.brown@email.com', registeredDate: '2024-02-03', status: 'Active' },
  { id: 3, name: 'Robert Taylor', email: 'robert.taylor@email.com', registeredDate: '2024-02-10', status: 'Active' },
  { id: 4, name: 'Lisa Anderson', email: 'lisa.anderson@email.com', registeredDate: '2024-01-28', status: 'Active' },
  { id: 5, name: 'Michael Garcia', email: 'michael.garcia@email.com', registeredDate: '2024-02-05', status: 'Inactive' },
  { id: 6, name: 'Jennifer Martinez', email: 'jennifer.martinez@email.com', registeredDate: '2024-02-12', status: 'Active' },
  { id: 7, name: 'David Rodriguez', email: 'david.rodriguez@email.com', registeredDate: '2024-01-20', status: 'Active' },
  { id: 8, name: 'Sarah Thompson', email: 'sarah.thompson@email.com', registeredDate: '2024-02-08', status: 'Active' },
]

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = registeredCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCount = registeredCustomers.filter((c) => c.status === 'Active').length
  const inactiveCount = registeredCustomers.filter((c) => c.status === 'Inactive').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Information</h1>
        <p className="text-muted-foreground mt-1">
          Read-only view of all registered customer accounts. Displays account details for administrative reference.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredCustomers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Customer List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {registeredCustomers.length} customers displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium">Name</th>
                    <th className="h-12 px-4 text-left font-medium">Email</th>
                    <th className="h-12 px-4 text-left font-medium">Registered Date</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{customer.name}</td>
                        <td className="p-4 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {customer.email}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">{customer.registeredDate}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              customer.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No customers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Read-Only Notice */}
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Read-Only Access:</strong> This module displays registered customer account information for administrative reference only.
              No modifications (add, edit, or delete) are permitted in this view.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}