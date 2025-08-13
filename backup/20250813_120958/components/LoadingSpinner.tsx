import { Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-blue-200`}>
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className={`${size === 'sm' ? "h-2 w-2" : size === 'md' ? "h-3 w-3" : "h-4 w-4"} animate-pulse text-blue-500`} />
        </div>
      </div>
      {text && (
        <p className={`${textSizes[size]} text-center text-gray-600`}>
          {text}
        </p>
      )}
    </div>
  )
} 