'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Bell, Palette, Heart, Settings, Sparkles, Shield, Moon, Sun } from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

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
    <div className="min-h-screen gradient-surface">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
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

      {/* Premium Settings Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-glow">
            <CloudLogo size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-lg text-gray-600">
            Personalize your Breezie experience for optimal emotional wellness
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Settings */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                Notifications
              </CardTitle>
              <p className="text-sm text-gray-600">
                Manage your notification preferences and reminders
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                      Daily Emotion Reminders
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
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
                    <Label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                      Auto-save Conversations
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
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
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                Appearance
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize the look and feel of your Breezie experience
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
                      Dark Mode
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
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
                    <Label htmlFor="advancedMode" className="text-sm font-medium text-gray-700">
                      Advanced Features
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
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
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Privacy & Security
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your data protection and privacy controls
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-subtle rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Local data storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">No third-party sharing</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full glass-subtle hover:shadow-md transition-all duration-200">
                <Shield className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Button>
            </CardContent>
          </Card>

          {/* About Breezie */}
          <Card className="glass shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <CloudLogo size={24} />
                </div>
                About Breezie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <CloudLogo size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Breezie v1.0</h3>
                  <p className="text-sm text-gray-600">Your AI Emotional Wellness Companion</p>
                  <p className="text-xs text-gray-500 mt-1">Feeling first, healing follows</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-subtle rounded-xl p-4 flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">AI-Powered Support</p>
                    <p className="text-xs text-gray-500">Intelligent emotional guidance</p>
                  </div>
                </div>
                
                <div className="glass-subtle rounded-xl p-4 flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Personalized Care</p>
                    <p className="text-xs text-gray-500">Tailored to your unique journey</p>
                  </div>
                </div>
                
                <div className="glass-subtle rounded-xl p-4 flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Privacy Protected</p>
                    <p className="text-xs text-gray-500">Your data stays secure and private</p>
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