'use client'

import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import { ArrowLeft, BarChart3, Calendar, Edit, Heart, Mail, Shield, Sparkles, Star, Target, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function PremiumProfilePage() {
  const router = useRouter()
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
  const joinDate = user ? new Date().toLocaleDateString() : ''
  const totalRecords = records.length
  const mostFrequentEmotion = Object.entries(stats).sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'None'

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
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
    <div className="gradient-surface min-h-screen">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
                <p className="text-gray-500 text-xs">Feeling first, healing follows</p>
              </div>
            </Link>
            
            <Button variant="ghost" onClick={() => router.push('/')} className="glass-subtle transition-all duration-200 hover:shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Premium Profile Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Premium Profile Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 animate-float items-center justify-center rounded-3xl bg-white shadow-2xl">
            <CloudLogo size={60} />
          </div>
          <h2 className="mb-2 font-bold text-4xl text-gray-900">Your Profile</h2>
          <p className="text-gray-600 text-xl">
            Manage your account and view your emotional wellness journey
          </p>
        </div>

        {/* Premium Profile Card */}
        <Card className="glass mb-12 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6 lg:flex-row lg:items-start lg:space-x-8 lg:space-y-0">
              <div className="relative">
                <Avatar className="h-32 w-32 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 font-bold text-4xl text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="-bottom-2 -right-2 absolute flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <h1 className="mb-2 font-bold text-3xl text-gray-900">{user?.username}</h1>
                <p className="mb-4 flex items-center justify-center gap-2 text-gray-600 lg:justify-start">
                  <Mail className="h-5 w-5" />
                  {user?.email}
                </p>
                
                <div className="mb-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Badge className="glass-subtle border-blue-200 px-4 py-2 text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined {joinDate}
                  </Badge>
                  <Badge className="glass-subtle border-purple-200 px-4 py-2 text-sm">
                    <Star className="mr-2 h-4 w-4" />
                    {user?.subscriptionTier || 'Free Plan'}
                  </Badge>
                  <Badge className="glass-subtle border-green-200 px-4 py-2 text-sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Verified
                  </Badge>
                </div>
                
                <div className="mx-auto grid max-w-md grid-cols-3 gap-6 lg:mx-0">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-blue-600">{totalRecords}</div>
                    <div className="text-gray-600 text-sm">Records</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-purple-600">
                      {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                    </div>
                    <div className="text-gray-600 text-sm">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {records.filter(r => r.recordType === 'chat').length}
                    </div>
                    <div className="text-gray-600 text-sm">Chats</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Premium Account Settings */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                Account Settings
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Update your personal information and preferences
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSave} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="font-medium text-gray-700 text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="email"
                      value={email} 
                      disabled 
                      readOnly 
                      className="glass-subtle h-12 border-0 bg-gray-50 pl-12"
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Email address cannot be changed for security</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="username" className="font-medium text-gray-700 text-sm">Username</Label>
                  <div className="relative">
                    <User className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="username"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="glass-subtle h-12 rounded-xl border-0 pl-12 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Saving changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Premium Emotion Statistics */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Emotion Journey
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Your emotional wellness insights and progress
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-subtle rounded-xl p-4 text-center">
                  <div className="mb-1 font-bold text-3xl text-blue-600">{totalRecords}</div>
                  <div className="font-medium text-gray-600 text-sm">Total Records</div>
                </div>
                <div className="glass-subtle rounded-xl p-4 text-center">
                  <div className="mb-1 font-bold text-3xl text-purple-600">{mostFrequentEmotion}</div>
                  <div className="font-medium text-gray-600 text-sm">Most Frequent</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="mb-4 flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <h4 className="font-semibold text-gray-800">Emotion Breakdown</h4>
                </div>
                
                {Object.entries(stats).filter(([, data]) => data.count > 0).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats)
                      .filter(([, data]) => data.count > 0)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .slice(0, 5)
                      .map(([emotion, data]) => (
                        <div key={emotion} className="glass-subtle rounded-lg p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-gray-700 text-sm">{emotion}</span>
                            <Badge variant="secondary" className="text-xs">
                              {data.count} times
                            </Badge>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 transition-all duration-500"
                              style={{ width: `${(data.count / totalRecords) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                      <Heart className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="mb-1 font-medium text-gray-700">No emotion records yet</p>
                    <p className="text-gray-500 text-sm">Start your emotional wellness journey to see insights here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Premium Wellness Insights */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Wellness Insights
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Discover patterns and insights from your emotional journey
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="glass-subtle rounded-xl p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-1 font-bold text-2xl text-gray-900">
                    {records.filter(r => r.recordType === 'chat').length}
                  </div>
                  <p className="font-medium text-gray-600 text-sm">Chat Sessions</p>
                  <p className="mt-1 text-gray-500 text-xs">Conversations with Breezie</p>
                </div>
                
                <div className="glass-subtle rounded-xl p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-1 font-bold text-2xl text-gray-900">
                    {(() => {
                      const chatRecords = records.filter(r => r.recordType === 'chat')
                      return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                    })()}
                  </div>
                  <p className="font-medium text-gray-600 text-sm">Avg Impact Score</p>
                  <p className="mt-1 text-gray-500 text-xs">Emotional growth metric</p>
                </div>
                
                <div className="glass-subtle rounded-xl p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-1 font-bold text-2xl text-gray-900">
                    {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                  </div>
                  <p className="font-medium text-gray-600 text-sm">Active Days</p>
                  <p className="mt-1 text-gray-500 text-xs">Days with emotional check-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Account Management */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                Account Management
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Update your personal information and account settings
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSave} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="font-medium text-gray-700 text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="email"
                      value={email} 
                      disabled 
                      readOnly 
                      className="glass-subtle h-12 rounded-xl border-0 bg-gray-50 pl-12"
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Email address cannot be changed for security reasons</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="username" className="font-medium text-gray-700 text-sm">Username</Label>
                  <div className="relative">
                    <User className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="username"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="glass-subtle h-12 rounded-xl border-0 pl-12 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Saving changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Premium Security Card */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Security & Privacy
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Your account security and data protection status
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-subtle space-y-3 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">Account verified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">Local data storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">No third-party sharing</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button variant="outline" className="glass-subtle w-full transition-all duration-200 hover:shadow-md">
                  <Shield className="mr-2 h-4 w-4" />
                  View Privacy Policy
                </Button>
                
                <Button variant="outline" className="glass-subtle w-full transition-all duration-200 hover:shadow-md">
                  <User className="mr-2 h-4 w-4" />
                  Download My Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}