# ProTenders Render Configuration Guide
**Complete Setup for Render.com Infrastructure**

**Last Updated:** November 3, 2024
**Status:** 🟢 Active

---

## 📋 Overview

ProTenders uses Render.com for both the API backend and PostgreSQL database. This document contains all configuration details, credentials, and management commands.

---

## 🗄️ PostgreSQL Database

### Connection Details

**Service ID:** `dpg-d41gqlmr433s73dvl3cg-a`
**Region:** Frankfurt, Germany
**Database Name:** `protender_database`
**Username:** `protender_database_user`

**Connection String:**
```
postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database
```

### CLI Access

```bash
# Via Render CLI (recommended)
render psql dpg-d41gqlmr433s73dvl3cg-a

# Via standard psql
psql "postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database"
```

### Environment Variable

```bash
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database"
```

---

## 🚀 API Backend Service

### Service Details

**Service ID:** `srv-d40dse95pdvs73fteuqg`
**Service URL:** https://tender-spotlight-pro.onrender.com
**Framework:** Express.js
**Region:** Frankfurt (or default Render region)

### Deploy Hook

**Private Deploy URL (Keep Secret):**
```
https://api.render.com/deploy/srv-d40dse95pdvs73fteuqg?key=Wc4uy690_ZU
```

**Usage:**
```bash
# Trigger manual deployment
curl -X POST "https://api.render.com/deploy/srv-d40dse95pdvs73fteuqg?key=Wc4uy690_ZU"
```

### API Endpoints

- **Base URL:** https://tender-spotlight-pro.onrender.com
- **Health Check:** https://tender-spotlight-pro.onrender.com/health
- **Search API:** https://tender-spotlight-pro.onrender.com/api/search
- **Tender Details:** https://tender-spotlight-pro.onrender.com/api/tenders/:id

---

## 🛠️ Render CLI Commands

### Installation

```bash
# Install Render CLI
npm install -g @render/cli

# Or with Homebrew (macOS)
brew install render
```

### Authentication

```bash
# Login to Render
render login

# Check authentication status
render whoami
```

### Database Commands

```bash
# Connect to PostgreSQL database
render psql dpg-d41gqlmr433s73dvl3cg-a

# View database info
render databases list

# View database details
render databases get dpg-d41gqlmr433s73dvl3cg-a
```

### Service Commands

```bash
# List all services
render services list

# View service details
render services get srv-d40dse95pdvs73fteuqg

# View service logs
render logs --service srv-d40dse95pdvs73fteuqg

# Follow logs in real-time
render logs --service srv-d40dse95pdvs73fteuqg --follow

# Restart service
render services restart srv-d40dse95pdvs73fteuqg

# Deploy service
render services deploy srv-d40dse95pdvs73fteuqg
```

### Environment Variables

```bash
# List environment variables
render env list --service srv-d40dse95pdvs73fteuqg

# Set environment variable
render env set --service srv-d40dse95pdvs73fteuqg KEY=value

# Delete environment variable
render env delete --service srv-d40dse95pdvs73fteuqg KEY
```

---

## 🔧 Database Management

### Backup Database

```bash
# Create manual backup
render psql dpg-d41gqlmr433s73dvl3cg-a -c "pg_dump" > backup_$(date +%Y%m%d).sql

# Or using standard pg_dump
pg_dump "postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database" > backup.sql
```

### Restore Database

```bash
# Restore from backup
psql "postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database" < backup.sql
```

### Run Migrations

```bash
# Using Prisma
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database" npx prisma migrate deploy

# Generate Prisma Client
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database" npx prisma generate
```

### Database Queries

```bash
# Connect to database shell
render psql dpg-d41gqlmr433s73dvl3cg-a

# Common queries
\dt                          # List tables
\d table_name                # Describe table
SELECT COUNT(*) FROM "OCDSRelease";  # Count tenders
SELECT * FROM "OCDSRelease" LIMIT 10;  # View sample data
```

---

## 🚦 Service Deployment

### Auto-Deploy from Git

Render automatically deploys when you push to the connected Git branch.

```bash
# Push to trigger deploy
git push origin main
```

### Manual Deploy via Dashboard

1. Go to https://dashboard.render.com
2. Select service: `tender-spotlight-pro`
3. Click "Manual Deploy" → "Deploy latest commit"

### Manual Deploy via CLI

```bash
# Deploy service
render services deploy srv-d40dse95pdvs73fteuqg

# Deploy with specific commit
render services deploy srv-d40dse95pdvs73fteuqg --commit <commit-hash>
```

### Manual Deploy via Webhook

```bash
# Trigger deployment via deploy hook
curl -X POST "https://api.render.com/deploy/srv-d40dse95pdvs73fteuqg?key=Wc4uy690_ZU"
```

---

## 📊 Monitoring & Logs

### View Logs

**Via Dashboard:**
1. Go to https://dashboard.render.com
2. Select service: `tender-spotlight-pro`
3. Click "Logs" tab

**Via CLI:**
```bash
# View recent logs
render logs --service srv-d40dse95pdvs73fteuqg

# Follow logs in real-time
render logs --service srv-d40dse95pdvs73fteuqg --follow

# Filter logs
render logs --service srv-d40dse95pdvs73fteuqg --filter "error"
```

### Health Checks

```bash
# Check API health
curl https://tender-spotlight-pro.onrender.com/health

# Check database connection
render psql dpg-d41gqlmr433s73dvl3cg-a -c "SELECT 1"
```

### Metrics

Available in Render Dashboard:
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

---

## 🔐 Security Best Practices

### Credentials Management

1. **Never commit credentials to Git**
   - Use `.env.local` for local development
   - Set environment variables in Render dashboard
   - Use `.gitignore` for sensitive files

2. **Rotate credentials periodically**
   - Database password
   - API keys
   - Deploy hook keys

3. **Use SSH keys for Render CLI**
   ```bash
   render login --api-key YOUR_API_KEY
   ```

### Database Access

1. **Restrict external connections**
   - Enable only from trusted IPs
   - Use connection pooling
   - Close connections properly

2. **Use read-only users for analytics**
   ```sql
   CREATE USER readonly_user WITH PASSWORD 'secure_password';
   GRANT CONNECT ON DATABASE protender_database TO readonly_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
   ```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Can't connect to database

**Solutions:**
1. Check DATABASE_URL is correct
2. Verify database is running: `render databases get dpg-d41gqlmr433s73dvl3cg-a`
3. Test connection: `render psql dpg-d41gqlmr433s73dvl3cg-a`
4. Check Render dashboard for database status

### Deployment Failures

**Problem:** Service fails to deploy

**Solutions:**
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Check for TypeScript/compilation errors
4. Ensure dependencies are up to date

### Performance Issues

**Problem:** Slow API responses

**Solutions:**
1. Check database query performance
2. Add database indexes
3. Enable connection pooling
4. Upgrade Render plan if needed

---

## 💰 Cost Management

### Current Plan

**Database:**
- Plan: Starter ($7/month)
- Storage: 1 GB
- RAM: 256 MB
- Backups: Daily (last 7 days)

**API Service:**
- Plan: Starter ($7/month or free tier)
- RAM: 512 MB
- Auto-scaling: Disabled

**Total:** ~$7-14/month

### Upgrade Options

If you need more resources:
- Database Standard: $20/month (10 GB, 1 GB RAM)
- Service Standard: $15/month (2 GB RAM)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Render CLI Reference](https://render.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)

---

## 🔄 Quick Reference

### Essential Commands

```bash
# Database access
render psql dpg-d41gqlmr433s73dvl3cg-a

# View logs
render logs --service srv-d40dse95pdvs73fteuqg --follow

# Deploy API
curl -X POST "https://api.render.com/deploy/srv-d40dse95pdvs73fteuqg?key=Wc4uy690_ZU"

# List services
render services list

# Check health
curl https://tender-spotlight-pro.onrender.com/health
```

### Essential URLs

- **Dashboard:** https://dashboard.render.com
- **API Backend:** https://tender-spotlight-pro.onrender.com
- **Database ID:** dpg-d41gqlmr433s73dvl3cg-a
- **Service ID:** srv-d40dse95pdvs73fteuqg

---

**Document Status:** 🟢 Active
**Last Updated:** November 3, 2024
**Maintained By:** DevOps Team

---

*Keep this document updated when infrastructure changes occur.*
