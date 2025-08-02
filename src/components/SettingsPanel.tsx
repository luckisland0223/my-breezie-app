import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmotionStore } from '@/store/emotion'
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
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [language, setLanguage] = useState('zh-CN')
  const [theme, setTheme] = useState('auto')

  const clearAllRecords = useEmotionStore((state) => state.clearAllRecords)

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      clearAllRecords()
      toast.success('所有数据已清除')
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
    toast.success('数据导出成功')
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
            // 这里可以添加数据验证逻辑
            toast.success('数据导入成功')
          } catch (error) {
            toast.error('数据格式错误')
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
            设置
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* 通知设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知设置
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  每日情绪提醒
                </Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave" className="text-sm">
                  自动保存对话
                </Label>
                <Switch
                  id="autoSave"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </div>

          {/* 隐私设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              隐私设置
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="privacyMode" className="text-sm">
                  隐私模式
                </Label>
                <Switch
                  id="privacyMode"
                  checked={privacyMode}
                  onCheckedChange={setPrivacyMode}
                />
              </div>
            </div>
          </div>

          {/* 外观设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              外观设置
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">主题模式</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">跟随系统</SelectItem>
                    <SelectItem value="light">浅色模式</SelectItem>
    
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">语言</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 数据管理 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="w-5 h-5" />
              数据管理
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出数据
              </Button>
              <Button 
                variant="outline" 
                onClick={handleImportData}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                导入数据
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              className="flex items-center gap-2 w-full"
            >
              <Trash2 className="w-4 h-4" />
              清除所有数据
            </Button>
          </div>

          {/* 关于 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">关于 Breezie</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>版本: 1.0.0</p>
              <p>Breezie 是一个帮助你管理情绪的AI助手</p>
              <p>通过对话和记录，更好地了解和管理自己的情绪</p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  )
} 