import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { EmotionRecord } from '@/store/emotion'

interface EmotionChartProps {
  records: EmotionRecord[]
}

// Emotion color mapping - light tones
const emotionColorMap: Record<string, string> = {
  'Anger': '#fca5a5',     // Light red
  'Disgust': '#fdba74',   // Light orange
  'Fear': '#c4b5fd',      // Light purple
  'Joy': '#86efac',       // Light green
  'Sadness': '#93c5fd',   // Light blue
  'Surprise': '#fde047',  // Light yellow
  'Complex': '#a5b4fc'    // Light indigo
}

export function EmotionChart({ records }: EmotionChartProps) {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No emotion records yet. Start your first conversation to generate the chart!
      </div>
    )
  }

  // Count occurrences of each emotion type
  const emotionCount = records.reduce((acc, record) => {
    acc[record.emotion] = (acc[record.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Convert statistics to pie chart data format
  const pieData = Object.entries(emotionCount).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    percentage: Math.round((count / records.length) * 100)
  }))

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
      }
    }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data?.name}</p>
          <p className="text-sm text-gray-600">Count: {data?.value}</p>
          <p className="text-sm text-gray-600">Percentage: {data?.percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Custom labels
  const renderLabel = ({ name, percentage }: {
    name: string
    percentage: number
  }) => {
    return `${name}: ${percentage}%`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Emotion Distribution Chart</h3>
        <div className="text-sm text-gray-600">
          Total Records: {records.length}
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
            <span>{item.name}: {item.value} times</span>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Emotion Analysis</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Most frequent emotion: <span className="font-medium text-gray-800">{mostFrequentEmotion.name}</span> ({mostFrequentEmotion.percentage}%)</p>
          <p>• Total of {Object.keys(emotionCount).length} different emotion types recorded</p>
          <p>• The pie chart shows the distribution ratio of each emotion in all records</p>
        </div>
      </div>
    </div>
  )
} 