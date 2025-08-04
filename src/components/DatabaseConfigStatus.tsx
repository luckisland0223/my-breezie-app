'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getDbConfig, validateDbConfig } from '@/config/database'
import { CheckCircle, AlertCircle, Settings, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DatabaseConfigStatus() {
  const [config, setConfig] = useState(getDbConfig())
  const [isConfigured, setIsConfigured] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const dbConfig = getDbConfig()
    setConfig(dbConfig)
    setIsConfigured(validateDbConfig(dbConfig))
  }, [])

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>数据库已配置</strong> - 云端存储和同步功能已启用
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          数据库未配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700 text-sm">
          当前使用本地存储模式。要启用云端存储和跨设备同步，请配置Supabase数据库。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            界面配置
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 打开配置文件的提示
              alert('请编辑 src/config/database.ts 文件，在其中直接设置您的Supabase配置信息。')
            }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            代码配置
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>代码配置：</strong> 编辑 <code>src/config/database.ts</code> 文件<br/>
            <strong>界面配置：</strong> 使用设置页面进行配置
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}