'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LogOut, User, Settings, LogIn, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useSupabaseStore } from '@/store/supabase'
import { getSupabaseClient } from '@/lib/supabase/client'
import { EmailAuth } from '@/components/auth/EmailAuth'
import { SupabaseConfig } from '@/components/SupabaseConfig'
import { toast } from 'sonner'

export default function UserProfile() {
  const { user, isLoggedIn, isLoading, logout, getDisplayName } = useAuthStore()
  const { isReady } = useSupabaseStore()
  const router = useRouter()
  
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  if (isLoading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
  }

  const handleSignOut = async () => {
    try {
      if (isReady()) {
        const client = getSupabaseClient()
        await client.auth.signOut()
      }
      logout()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    toast.success('Welcome to Breezie!')
  }

  // Show sign in button if not authenticated
  if (!isLoggedIn || !user) {
    return (
      <>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (!isReady()) {
              setShowConfigDialog(true)
            } else {
              setShowAuthDialog(true)
            }
          }}
        >
          <LogIn className="w-4 h-4 mr-1" />
          Sign In
        </Button>

        {/* Auth Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Authentication</DialogTitle>
            </DialogHeader>
            <EmailAuth onSuccess={handleAuthSuccess} />
          </DialogContent>
        </Dialog>

        {/* Config Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Setup Required</DialogTitle>
            </DialogHeader>
            <SupabaseConfig />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Show user profile dropdown if authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url ?? ''} alt={getDisplayName()} />
            <AvatarFallback>
              {getDisplayName()[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{getDisplayName()}</p>
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowConfigDialog(true)} className="cursor-pointer">
          <Database className="mr-2 h-4 w-4" />
          Database Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          App Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supabase Configuration</DialogTitle>
          </DialogHeader>
          <SupabaseConfig />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}