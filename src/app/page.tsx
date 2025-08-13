'use client'

import { RegisterForm } from '@/components/RegisterForm'
import { AppStoreButton, AppStoreBadge } from '@/components/AppStoreButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Sparkles, 
  Shield, 
  Users, 
  Star,
  MessageCircle,
  Calendar,
  TrendingUp
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: "情绪追踪",
      description: "轻松记录和分析你的日常情绪变化"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      title: "智能对话",
      description: "AI助手提供个性化的情绪支持和建议"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "每日提醒",
      description: "养成健康的情绪管理习惯"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: "趋势分析",
      description: "可视化你的情绪健康改善过程"
    }
  ]

  const testimonials = [
    {
      name: "小王",
      text: "Breezie帮助我更好地理解自己的情绪，现在我感觉更加平静和自信了。",
      rating: 5
    },
    {
      name: "李小姐",
      text: "简单易用的界面，每天花几分钟就能获得很好的情绪管理建议。",
      rating: 5
    },
    {
      name: "张先生",
      text: "作为一个忙碌的上班族，Breezie让我学会了如何在压力中保持内心平静。",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 text-sm">
                <Sparkles className="mr-2 h-4 w-4" />
                即将发布
              </Badge>
            </div>
            <h1 className="mb-6 font-bold text-5xl md:text-7xl">
              Breezie
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              你的个人情绪健康助手，让内心更加平静与自在
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <AppStoreButton />
              <div className="text-sm text-blue-100">
                <Shield className="inline mr-2 h-4 w-4" />
                隐私安全 · 数据加密
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl text-gray-900">
              为什么选择Breezie？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              专业的情绪管理工具，帮助你建立更健康的心理状态
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl text-gray-900">
              用户反馈
            </h2>
            <p className="text-xl text-gray-600">
              看看其他用户如何通过Breezie改善情绪健康
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">Breezie用户</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl text-gray-900">
              抢先体验
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              注册成为首批用户，第一时间获得App发布通知
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <RegisterForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            开始你的情绪健康之旅
          </h2>
          <p className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto">
            Breezie即将在App Store发布，立即下载开始体验
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <AppStoreBadge />
            <div className="flex items-center text-blue-100">
              <Users className="mr-2 h-5 w-5" />
              已有1000+用户预约下载
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mb-8">
            <h3 className="font-bold text-2xl mb-2">Breezie</h3>
            <p className="text-gray-400">让内心更加平静与自在</p>
          </div>
          <div className="text-gray-400 text-sm">
            <p>&copy; 2025 Breezie. 保留所有权利。</p>
            <p className="mt-2">专注于情绪健康，保护用户隐私</p>
          </div>
        </div>
      </footer>
    </div>
  )
}