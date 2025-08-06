'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Trash2, UserX, Database } from 'lucide-react'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteFromDatabase = async () => {
    if (!userId && !email) {
      toast.error('Please provide either User ID or Email')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User data deleted from database successfully')
        setUserId('')
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to delete user data from database')
      }
    } catch (error) {
      toast.error('Error deleting user data from database')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteFromAuth = async () => {
    if (!userId && !email) {
      toast.error('Please provide either User ID or Email')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/delete-auth-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User deleted from auth system successfully')
        setUserId('')
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to delete user from auth system')
      }
    } catch (error) {
      toast.error('Error deleting user from auth system')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCompleteDelete = async () => {
    if (!userId && !email) {
      toast.error('Please provide either User ID or Email')
      return
    }

    setIsDeleting(true)
    try {
      // First delete from database
      await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email })
      })

      // Then delete from auth system
      const authResponse = await fetch('/api/admin/delete-auth-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email })
      })

      const authData = await authResponse.json()

      if (authResponse.ok) {
        toast.success('User completely deleted from both database and auth system')
        setUserId('')
        setEmail('')
      } else {
        toast.error(authData.error || 'Failed to complete user deletion')
      }
    } catch (error) {
      toast.error('Error during complete user deletion')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage user accounts and resolve login issues</p>
        </div>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <UserX className="w-5 h-5" />
              User Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Problem Description</h3>
              <p className="text-yellow-700 text-sm">
                If a user was deleted from the database but can still log in, it means their account exists in Supabase Auth but not in the profiles table.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="userId">User ID (Optional)</Label>
                <Input
                  id="userId"
                  placeholder="User UUID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Actions:</h3>
              
              <Button
                onClick={handleDeleteFromDatabase}
                disabled={isDeleting}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Delete from Database Only
              </Button>

              <Button
                onClick={handleDeleteFromAuth}
                disabled={isDeleting}
                variant="outline"
                className="w-full flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <UserX className="w-4 h-4" />
                Delete from Auth System Only
              </Button>

              <Button
                onClick={handleCompleteDelete}
                disabled={isDeleting}
                variant="destructive"
                className="w-full flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Complete Deletion (Both Database & Auth)'}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Solution</h3>
              <p className="text-blue-700 text-sm">
                Use "Complete Deletion" to remove the user from both the database and Supabase Auth system. 
                This will prevent them from logging in again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}