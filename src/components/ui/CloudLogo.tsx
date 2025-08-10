import React from 'react'

interface CloudLogoProps {
  size?: number
  className?: string
}

export function CloudLogo({ size = 24, className = '' }: CloudLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      
      {/* Main cloud shape - recreating the overlapping circles design */}
      <g transform="translate(10, 25)">
        {/* Left large circle */}
        <circle cx="20" cy="25" r="18" fill="url(#cloudGradient)" opacity="0.9" />
        
        {/* Center large circle */}
        <circle cx="40" cy="20" r="20" fill="url(#cloudGradient)" opacity="0.95" />
        
        {/* Right medium circle */}
        <circle cx="60" cy="25" r="16" fill="url(#cloudGradient)" opacity="0.9" />
        
        {/* Small accent circles */}
        <circle cx="30" cy="35" r="12" fill="url(#cloudGradient)" opacity="0.85" />
        <circle cx="50" cy="35" r="14" fill="url(#cloudGradient)" opacity="0.8" />
        
        {/* Top small circles for cloud texture */}
        <circle cx="35" cy="15" r="8" fill="url(#cloudGradient)" opacity="0.7" />
        <circle cx="50" cy="12" r="6" fill="url(#cloudGradient)" opacity="0.75" />
      </g>
    </svg>
  )
}

export function CloudLogoText({ size = 'lg', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl',
    xl: 'text-4xl'
  }
  
  return (
    <span className={`font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent ${sizeClasses[size]} ${className}`}>
      Breezie
    </span>
  )
}
