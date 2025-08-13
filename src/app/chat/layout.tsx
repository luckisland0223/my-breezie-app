import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat with Breezie - AI Emotional Support',
  description: 'Start a conversation with Breezie, your AI companion for emotional wellness and support.',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {children}
    </div>
  )
}
