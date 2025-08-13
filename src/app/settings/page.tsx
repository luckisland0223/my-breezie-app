'use client'

import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Bell, Heart, Moon, Palette, Settings, Shield, Sparkles, Sun } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PremiumSettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)

  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked)
    toast.success(checked ? 'Emotion reminders enabled' : 'Emotion reminders disabled')
  }

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked)
    toast.success(checked ? 'Auto-save enabled' : 'Auto-save disabled')
  }

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked)
    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled')
  }

  const handleAdvancedModeChange = (checked: boolean) => {
    setAdvancedMode(checked)
    toast.success(checked ? 'Advanced features enabled' : 'Simple mode enabled')
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

      {/* Premium Settings Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-glow items-center justify-center rounded-2xl bg-white shadow-xl">
            <CloudLogo size={40} />
          </div>
          <h2 className="mb-2 font-bold text-3xl text-gray-900">Settings</h2>
          <p className="text-gray-600 text-lg">
            Personalize your Breezie experience for optimal emotional wellness
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Notification Settings */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Notifications
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Manage your notification preferences and reminders
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="notifications" className="font-medium text-gray-700 text-sm">
                      Daily Emotion Reminders
                    </Label>
                    <p className="mt-1 text-gray-500 text-xs">
                      Gentle reminders to check in with your emotions
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={handleNotificationChange}
                  />
                </div>
              </div>
              
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="autoSave" className="font-medium text-gray-700 text-sm">
                      Auto-save Conversations
                    </Label>
                    <p className="mt-1 text-gray-500 text-xs">
                      Automatically save your conversations with Breezie
                    </p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={autoSave}
                    onCheckedChange={handleAutoSaveChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                Appearance
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Customize the look and feel of your Breezie experience
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="darkMode" className="font-medium text-gray-700 text-sm">
                      Dark Mode
                    </Label>
                    <p className="mt-1 text-gray-500 text-xs">
                      Switch to a darker theme for comfortable night use
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeChange}
                  />
                </div>
              </div>
              
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="advancedMode" className="font-medium text-gray-700 text-sm">
                      Advanced Features
                    </Label>
                    <p className="mt-1 text-gray-500 text-xs">
                      Enable advanced analytics and detailed insights
                    </p>
                  </div>
                  <Switch
                    id="advancedMode"
                    checked={advancedMode}
                    onCheckedChange={handleAdvancedModeChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Privacy & Security
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Your data protection and privacy controls
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-subtle space-y-3 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">Local data storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 text-sm">No third-party sharing</span>
                </div>
              </div>
              
              <Button variant="outline" className="glass-subtle w-full transition-all duration-200 hover:shadow-md">
                <Shield className="mr-2 h-4 w-4" />
                View Privacy Policy
              </Button>
            </CardContent>
          </Card>

          {/* About Breezie */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                  <CloudLogo size={24} />
                </div>
                About Breezie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <CloudLogo size={40} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Breezie v1.0</h3>
                  <p className="text-gray-600 text-sm">Your AI Emotional Wellness Companion</p>
                  <p className="mt-1 text-gray-500 text-xs">Feeling first, healing follows</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-subtle flex items-center space-x-3 rounded-xl p-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">AI-Powered Support</p>
                    <p className="text-gray-500 text-xs">Intelligent emotional guidance</p>
                  </div>
                </div>
                
                <div className="glass-subtle flex items-center space-x-3 rounded-xl p-4">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">Personalized Care</p>
                    <p className="text-gray-500 text-xs">Tailored to your unique journey</p>
                  </div>
                </div>
                
                <div className="glass-subtle flex items-center space-x-3 rounded-xl p-4">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">Privacy Protected</p>
                    <p className="text-gray-500 text-xs">Your data stays secure and private</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}