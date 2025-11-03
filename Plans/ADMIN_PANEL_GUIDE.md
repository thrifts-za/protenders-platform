# ProTenders Admin Panel Guide
**Administration & Management System**

**Last Updated:** November 3, 2024
**Version:** 1.0 (Next.js Edition)
**Status:** 🟢 Active

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Access & Authentication](#access--authentication)
3. [Admin Features](#admin-features)
4. [ETL Management](#etl-management)
5. [Analytics Dashboard](#analytics-dashboard)
6. [User Management](#user-management)
7. [System Health](#system-health)

---

## 📊 Overview

The ProTenders Admin Panel provides comprehensive management tools for:
- ✅ OCDS data synchronization (ETL jobs)
- ✅ System health monitoring
- ✅ Analytics and insights
- ✅ User management (future)
- ✅ Configuration management

**Access URL:** `https://your-domain.com/admin`

---

## 🔐 Access & Authentication

### Admin Credentials

**Environment Variables:**
```bash
# .env.local
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
```

**Default Credentials (Development Only):**
- Username: `admin`
- Password: Set in `.env.local`

**⚠️ Important:** Change default credentials in production!

### Authentication Implementation

**NextAuth Configuration:**

```typescript
// src/auth.config.ts
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin', email: 'admin@protenders.co.za', role: 'admin' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = 'admin';
      }
      return session;
    }
  }
};
```

### Protected Routes

**Middleware:** `src/middleware.ts`

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

### Login Page

**URL:** `/admin/login`

**Features:**
- Username/password authentication
- Session management
- Redirect to admin dashboard on success
- Error handling for invalid credentials

---

## 🎛️ Admin Features

### Dashboard Overview

**URL:** `/admin/dashboard`

**Displays:**
1. **System Stats**
   - Total tenders in database
   - Active tenders (not closed)
   - Tenders added today
   - Last sync timestamp

2. **Quick Actions**
   - Run manual sync
   - View system health
   - Access analytics
   - Manage ETL jobs

3. **Recent Activity**
   - Latest synced tenders
   - Error logs
   - System alerts

### Navigation Menu

```
Admin Panel
├── Dashboard (/admin/dashboard)
├── ETL Management (/admin/etl)
├── Analytics (/admin/analytics)
├── Audit Logs (/admin/audit)
├── Configuration (/admin/config)
└── Users (/admin/users) [Future]
```

---

## 🔄 ETL Management

### ETL Dashboard

**URL:** `/admin/etl`

**Features:**

1. **Sync Jobs Overview**
   - Last sync date/time
   - Next scheduled sync
   - Sync status (running/idle/error)
   - Records processed

2. **Manual Sync Triggers**
   ```typescript
   // Sync last 7 days
   POST /api/admin/sync/recent

   // Sync specific date range
   POST /api/admin/sync/range
   Body: { from: "2024-01-01", to: "2024-12-31" }

   // Full resync
   POST /api/admin/sync/full
   ```

3. **Sync History**
   - View past sync jobs
   - Success/failure rates
   - Processing times
   - Error details

4. **Real-time Monitoring**
   - Live sync progress
   - Records processed count
   - Estimated time remaining
   - Error notifications

### API Endpoints

```typescript
// Manual sync trigger
// POST /api/admin/jobs/sync
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { from, to, pageSize } = await req.json();

  const result = await syncOCDSData({ from, to, pageSize });

  return NextResponse.json(result);
}

// Get sync status
// GET /api/admin/jobs/status
export async function GET() {
  const status = {
    lastSync: await getLastSyncDate(),
    isRunning: await isSyncRunning(),
    nextSync: calculateNextSync(),
    stats: await getSyncStats(),
  };

  return NextResponse.json(status);
}
```

### Sync Configuration

**File:** `src/lib/server/sync-config.ts`

```typescript
export const syncConfig = {
  // Sync schedule (cron expression)
  schedule: '0 */6 * * *', // Every 6 hours

  // Default date range (days to look back)
  defaultRange: 7,

  // Page size for API requests
  pageSize: 1000,

  // Maximum retries on failure
  maxRetries: 3,

  // Timeout per request (milliseconds)
  timeout: 30000,
};
```

---

## 📊 Analytics Dashboard

### URL: `/admin/analytics`

**Metrics Displayed:**

1. **Tender Statistics**
   - Total tenders by status
   - Tenders by category
   - Tenders by province
   - Value distribution

2. **Growth Metrics**
   - New tenders per day/week/month
   - Growth rate trends
   - Seasonal patterns

3. **Data Quality**
   - Average data quality score
   - Field completion rates
   - Missing data analysis

4. **Top Buyers**
   - Most active procurement entities
   - Total tender values by buyer
   - Tender frequency

**Example Query:**
```sql
-- Tenders added per day (last 30 days)
SELECT
  DATE("publishedAt") as date,
  COUNT(*) as count,
  SUM(value) as total_value
FROM "ocds_releases"
WHERE "publishedAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE("publishedAt")
ORDER BY date DESC;
```

---

## 👥 User Management

### Current Implementation

**Status:** ⏳ Basic admin-only auth (single user)

### Future Features (Planned)

1. **Multi-User Support**
   - Add/edit/delete admin users
   - Role-based access (admin, editor, viewer)
   - User activity logs

2. **User Roles**
   - **Super Admin**: Full access
   - **Admin**: Manage content and ETL
   - **Editor**: View analytics and logs
   - **Viewer**: Read-only access

3. **User Database**
   ```prisma
   model AdminUser {
     id        String   @id @default(cuid())
     email     String   @unique
     name      String
     role      String   // admin, editor, viewer
     password  String   // hashed
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

---

## 🏥 System Health

### Health Check Endpoint

**URL:** `/api/admin/health`

```typescript
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),

    // Database health
    database: await checkDatabaseHealth(),

    // External services
    ocdsApi: await checkOCDSApiHealth(),

    // System resources
    memory: process.memoryUsage(),

    // Recent errors
    errors: await getRecentErrors(10),
  };

  return NextResponse.json(health);
}

async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected', latency: '< 50ms' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function checkOCDSApiHealth() {
  try {
    const response = await fetch(
      'https://ocds-api.etenders.gov.za/api/v1/releases?limit=1',
      { signal: AbortSignal.timeout(5000) }
    );
    return { status: response.ok ? 'operational' : 'degraded' };
  } catch (error) {
    return { status: 'error', error: 'API unreachable' };
  }
}
```

### Monitoring Dashboard

**Displays:**
- ✅ System uptime
- ✅ Database connection status
- ✅ OCDS API status
- ✅ Memory usage
- ✅ Error rate (last 24 hours)
- ✅ API response times

---

## 🔧 Configuration Management

### Environment Variables

**Managed in:** `/admin/config` (future)

**Current Setup:**
All configuration via environment variables (see Deployment Guide)

### Feature Flags (Future)

```typescript
// src/lib/config/features.ts
export const featureFlags = {
  enableAIDashboard: true,
  enableHTMLScraping: false,
  enableAdvancedAnalytics: true,
  maintenanceMode: false,
};
```

---

## 📋 Quick Reference

### Common Admin Tasks

**1. Run Manual Sync:**
```bash
# Via admin panel
Navigate to /admin/etl → Click "Sync Now"

# Via API
curl -X POST https://your-domain.com/api/admin/jobs/sync \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"from":"2024-01-01","to":"2024-12-31"}'
```

**2. Check System Health:**
```bash
# Via admin panel
Navigate to /admin/dashboard → View Health Status

# Via API
curl https://your-domain.com/api/admin/health
```

**3. View Analytics:**
```bash
Navigate to /admin/analytics
```

**4. Check Sync History:**
```bash
Navigate to /admin/etl → View "Sync History" tab
```

---

## 🛡️ Security Best Practices

### Production Security

1. **Strong Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 24
   ```

2. **HTTPS Only**
   - Enforce HTTPS for all admin pages
   - Use HTTP Strict Transport Security (HSTS)

3. **Rate Limiting**
   ```typescript
   // Limit login attempts
   const MAX_LOGIN_ATTEMPTS = 5;
   const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
   ```

4. **IP Whitelisting** (Optional)
   ```typescript
   // Allow admin access only from specific IPs
   const ALLOWED_IPS = ['123.456.789.0', '98.765.432.1'];
   ```

5. **Session Management**
   - Auto-logout after 24 hours
   - Secure session cookies
   - CSRF protection

### Audit Logging

**Future Feature:**
```typescript
// Log all admin actions
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'SYNC_TRIGGERED',
    details: { from, to },
    timestamp: new Date(),
    ipAddress: req.headers.get('x-forwarded-for'),
  },
});
```

---

## 📊 Admin Panel Statistics

**Implementation Status:**

| Feature | Status | URL |
|---------|--------|-----|
| Dashboard | ✅ Complete | `/admin/dashboard` |
| ETL Management | ✅ Complete | `/admin/etl` |
| Analytics | ✅ Complete | `/admin/analytics` |
| Audit Logs | ⏳ Planned | `/admin/audit` |
| User Management | ⏳ Planned | `/admin/users` |
| Configuration | ⏳ Planned | `/admin/config` |

---

## 🐛 Troubleshooting

### Cannot Login

**Symptoms:** Invalid credentials error

**Solutions:**
1. Verify `.env.local` has correct `ADMIN_USERNAME` and `ADMIN_PASSWORD`
2. Restart Next.js dev server
3. Check browser console for errors
4. Clear cookies and try again

### Sync Job Fails

**Symptoms:** "Sync failed" error in admin panel

**Solutions:**
1. Check OCDS API status
2. Verify database connection
3. Check admin logs for detailed error
4. Try manual sync with smaller date range

### Cannot Access Admin Panel

**Symptoms:** 401 Unauthorized or redirect loop

**Solutions:**
1. Clear browser cookies
2. Check `NEXTAUTH_URL` in `.env.local`
3. Verify `NEXTAUTH_SECRET` is set
4. Check middleware configuration

---

**Document Owner:** Admin Team
**Last Updated:** November 3, 2024
**Status:** 🟢 Production Ready

---

*This is a living document. Update as admin features evolve.*
