'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setUsername(user?.username || '')
    setEmail(user?.email || '')
  }, [user])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // demo: local update only; implement PUT /api/user/profile later
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-3">
            <Input value={email} disabled readOnly />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotion'
import { Calendar, Heart, TrendingUp, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const records = useEmotionStore((state) => state.records)
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = records.length
    const totalDays = new Set(records.map(r => new Date(r.timestamp).toDateString())).size
    const avgIntensity = records.length > 0 
      ? (records.reduce((sum, r) => sum + r.behavioralImpact, 0) / records.length).toFixed(1)
      : '0'
    
    // Most common emotion
    const emotionCounts = records.reduce((acc, record) => {
      acc[record.emotion] = (acc[record.emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    
    return {
      totalRecords,
      totalDays,
      avgIntensity,
      mostCommonEmotion
    }
  }, [records])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" alt="User Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                <Heart className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Emotion Profile</h1>
              <p className="text-gray-600">Personal overview of your emotional wellness journey</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              <p className="text-gray-600">Total Records</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
              <p className="text-gray-600">Days Tracked</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgIntensity}</p>
              <p className="text-gray-600">Average Intensity</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.mostCommonEmotion}</p>
              <p className="text-gray-600">Most Common Emotion</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-3">
                  {records
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((record, index) => (
                      <div key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium text-gray-900">{record.emotion}</span>
                          <p className="text-sm text-gray-600">
                            {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        <Badge variant="secondary">{record.behavioralImpact}/10</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No emotion records yet</p>
                  <p className="text-sm">Start recording your emotional journey!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    records.reduce((acc, record) => {
                      acc[record.emotion] = (acc[record.emotion] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([emotion, count]) => (
                      <div key={emotion} className="flex justify-between items-center">
                        <span className="text-gray-700">{emotion}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(count / records.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No emotion data yet</p>
                  <p className="text-sm">You'll see the distribution once you start recording</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              <Heart className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}