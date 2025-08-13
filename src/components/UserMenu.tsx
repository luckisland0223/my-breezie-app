'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/auth'
import { BarChart3, LogOut, Mail, MessageCircle, Settings, Shield, Star, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const initials = useMemo(() => {
    if (!user?.username) return 'U'
    return user.username.slice(0, 1).toUpperCase()
  }, [user?.username])

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm">
            <div className="space-y-2">
              <div className="font-medium">{user?.username || 'User'}</div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Mail className="h-3 w-3" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex h-5 items-center gap-1 px-2 text-xs">
                  <Star className="h-2 w-2" />
                  {user?.subscriptionTier || 'Free'}
                </Badge>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push('/app')}>
            <UserIcon className="mr-2 h-4 w-4" /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/app/chat')}>
            <MessageCircle className="mr-2 h-4 w-4" /> Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/app/analytics')}>
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

