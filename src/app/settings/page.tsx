'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RequireVerifiedEmail } from '@/components/AuthGuard'
import { ArrowLeft, Bell, Palette, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked)
    toast.success(checked ? 'Emotion reminders enabled' : 'Emotion reminders disabled')
  }

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked)
    toast.success(checked ? 'Auto-save enabled' : 'Auto-save disabled')
  }

  return (
    <RequireVerifiedEmail>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-gray-600">Personalize your Breezie experience</p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-blue-500" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Daily Emotion Reminders
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Remind you to record your daily emotional state
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave" className="text-sm font-medium">
                    Auto-save Conversations
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically save your conversation records with Breezie
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={autoSave}
                  onCheckedChange={handleAutoSaveChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-purple-500" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>Breezie automatically adapts to your system theme settings</p>
                <p className="text-xs text-gray-500 mt-1">Supports light and dark modes</p>
              </div>
            </CardContent>
          </Card>

          {/* About Breezie */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">About Breezie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Breezie</h3>
                  <p className="text-sm text-gray-600">Emotional Health Assistant v1.0.0</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>🌟 Help you understand and manage emotions through intelligent conversations</p>
                <p>📊 Track emotional changes and discover inner patterns</p>
                <p>💝 Accompany you on your emotional health journey</p>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Your privacy and data security are our top priority
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </RequireVerifiedEmail>
  )
}