# ProTenders Deployment Guide
**Next.js 15 Full-Stack Platform - Flexible Deployment Strategy**

**Last Updated:** November 3, 2024
**Version:** 1.0 (Next.js Migration Edition)
**Status:** 🟢 Ready for Deployment

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [Database Setup](#database-setup)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 📊 Overview

### Platform Architecture

ProTenders is a **Next.js 15 full-stack application** that combines:
- **Frontend**: React Server Components + Client Components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Supabase/Neon/any PostgreSQL provider)
- **Cron Jobs**: Background OCDS sync (Vercel Cron or external)

### Deployment Flexibility

This guide supports multiple deployment platforms:
- ✅ **Vercel** (Recommended - native Next.js support)
- ✅ **Railway** (Full-stack with PostgreSQL)
- ✅ **Render** (Alternative to Vercel)
- ✅ **Netlify** (Alternative serverless platform)
- ✅ **Docker** (Self-hosted on any VPS)
- ✅ **Traditional VPS** (Ubuntu/Debian with Node.js)

**Note:** While this guide mentions Vercel, you can deploy to **any platform** that supports Next.js. The configuration is platform-agnostic.

---

## 🔧 Prerequisites

### Required Software

```bash
# Node.js (v18 or higher)
node --version  # Should be >= 18.0.0

# npm (comes with Node.js)
npm --version   # Should be >= 9.0.0

# Git (for deployment)
git --version
```

### Required Accounts

Choose one or more platforms:
- [ ] **Vercel Account** (free tier available) - https://vercel.com
- [ ] **Railway Account** (free tier) - https://railway.app
- [ ] **Render Account** (free tier) - https://render.com
- [ ] **PostgreSQL Database** (Supabase/Neon/Railway/your own)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd protenders-next

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run Prisma migrations
npx prisma generate
npx prisma db push  # or: npx prisma migrate deploy

# Start development server
npm run dev
```

---

## 🔐 Environment Configuration

### Required Environment Variables

Create `.env.local` for local development and configure these in your deployment platform:

```bash
# ==========================================
# DATABASE
# ==========================================
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database"
# Example (Supabase): postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
# Example (Neon): postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname
# Example (Railway): postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# ==========================================
# NEXTAUTH (Authentication)
# ==========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-here"

# Your deployment URL
NEXTAUTH_URL="https://your-domain.com"
# For local dev: http://localhost:3000

# ==========================================
# ADMIN CREDENTIALS
# ==========================================
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-admin-password"

# ==========================================
# OCDS API
# ==========================================
OCDS_API_BASE_URL="https://ocds-api.etenders.gov.za/api/v1"

# ==========================================
# CRON JOB SECRET (for background sync)
# ==========================================
# Generate with: openssl rand -base64 32
CRON_SECRET="your-cron-secret-key-here"

# ==========================================
# OPTIONAL: AI Services (Future)
# ==========================================
# OPENAI_API_KEY="sk-..."
# ANTHROPIC_API_KEY="sk-..."
# GOOGLE_CLOUD_PROJECT="your-project-id"

# ==========================================
# OPTIONAL: Analytics & Monitoring
# ==========================================
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
# SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32

# Generate secure admin password
openssl rand -base64 24
```

---

## 🏗️ Build Process

### 1. Pre-Build Checklist

```bash
# Ensure all dependencies installed
npm install

# Run TypeScript type checking
npm run type-check  # or: npx tsc --noEmit

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### 2. Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations (production)
npx prisma migrate deploy

# Or push schema changes (development)
npx prisma db push
```

### 3. Build for Production

```bash
# Build Next.js application
npm run build

# This creates:
# - .next/ directory with optimized production build
# - Static pages pre-rendered
# - Server components compiled
# - API routes bundled
```

### 4. Test Production Build Locally

```bash
# Start production server locally
npm start

# Visit http://localhost:3000
# Test all critical paths:
# - Homepage loads
# - Search works
# - Tender details display
# - Admin panel accessible
```

---

## 🚀 Deployment Options

## Option 1: Vercel (Recommended)

### Why Vercel?
- ✅ Native Next.js support (made by Vercel)
- ✅ Automatic deployments from Git
- ✅ Built-in cron jobs
- ✅ Edge functions
- ✅ Excellent performance
- ✅ Free tier available

### Deployment Steps

**A. Via Vercel Dashboard (Easiest)**

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Select environments: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - You'll get a URL: `https://your-project.vercel.app`

**B. Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production
# ... add all other env vars
```

### Configure Vercel Cron Jobs

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Cron Job API Route:** `src/app/api/cron/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { syncOCDSData } from '@/lib/server/sync';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncOCDSData();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

### Custom Domain Setup (Vercel)

1. **Add Domain in Vercel**
   - Dashboard → Settings → Domains
   - Add your domain: `protenders.co.za`

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - HTTPS enabled by default

---

## Option 2: Railway

### Why Railway?
- ✅ Full-stack support (app + database)
- ✅ PostgreSQL included
- ✅ Simple deployment
- ✅ Affordable pricing
- ✅ Good for monolithic apps

### Deployment Steps

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Dashboard → New Project
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Add → Database → PostgreSQL
   - Railway will provision a database
   - Copy `DATABASE_URL` from database settings

4. **Configure Environment Variables**
   - Select your service → Variables
   - Add all required env vars
   - Use Railway's `DATABASE_URL` (automatically created)

5. **Deploy**
   - Railway automatically deploys on push
   - Get URL from deployment logs

### Cron Jobs on Railway

**Option A: Railway Cron (if available)**
```json
// railway.json
{
  "crons": {
    "sync": {
      "schedule": "0 */6 * * *",
      "command": "curl -X GET https://your-app.railway.app/api/cron/sync -H 'Authorization: Bearer $CRON_SECRET'"
    }
  }
}
```

**Option B: External Cron Service**
- Use GitHub Actions or cron-job.org
- Hit `/api/cron/sync` endpoint every 6 hours

---

## Option 3: Render

### Deployment Steps

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Environment:** Node

3. **Add PostgreSQL Database**
   - New → PostgreSQL
   - Copy internal connection string
   - Use as `DATABASE_URL`

4. **Configure Environment Variables**
   - Service → Environment
   - Add all required variables

5. **Deploy**
   - Render auto-deploys on push
   - Get URL from dashboard

---

## Option 4: Docker (Self-Hosted)

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose (with PostgreSQL)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/protenders
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=protenders
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build image
docker build -t protenders-next .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  protenders-next

# Or use docker-compose
docker-compose up -d
```

---

## Option 5: Traditional VPS (Ubuntu)

### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PostgreSQL (optional - can use external)
sudo apt install -y postgresql postgresql-contrib
```

### Application Setup

```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> protenders-next
cd protenders-next

# Install dependencies
sudo npm install

# Create .env.local
sudo nano .env.local
# Add all environment variables

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start with PM2
pm2 start npm --name "protenders" -- start
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/protenders
server {
    listen 80;
    server_name protenders.co.za www.protenders.co.za;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/protenders /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d protenders.co.za -d www.protenders.co.za
```

### Cron Jobs (VPS)

```bash
# Edit crontab
crontab -e

# Add OCDS sync job (every 6 hours)
0 */6 * * * curl -X GET http://localhost:3000/api/cron/sync -H "Authorization: Bearer $CRON_SECRET" >> /var/log/protenders-sync.log 2>&1
```

---

## 💾 Database Setup

### Supabase (Recommended)

1. **Create Project**
   - Go to https://supabase.com
   - New Project
   - Copy connection string

2. **Connection Pooler**
   - Use pooler for serverless: `aws-0-region.pooler.supabase.com`
   - Direct connection for traditional servers

3. **Run Migrations**
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Neon (Alternative)

1. **Create Project** at https://neon.tech
2. **Copy Connection String**
3. **Run Migrations**

### Railway PostgreSQL

1. **Add Database** in Railway dashboard
2. **Use Internal URL** (faster)
3. **Run Migrations**

---

## ✅ Post-Deployment

### 1. Verify Deployment

```bash
# Check homepage
curl https://your-domain.com

# Check API health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/tenders?pageSize=1
```

### 2. Test Critical Paths

- [ ] Homepage loads
- [ ] Search works
- [ ] Tender details display correctly
- [ ] Category pages load
- [ ] Province pages load
- [ ] Admin login works
- [ ] API routes respond

### 3. Configure Monitoring

**Vercel Analytics (if using Vercel)**
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Sentry (Error Tracking)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 4. Set Up Backups

**Database Backups (Supabase)**
- Automatic backups included
- Manual backup: Dashboard → Database → Backups

**Database Backups (Self-Hosted)**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backups/protenders-$DATE.sql
find backups/ -name "*.sql" -mtime +30 -delete
```

---

## 📊 Monitoring & Maintenance

### Performance Monitoring

**Vercel Analytics:**
- Real User Monitoring (RUM)
- Web Vitals tracking
- Automatic in Vercel dashboard

**Custom Monitoring:**
```typescript
// Monitor API response times
export async function GET(req: NextRequest) {
  const start = Date.now();
  const result = await fetchData();
  const duration = Date.now() - start;

  console.log(`API call took ${duration}ms`);
  return NextResponse.json(result);
}
```

### Logs

**Vercel:**
- Dashboard → Logs
- Real-time log streaming

**PM2 (VPS):**
```bash
# View logs
pm2 logs protenders

# Save logs to file
pm2 logs protenders >> /var/log/protenders.log
```

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
    }, { status: 500 });
  }
}
```

Monitor with UptimeRobot or similar service.

---

## 🔧 Troubleshooting

### Build Fails

**TypeScript Errors:**
```bash
# Check types
npx tsc --noEmit

# Fix types in files reported
# Ensure all optional properties have `?:`
```

**Dependency Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### Database Connection Issues

**Error: "Can't reach database server"**
- Check `DATABASE_URL` is correct
- Verify database is accessible from deployment platform
- Check firewall rules
- Use connection pooler for serverless (Supabase/Neon)

**Error: "Too many connections"**
- Use connection pooler
- Close connections properly in API routes
- Use Prisma's connection pooling

### Deployment Fails

**Vercel Build Timeout:**
- Optimize build (remove heavy dependencies)
- Increase build timeout in Vercel settings

**Out of Memory:**
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}
```

### Runtime Errors

**500 Internal Server Error:**
- Check deployment logs
- Verify environment variables are set
- Check API route error handling

**404 on API Routes:**
- Ensure routes are in `app/api/` directory
- Check `route.ts` naming (not `route.tsx`)
- Verify exports: `export async function GET()`

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors fixed
- [ ] `npm run build` succeeds locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Tests passing (if applicable)

### Deployment
- [ ] Environment variables configured in platform
- [ ] Database connected and migrated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Cron jobs configured

### Post-Deployment
- [ ] Health check passing
- [ ] Critical paths tested
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Team notified

---

## 🎯 Recommended Setup

For **production ProTenders deployment**, we recommend:

**Infrastructure:**
- **Hosting:** Vercel (or any platform you prefer)
- **Database:** Supabase PostgreSQL (with pooler)
- **Domain:** Custom domain with SSL
- **Monitoring:** Vercel Analytics + Sentry
- **Backups:** Automated database backups

**Configuration:**
- **Node Version:** 18+
- **Next.js Version:** 15
- **Database:** PostgreSQL 14+
- **Cron:** Vercel Cron or external service

**Estimated Costs (Monthly):**
- Vercel Pro: $20/month (optional, free tier works)
- Supabase: $0-25/month depending on usage
- Domain: $10-15/year
- **Total:** ~$0-50/month for small-medium traffic

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

**Document Owner:** DevOps Team
**Last Updated:** November 3, 2024
**Platform:** Next.js 15 Full-Stack
**Status:** 🟢 Production Ready

---

*This is a living document. Update as deployment practices evolve.*
