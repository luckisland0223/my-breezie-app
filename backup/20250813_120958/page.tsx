'use client'

import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, BarChart3, Brain, Heart, MessageCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  // 直接跳转到应用，无需认证
  const handleGetStarted = () => {
    window.location.href = '/app'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <header className="sticky top-0 z-50 border-white/20 border-b bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 animate-glow items-center justify-center rounded-2xl bg-white shadow-xl">
                <CloudLogo size={32} />
              </div>
              <div>
                <CloudLogoText size="lg" />
                <p className="font-medium text-gray-600 text-sm">Feeling first, healing follows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleGetStarted}
                className="border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>



      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 animate-float items-center justify-center rounded-3xl bg-white shadow-2xl">
            <CloudLogo size={80} />
          </div>
          
          <h1 className="mb-6 font-bold text-5xl md:text-6xl">
            Your AI Companion for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Emotional Wellness</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-gray-600 text-xl leading-relaxed">
            Breezie is your personal AI therapist, designed to provide emotional support, 
            help you understand your feelings, and guide you toward mental well-being.
          </p>
          
          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="transform rounded-2xl border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-8 py-4 font-semibold text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
            >
              Start Your Emotional Wellness Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-4xl text-gray-900">
              Why Choose Breezie?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-xl">
              Experience the future of emotional support with our advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">AI-Powered Conversations</h3>
                <p className="text-gray-600">
                  Engage in meaningful conversations with our advanced AI that understands 
                  emotions and provides personalized support.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">Emotional Analytics</h3>
                <p className="text-gray-600">
                  Track your emotional journey with detailed analytics and insights 
                  to better understand your mental health patterns.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">24/7 Emotional Support</h3>
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
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-4xl text-gray-900">
              How Breezie Works
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-xl">
              Simple steps to start your emotional wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                <span className="font-bold text-2xl text-white">1</span>
              </div>
              <h3 className="mb-3 font-bold text-gray-900 text-xl">Sign Up</h3>
              <p className="text-gray-600">
                Create your account in seconds and start your emotional wellness journey
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                <span className="font-bold text-2xl text-white">2</span>
              </div>
              <h3 className="mb-3 font-bold text-gray-900 text-xl">Start Chatting</h3>
              <p className="text-gray-600">
                Begin conversations with Breezie about your feelings and experiences
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                <span className="font-bold text-2xl text-white">3</span>
              </div>
              <h3 className="mb-3 font-bold text-gray-900 text-xl">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your emotional growth with detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-bold text-4xl text-white">
            Ready to Start Your Emotional Wellness Journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-blue-100 text-xl">
            Join thousands of users who have already discovered the power of AI-powered emotional support
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="transform rounded-2xl border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-8 py-4 font-semibold text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-3">
                <CloudLogo size={32} />
                <CloudLogoText size="lg" />
              </div>
              <p className="text-gray-400">
                Your AI companion for emotional wellness and personal growth.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-gray-800 border-t pt-8 text-center text-gray-400">
            <p>&copy; 2025 Breezie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}