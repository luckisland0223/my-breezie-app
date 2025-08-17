"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home,
  MessageCircle, 
  BarChart3, 
  TrendingUp,
  Target,
  Trophy,
  Settings,
  User,
  Heart,
  Sparkles,
  BookOpen,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { 
    name: "首页", 
    href: "/home", 
    icon: Home,
    description: "开始你的情绪疏导之旅",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20"
  },
  { 
    name: "AI聊天", 
    href: "/chat", 
    icon: MessageCircle,
    description: "与AI助手进行情绪对话",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20"
  },
  { 
    name: "情绪日记", 
    href: "/diary", 
    icon: BookOpen,
    description: "记录和回顾情绪历程",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20"
  },
  { 
    name: "数据概览", 
    href: "/overview", 
    icon: BarChart3,
    description: "查看你的情绪数据概览",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20"
  },
  { 
    name: "深度分析", 
    href: "/analytics", 
    icon: TrendingUp,
    description: "深入分析情绪趋势变化",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20"
  },
  { 
    name: "个人设置", 
    href: "/settings", 
    icon: Settings,
    description: "管理个人偏好和隐私",
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/20"
  }
];

export function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // 预加载所有导航路由以减少延迟
  React.useEffect(() => {
    navigation.forEach(item => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-40 h-screen w-80 bg-gradient-to-b from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 border-r border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center space-x-3 p-6 border-b border-gray-200/30 dark:border-gray-700/30"
        >
          <motion.div
            className="w-12 h-12 rounded-apple-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl"
          >
            <Heart className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold gradient-text-apple">
              Breezie
            </h1>
            <p className="text-sm text-apple-caption">
              feeling first, healing follows
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/home");
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.2 + index * 0.1, 
                  duration: 0.4, 
                  ease: [0.16, 1, 0.3, 1] 
                }}

              >
                <button
                  onClick={() => router.push(item.href)}
                  onMouseDown={(e) => {
                    // 提供即时视觉反馈
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  className={cn(
                    "w-full flex items-center space-x-4 p-4 rounded-apple-lg transition-all duration-75 text-left group active:scale-[0.98]",
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-lg border border-current/20`
                      : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-apple-body"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-apple-sm flex items-center justify-center transition-all duration-75",
                    isActive 
                      ? "bg-white/80 dark:bg-gray-800/80 shadow-md" 
                      : "group-hover:bg-white/50 dark:group-hover:bg-gray-800/50"
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5 transition-all duration-75",
                      isActive ? item.color : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <div className={cn(
                      "font-semibold text-base transition-all duration-75",
                      isActive ? item.color : "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"
                    )}>
                      {item.name}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5 transition-all duration-75",
                      isActive ? "text-current/70" : "text-apple-caption"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1 h-8 bg-current rounded-full"
                      transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 border-t border-gray-200/30 dark:border-gray-700/30"
        >
          <div className="card-apple rounded-apple-lg p-4 hover:shadow-lg transition-all duration-75 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-apple-title">用户</div>
                <div className="text-sm text-apple-caption">高级会员</div>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-apple-title">5</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-apple-caption">今日进度</span>
                <span className="text-xs font-semibold text-apple-title">3/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
