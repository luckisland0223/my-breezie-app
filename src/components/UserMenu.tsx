'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, User as UserIcon, Mail, Shield, Star } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

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
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs h-5 px-2 flex items-center gap-1">
                  <Star className="h-2 w-2" />
                  {user?.subscriptionTier || 'Free'}
                </Badge>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <UserIcon className="h-4 w-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout()
              router.push('/')
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

