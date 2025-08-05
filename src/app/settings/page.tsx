'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Bell, Palette, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked)
    toast.success(checked ? '已开启情绪提醒' : '已关闭情绪提醒')
  }

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked)
    toast.success(checked ? '已开启自动保存' : '已关闭自动保存')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              设置
            </h1>
          </div>
          <p className="text-gray-600">个性化你的 Breezie 体验</p>
        </div>

        <div className="space-y-6">
          {/* 通知设置 */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-blue-500" />
                通知设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    每日情绪提醒
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    提醒你记录每天的情绪状态
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
                    自动保存对话
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    自动保存你与 Breezie 的对话记录
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

          {/* 外观设置 */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-purple-500" />
                外观设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>Breezie 会自动适应你的系统主题设置</p>
                <p className="text-xs text-gray-500 mt-1">支持浅色和深色模式</p>
              </div>
            </CardContent>
          </Card>

          {/* 关于 Breezie */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">关于 Breezie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Breezie</h3>
                  <p className="text-sm text-gray-600">情绪健康助手 v1.0.0</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>🌟 通过智能对话帮助你理解和管理情绪</p>
                <p>📊 追踪情绪变化，发现内心规律</p>
                <p>💝 陪伴你的情绪健康之旅</p>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  你的隐私和数据安全是我们的首要关注
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}