"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeftSidebar } from "./LeftSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 关闭移动端侧边栏当路由改变时
  useEffect(() => {
    setLeftSidebarOpen(false);
  }, [pathname]);

  // 防止背景滚动当侧边栏打开时
  useEffect(() => {
    if (leftSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [leftSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Left Sidebar - Desktop */}
        <LeftSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-80 min-h-screen">
          {/* Check if this is a chat page to render without container constraints */}
          {pathname === '/chat' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-screen"
            >
              {children}
            </motion.div>
          ) : (
            <div className="container mx-auto px-8 py-8 max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30"
        >
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(true)}
              className="btn-apple-secondary"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-apple-sm bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-lg font-bold gradient-text-apple">Breezie</h1>
            </div>
            
            <div className="w-8 h-8" /> {/* Placeholder for symmetry */}
          </div>
        </motion.header>

        {/* Mobile Main Content */}
        <main className="min-h-screen">
          {pathname === '/chat' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-screen"
            >
              {children}
            </motion.div>
          ) : (
            <div className="container mx-auto px-4 pb-8 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </div>
          )}
        </main>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setLeftSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-0 top-0 z-50 h-screen w-80 bg-gradient-to-b from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Sidebar Header */}
                  <div 
                    className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30 relative"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-apple-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">B</span>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold gradient-text-apple">Breezie</h1>
                        <p className="text-xs text-apple-caption">feeling first, healing follows</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLeftSidebarOpen(false)}
                      className="btn-apple-secondary"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Mobile Sidebar Content - Navigation Only */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 relative"
                  >
                    {/* Mobile Navigation Items */}
                    <nav className="space-y-2">
                      {[
                        { name: "首页", href: "/home", icon: "🏠", description: "开始你的情绪疏导之旅" },
                        { name: "AI聊天", href: "/chat", icon: "💬", description: "与AI助手进行情绪对话" },
                        { name: "数据概览", href: "/overview", icon: "📊", description: "查看你的情绪数据概览" },
                        { name: "深度分析", href: "/analytics", icon: "📈", description: "深入分析情绪趋势变化" },
                        { name: "情绪日记", href: "/diary", icon: "📝", description: "记录和回顾情绪历程" },
                        { name: "个人设置", href: "/settings", icon: "⚙️", description: "管理个人偏好和隐私" }
                      ].map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <button
                            onClick={() => {
                              router.push(item.href);
                              setLeftSidebarOpen(false);
                            }}
                            className="w-full flex items-center space-x-4 p-4 rounded-apple-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-150 text-left"
                          >
                            <div className="text-2xl">{item.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-apple-title">{item.name}</div>
                              <div className="text-sm text-apple-caption">{item.description}</div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </nav>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}