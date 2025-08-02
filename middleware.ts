import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // For the profile page, require authentication
        if (req.nextUrl.pathname.startsWith('/profile')) {
          return !!token
        }
        
        // Allow access to all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/profile/:path*',
    '/auth/:path*'
  ]
}