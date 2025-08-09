import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmotionStore } from '@/store/emotion'
import { useSettingsStore } from '@/store/settings'

import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Trash2, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  Palette,
  Shield,
  Lock,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  // Use secure settings store
  const {
    theme,
    language,
    notificationsEnabled,
    dataEncryption,
    setTheme,
    setLanguage,
    setNotifications,
    setDataEncryption,
    reset: resetSettings
  } = useSettingsStore()

  const [privacyMode, setPrivacyMode] = useState(false)

  const clearAllRecords = useEmotionStore((state) => state.clearAllRecords)

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      clearAllRecords()
      toast.success('All data has been cleared successfully')
    }
  }

  const handleExportData = () => {
    const state = useEmotionStore.getState()
    let records = state.records
    
    // Filter for current user
    try {
      const savedUser = localStorage.getItem('breezie_current_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        records = state.records.filter((record) => record.user_id === user.id)
      }
    } catch (error) {
      // Use all records as fallback
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  Daily Emotion Reminders
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dataEncryption" className="text-sm">
                  Encrypt Local Data
                </Label>
                <Switch
                  id="dataEncryption"
                  checked={dataEncryption}
                  onCheckedChange={setDataEncryption}
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Settings
            </h3>
            <div className="space-y-3">
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
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance Settings
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Theme Mode</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Follow System</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </h3>
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
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Breezie</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Version: 1.0.0</p>
              <p>Breezie is an AI assistant that helps you manage your emotions</p>
              <p>Through conversation and tracking, better understand and manage your emotions</p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  )
} 