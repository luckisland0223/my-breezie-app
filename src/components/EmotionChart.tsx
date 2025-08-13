import { emotionConfig, getEmotionEmoji } from '@/config/emotionConfig'
import type { EmotionRecord } from '@/store/emotion'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface EmotionChartProps {
  records: EmotionRecord[]
}

export function EmotionChart({ records }: EmotionChartProps) {
  if (records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No emotion records yet. Start your first conversation to generate the chart!
      </div>
    )
  }

  // Count occurrences of each emotion type
  const emotionCount = records.reduce((acc, record) => {
    acc[record.emotion] = (acc[record.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Convert statistics to pie chart data format with vibrant colors
  const pieData = Object.entries(emotionCount).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    percentage: Math.round((count / records.length) * 100),
    color: emotionConfig[emotion as keyof typeof emotionConfig]?.color || '#6B7280',
    emoji: getEmotionEmoji(emotion as keyof typeof emotionConfig)
  }))

  // Sort by value for better visualization
  pieData.sort((a, b) => b.value - a.value)

  // Get the most frequent emotion
  const mostFrequentEmotion = pieData.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  )

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: Array<{
      payload: {
        name: string
        value: number
        percentage: number
        emoji: string
      }
    }>
  }) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="flex items-center gap-2 font-semibold text-gray-800">
            <span className="text-lg">{data.emoji}</span>
            {data.name}
          </p>
          <p className="text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Legend
  const CustomLegend = ({ payload }: {
    payload?: Array<{
      value: string
      color: string
      payload: {
        name: string
        value: number
        percentage: number
        emoji: string
      }
    }>
  }) => {
    if (!payload || !Array.isArray(payload)) return null
    
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
            <span className="text-sm">{entry.payload.emoji}</span>
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-gray-700 text-sm">
              {entry.value} ({entry.payload.percentage}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Statistics */}
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">Emotion Distribution</h3>
        <p className="text-gray-600">
          Most frequent: <span className="font-medium text-lg">
            {mostFrequentEmotion.emoji} {mostFrequentEmotion.name}
          </span> ({mostFrequentEmotion.percentage}%)
        </p>
        <p className="mt-1 text-gray-500 text-sm">
          Based on {records.length} emotion record{records.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pie Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage, emoji }) => `${emoji} ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="#ffffff"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}