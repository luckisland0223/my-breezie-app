'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import { User, Mail, Calendar, Shield, BarChart3, Heart, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const { records, stats } = useEmotionStore()
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setUsername(user?.username || '')
    setEmail(user?.email || '')
  }, [user])

  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U'
  const joinDate = user ? new Date().toLocaleDateString() : '' // Placeholder - should come from user data
  const totalRecords = records.length
  const mostFrequentEmotion = Object.entries(stats).sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'None'

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      // For now, just simulate save - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Update local state (in real app, this would come from server response)
      if (updateProfile) {
        updateProfile({ username })
      }
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinDate}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {user?.subscriptionTier || 'Free'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSave} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    value={email} 
                    disabled 
                    readOnly 
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Emotion Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Emotion Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{mostFrequentEmotion}</div>
                  <div className="text-sm text-gray-600">Most Frequent</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Emotion Breakdown
                </h4>
                {Object.entries(stats).filter(([, data]) => data.count > 0).map(([emotion, data]) => (
                  <div key={emotion} className="flex justify-between items-center">
                    <span className="text-sm">{emotion}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(data.count / totalRecords) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{data.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalRecords === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No emotion records yet</p>
                  <p className="text-sm">Start tracking your emotions to see insights here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
}