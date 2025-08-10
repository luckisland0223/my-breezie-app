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
import { User, Mail, Calendar, Shield, BarChart3, Heart, Star, ArrowLeft, Sparkles, TrendingUp, Target, Edit } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen gradient-surface">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Breezie
                </h1>
                <p className="text-xs text-gray-500">Feeling first, healing follows</p>
              </div>
            </Link>
            
            <Button variant="ghost" onClick={() => router.push('/')} className="glass-subtle hover:shadow-md transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Premium Profile Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Premium Profile Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-xl text-gray-600">
            Manage your account and view your emotional wellness journey
          </p>
        </div>

        {/* Premium Profile Card */}
        <Card className="glass shadow-2xl border-0 mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative">
                <Avatar className="h-32 w-32 shadow-xl">
                  <AvatarFallback className="text-4xl font-bold gradient-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.username}</h1>
                <p className="text-gray-600 flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Mail className="h-5 w-5" />
                  {user?.email}
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <Badge className="glass-subtle border-blue-200 px-4 py-2 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {joinDate}
                  </Badge>
                  <Badge className="glass-subtle border-purple-200 px-4 py-2 text-sm">
                    <Star className="h-4 w-4 mr-2" />
                    {user?.subscriptionTier || 'Free Plan'}
                  </Badge>
                  <Badge className="glass-subtle border-green-200 px-4 py-2 text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Verified
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                    <div className="text-sm text-gray-600">Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                    </div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {records.filter(r => r.recordType === 'chat').length}
                    </div>
                    <div className="text-sm text-gray-600">Chats</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Account Settings */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Account Settings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Update your personal information and preferences
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSave} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email"
                      value={email} 
                      disabled 
                      readOnly 
                      className="pl-12 h-12 glass-subtle border-0 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email address cannot be changed for security</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="username"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="pl-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Saving changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Premium Emotion Statistics */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Emotion Journey
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your emotional wellness insights and progress
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center glass-subtle rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{totalRecords}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Records</div>
                </div>
                <div className="text-center glass-subtle rounded-xl p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{mostFrequentEmotion}</div>
                  <div className="text-sm text-gray-600 font-medium">Most Frequent</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
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
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{emotion}</span>
                            <Badge variant="secondary" className="text-xs">
                              {data.count} times
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="gradient-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(data.count / totalRecords) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium text-gray-700 mb-1">No emotion records yet</p>
                    <p className="text-sm text-gray-500">Start your emotional wellness journey to see insights here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Premium Wellness Insights */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Wellness Insights
              </CardTitle>
              <p className="text-sm text-gray-600">
                Discover patterns and insights from your emotional journey
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center glass-subtle rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {records.filter(r => r.recordType === 'chat').length}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Chat Sessions</p>
                  <p className="text-xs text-gray-500 mt-1">Conversations with Breezie</p>
                </div>
                
                <div className="text-center glass-subtle rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(() => {
                      const chatRecords = records.filter(r => r.recordType === 'chat')
                      return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Avg Impact Score</p>
                  <p className="text-xs text-gray-500 mt-1">Emotional growth metric</p>
                </div>
                
                <div className="text-center glass-subtle rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Active Days</p>
                  <p className="text-xs text-gray-500 mt-1">Days with emotional check-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Account Management */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Account Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Update your personal information and account settings
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSave} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email"
                      value={email} 
                      disabled 
                      readOnly 
                      className="pl-12 h-12 glass-subtle border-0 bg-gray-50 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email address cannot be changed for security reasons</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="username"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="pl-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Saving changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Premium Security Card */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Security & Privacy
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your account security and data protection status
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-subtle rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Account verified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Local data storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">No third-party sharing</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full glass-subtle hover:shadow-md transition-all duration-200">
                  <Shield className="w-4 h-4 mr-2" />
                  View Privacy Policy
                </Button>
                
                <Button variant="outline" className="w-full glass-subtle hover:shadow-md transition-all duration-200">
                  <User className="w-4 h-4 mr-2" />
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