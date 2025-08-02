import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { EmotionRecord } from '@/store/emotion'

interface EmotionChartProps {
  records: EmotionRecord[]
}

// 情绪颜色映射 - 淡色调
const emotionColorMap: Record<string, string> = {
  '愤怒': '#fca5a5',   // 淡红色
  '厌恶': '#fdba74',   // 淡橙色
  '恐惧': '#c4b5fd',   // 淡紫色
  '快乐': '#86efac',   // 淡绿色
  '悲伤': '#93c5fd',   // 淡蓝色
  '惊讶': '#fde047',   // 淡黄色
  '复杂': '#a5b4fc'    // 淡靛蓝色
}

export function EmotionChart({ records }: EmotionChartProps) {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        还没有情绪记录，开始第一次对话来生成图表吧！
      </div>
    )
  }

  // 统计各种情绪的出现次数
  const emotionCount = records.reduce((acc, record) => {
    acc[record.emotion] = (acc[record.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 将统计数据转换为饼图数据格式
  const pieData = Object.entries(emotionCount).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    percentage: Math.round((count / records.length) * 100)
  }))

  // 获取最常见的情绪
  const mostFrequentEmotion = pieData.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  )

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: Array<{
      payload: {
        name: string
        value: number
        percentage: number
      }
    }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data?.name}</p>
          <p className="text-sm text-gray-600">次数: {data?.value}</p>
          <p className="text-sm text-gray-600">占比: {data?.percentage}%</p>
        </div>
      )
    }
    return null
  }

  // 自定义标签
  const renderLabel = ({ name, percentage }: {
    name: string
    percentage: number
  }) => {
    return `${name}: ${percentage}%`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">情绪分布图</h3>
        <div className="text-sm text-gray-600">
          总记录: {records.length} 次
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={emotionColorMap[entry.name] || '#6b7280'} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {pieData.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: emotionColorMap[item.name] || '#6b7280' }}
            ></div>
            <span>{item.name}: {item.value}次</span>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">情绪分析</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 最常出现的情绪：<span className="font-medium text-gray-800">{mostFrequentEmotion.name}</span>（{mostFrequentEmotion.percentage}%）</p>
          <p>• 总共记录了 {Object.keys(emotionCount).length} 种不同的情绪</p>
          <p>• 饼图显示了每种情绪在所有记录中的分布比例</p>
        </div>
      </div>
    </div>
  )
} 