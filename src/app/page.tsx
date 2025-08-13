'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'
import { AuthDialog } from '@/components/AuthDialog'
import { UserMenu } from '@/components/UserMenu'
import { MessageCircle, BarChart3, Heart, ArrowRight, Sparkles, Brain, CheckCircle, Shield, Star, Users, Zap, Target } from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LandingPage() {
  const { user } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)

  // If user is logged in, redirect to app
  if (user) {
    window.location.href = '/app'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                <CloudLogo size={32} />
              </div>
              <div>
                <CloudLogoText size="lg" />
                <p className="text-sm text-gray-600 font-medium">Feeling first, healing follows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setAuthOpen(true)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setAuthOpen(true)}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-200 hover:scale-105 border-0"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
            <CloudLogo size={80} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your AI Companion for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Emotional Wellness</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Breezie is your personal AI therapist, designed to provide emotional support, 
            help you understand your feelings, and guide you toward mental well-being.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => setAuthOpen(true)}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg border-0"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 rounded-2xl font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 text-lg"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Breezie?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of emotional support with our advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Conversations</h3>
                <p className="text-gray-600">
                  Engage in meaningful conversations with our advanced AI that understands 
                  emotions and provides personalized support.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Emotional Analytics</h3>
                <p className="text-gray-600">
                  Track your emotional journey with detailed analytics and insights 
                  to better understand your mental health patterns.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Emotional Support</h3>
                <p className="text-gray-600">
                  Get emotional support whenever you need it, day or night. 
                  Breezie is always here to listen and help.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Breezie Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to start your emotional wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your account in seconds and start your emotional wellness journey
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start Chatting</h3>
              <p className="text-gray-600">
                Begin conversations with Breezie about your feelings and experiences
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your emotional growth with detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Emotional Wellness Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already discovered the power of AI-powered emotional support
          </p>
          <Button 
            size="lg" 
            onClick={() => setAuthOpen(true)}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg border-0"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <CloudLogo size={32} />
                <CloudLogoText size="lg" />
              </div>
              <p className="text-gray-400">
                Your AI companion for emotional wellness and personal growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Breezie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}