# ProTenders Quick Reference Guide

**Last Updated:** January 2025

---

## 📍 Where to Find Everything

### Common Questions

| What you need | Where to find it |
|---------------|------------------|
| How to deploy? | [Deployment/DEPLOYMENT_GUIDE.md](./Deployment/DEPLOYMENT_GUIDE.md) |
| How does data flow work? | [Architecture/DATA_ETL_GUIDE.md](./Architecture/DATA_ETL_GUIDE.md) |
| How to use admin panel? | [Admin/ADMIN_PANEL_GUIDE.md](./Admin/ADMIN_PANEL_GUIDE.md) |
| SEO implementation status? | [SEO/SEO_IMPLEMENTATION_SUMMARY.md](./SEO/SEO_IMPLEMENTATION_SUMMARY.md) |
| Migration history? | [Migration/MIGRATION_SUMMARY.md](./Migration/MIGRATION_SUMMARY.md) |
| Feature roadmap? | [Planning/](./Planning/) folder |
| Cron job schedule? | [Features/CRON_JOBS.md](./Features/CRON_JOBS.md) |

---

## 🚀 Quick Commands

### Development
```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run ESLint
npx prisma studio             # Open database GUI
npx prisma migrate dev        # Run migrations
```

### Deployment
```bash
vercel                        # Deploy to preview
vercel --prod                 # Deploy to production
git push origin main          # Auto-deploy via Vercel
```

### Database
```bash
npx prisma db push            # Push schema changes
npx prisma generate           # Generate Prisma Client
npx prisma migrate reset      # Reset database (⚠️ DELETES DATA)
```

---

## 🔗 Important URLs

### Production
- **Main Site:** https://protenders.co.za
- **Admin Panel:** https://protenders.co.za/admin
- **API:** https://protenders.co.za/api

### SEO Tools
- **Redirect Manager:** https://protenders.co.za/admin/seo/redirects
- **404 Monitor:** https://protenders.co.za/admin/seo/404-monitor
- **News Sitemap:** https://protenders.co.za/news-sitemap.xml
- **RSS Feed:** https://protenders.co.za/rss.xml

### External Services
- **Database:** Render PostgreSQL
- **Hosting:** Vercel
- **Background Jobs:** Inngest
- **OCDS API:** https://data.etenders.gov.za

---

## 📂 Project Structure

```
protenders-platform/
├── src/                       # Application source
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   └── lib/                  # Utilities
├── Documentation/            # 📚 All documentation HERE
│   ├── SEO/                 # SEO guides
│   ├── Deployment/          # Deployment docs
│   ├── Architecture/        # System design
│   ├── Features/            # Feature docs
│   ├── Admin/               # Admin guides
│   ├── Migration/           # Migration history
│   └── Planning/            # Roadmaps
├── prisma/                   # Database schema
├── public/                   # Static assets
└── ToCheck/                  # Files to review
```

---

## 🎯 Common Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement feature
3. Add documentation to `Documentation/Features/`
4. Create PR to main branch
5. Deploy after merge

### Updating Documentation
1. Find relevant file in `Documentation/` folder
2. Edit markdown file
3. Update "Last Updated" date
4. Commit changes

### Deploying Changes
1. Merge to `main` branch
2. Vercel auto-deploys
3. Verify at https://protenders.co.za
4. Monitor in Vercel dashboard

### Running Cron Jobs Manually
1. Go to https://protenders.co.za/admin/etl
2. Click "Trigger Manual Sync"
3. Monitor job status in admin panel

---

## 🆘 Troubleshooting

### Build Errors
1. Check `npm run lint`
2. Run `npm run type-check`
3. Clear `.next` folder: `rm -rf .next`
4. Rebuild: `npm run build`

### Database Issues
1. Check connection string in `.env.local`
2. Run `npx prisma generate`
3. Check Render dashboard for database status

### Deployment Issues
1. Check Vercel deployment logs
2. Verify environment variables in Vercel
3. Check build output in Vercel dashboard

---

## 👥 Team Contacts

- **Development:** development@protenders.co.za
- **Support:** support@protenders.co.za
- **General:** info@protenders.co.za

---

## 📊 Key Metrics

### Platform Stats
- **Total Tenders:** 48,000+ OCDS releases
- **Daily Sync:** Automated via Inngest
- **Uptime:** 99.9% (Vercel Edge)
- **Database:** PostgreSQL on Render

### SEO Performance
- **Schema Markup:** 8 types implemented
- **Sitemaps:** 2 (main + news)
- **RSS Feed:** Active
- **404 Monitoring:** Active
- **Redirects:** Managed via admin panel

---

## 🔐 Admin Credentials

**Location:** [Admin/ADMIN_CREDENTIALS.md](./Admin/ADMIN_CREDENTIALS.md) (restricted access)

---

*For detailed information, see the [full documentation index](./README.md)*
