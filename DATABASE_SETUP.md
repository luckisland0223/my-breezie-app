# Breezie Database Setup Guide

## Overview

This document explains how to set up the database for the Breezie emotion management application. The application uses PostgreSQL with Prisma ORM for type-safe database operations.

## Prerequisites

1. **PostgreSQL Database**: You need access to a PostgreSQL database. You can use:
   - Local PostgreSQL installation
   - Cloud services like Neon, Supabase, PlanetScale, or Railway
   - Docker container

## Quick Setup

### 1. Environment Configuration

Create a `.env` file in the project root (copy from `.env.example` if available):

```bash
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/breezie_db?schema=public"

# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Gemini API Key (existing)
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Database Migration

Run the following commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to your database (for development)
npx prisma db push

# Or create and run migrations (for production)
npx prisma migrate dev --name init
```

### 3. Test Database Connection

Test your database connection:

```bash
# Start the development server
npm run dev

# Visit http://localhost:3000/api/db-test
# You should see a success message if the connection works
```

## Database Schema

The application uses the following main tables:

### Users Table
- `id`: Unique identifier (CUID)
- `email`: User email (unique)
- `username`: Username (unique)
- `password_hash`: Encrypted password
- `avatar_url`: Profile picture URL (optional)
- `subscription_tier`: Subscription level (free, pro, enterprise)
- `subscription_expires_at`: Subscription expiration date
- `created_at`, `updated_at`: Timestamps

### Emotion Records Table
- `id`: Unique identifier
- `user_id`: Reference to user
- `emotion`: Emotion type (string)
- `behavioral_impact`: Impact score (1-10)
- `note`: User's note about the emotion
- `record_type`: Type of record (chat, quick_check)
- `conversation_summary`: Summary of chat conversation
- AI analysis fields: `actual_emotion`, `actual_intensity`, etc.
- Polarity analysis fields: `polarity`, `polarity_strength`, etc.
- `created_at`, `updated_at`: Timestamps

### Chat Sessions Table
- `id`: Unique identifier
- `user_id`: Reference to user
- `emotion`: Emotion context for the session
- `start_time`, `end_time`: Session duration
- `message_count`: Number of messages in session

### Chat Messages Table
- `id`: Unique identifier
- `session_id`: Reference to chat session
- `content`: Message content
- `role`: Message sender (user, assistant)
- `created_at`: Timestamp

## Database Providers

### Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database: `createdb breezie_db`
3. Update your `DATABASE_URL` in `.env`

### Neon (Recommended for development)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file

### Supabase (Recommended for Vercel deployment)

#### Step 1: Create Supabase Project
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project:
   - Name: `breezie-emotion-app`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your users

#### Step 2: Get Connection Strings
Go to Settings → Database, find "Connection string" section:

**Pooled connection (for Vercel/serverless):**
```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Direct connection (for migrations):**
```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

#### Step 3: Environment Variables
Create `.env` file in your project root:
```bash
# Supabase Database URLs
DATABASE_URL="[POOLED-CONNECTION-STRING]"
DIRECT_URL="[DIRECT-CONNECTION-STRING]"

# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Gemini API Key (existing)
GEMINI_API_KEY="your-gemini-api-key"
```

#### Step 4: Vercel Environment Variables
In Vercel project settings, add the same environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from your `.env` file

### Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a new project with PostgreSQL
3. Copy the connection string to your `.env` file

## Development Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create a migration (production)
npx prisma migrate dev --name migration_name

# View your database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Production Deployment

For production deployment:

1. Set up a production PostgreSQL database
2. Update `DATABASE_URL` with production credentials
3. Run migrations: `npx prisma migrate deploy`
4. Ensure `JWT_SECRET` is a strong, unique secret

## Troubleshooting

### Connection Issues

1. **Database not accessible**: Check if your database server is running
2. **Authentication failed**: Verify username and password in `DATABASE_URL`
3. **SSL issues**: Add `?sslmode=require` to your connection string for cloud databases

### Migration Issues

1. **Schema drift**: Run `npx prisma db push` to sync schema
2. **Migration conflicts**: Reset database with `npx prisma migrate reset` (development only)

### Common Errors

- **P1001**: Can't reach database server - Check connection string
- **P3009**: Migration failed - Check for schema conflicts
- **P2002**: Unique constraint violation - Check for duplicate data

## Next Steps

After completing the database setup:

1. Test the connection using `/api/db-test` endpoint
2. Proceed to implement authentication APIs
3. Migrate existing local storage data to the database
4. Update frontend components to use the new API endpoints

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for database access
- Enable SSL for production databases
- Regularly backup your production database
- Use connection pooling for high-traffic applications