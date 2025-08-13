import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Breezie App - Your AI Companion for Emotional Wellness',
  description: 'Access your personalized AI therapy sessions, track emotions, and monitor your mental health journey with Breezie.',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-layout">
      {children}
    </div>
  )
}
