'use client'

import { PageHeader } from '@/components/PageHeader'
import { useNoAuthChat } from '@/store/noAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Bot, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ChatPage() {
  const router = useRouter()
  const { messages, loading, sendMessage, clearMessages } = useNoAuthChat()
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return
    
    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageHeader
        title="Chat with Breezie"
        subtitle="Your AI emotional wellness companion, always here to support and guide you"
        showBackButton={true}
        backUrl="/app"
        showHomeLink={true}
      />
      
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="glass shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              Emotional Support Chat
              {messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearMessages}
                  className="ml-auto"
                >
                  Clear Chat
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages List */}
            <div className="max-h-96 min-h-[300px] overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <Bot className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">Start chatting with Breezie!</p>
                    <p className="mt-2 text-gray-500 text-sm">Share your feelings and get emotional support</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] items-start gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${message.isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
                          {message.isUser ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`mt-1 text-xs ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl bg-gray-100 px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your feelings..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
