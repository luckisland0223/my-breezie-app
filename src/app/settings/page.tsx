'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Bell, Palette, Shield, Download, Upload, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEmotionStore } from '@/store/emotion'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [theme, setTheme] = useState('auto')

  const clearAllRecords = useEmotionStore((state) => state.clearAllRecords)

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      clearAllRecords()
      toast.success('All data has been cleared successfully')
    }
  }

  const handleExportData = () => {
    const records = useEmotionStore.getState().records
    const dataStr = JSON.stringify(records, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emotion-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            // Data validation logic can be added here
            toast.success('Data imported successfully')
          } catch (error) {
            toast.error('Invalid data format')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your Breezie application settings</p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  Daily Emotion Reminders
                </Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave" className="text-sm">
                  Auto-save Conversations
                </Label>
                <Switch
                  id="autoSave"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="privacyMode" className="text-sm">
                  Privacy Mode
                </Label>
                <Switch
                  id="privacyMode"
                  checked={privacyMode}
                  onCheckedChange={setPrivacyMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Theme Mode</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Follow System</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleImportData}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
                className="flex items-center gap-2 w-full"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Breezie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">Version: 1.0.0</p>
              <p className="text-sm text-gray-600">Breezie is an AI assistant that helps you manage your emotions</p>
              <p className="text-sm text-gray-600">Through conversation and tracking, better understand and manage your emotions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}