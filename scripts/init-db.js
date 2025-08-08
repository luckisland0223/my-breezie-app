// Database initialization script for Supabase
// This script helps set up the database with initial configurations

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initializing Breezie database...')
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Check if tables exist by trying to count records
    console.log('🔍 Checking database tables...')
    
    const userCount = await prisma.user.count()
    const emotionRecordCount = await prisma.emotionRecord.count()
    const chatSessionCount = await prisma.chatSession.count()
    const chatMessageCount = await prisma.chatMessage.count()
    
    console.log(`📊 Database statistics:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Emotion Records: ${emotionRecordCount}`)
    console.log(`   Chat Sessions: ${chatSessionCount}`)
    console.log(`   Chat Messages: ${chatMessageCount}`)
    
    console.log('✅ Database initialization completed successfully!')
    console.log('🎉 Your Supabase database is ready for Breezie!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    console.error('💡 Make sure your DATABASE_URL is correctly set in .env file')
    
    const code = typeof error === 'object' && error && 'code' in error ? /** @type {any} */(error).code : undefined
    if (code === 'P1001') {
      console.error('🔍 Connection error - check your Supabase connection string')
      console.error('   Make sure you are using the correct Supabase URL, not localhost')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error:', e)
    process.exit(1)
  })
