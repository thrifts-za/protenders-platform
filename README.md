# ProTenders Platform

> South Africa's Premier Government Tender Discovery & Procurement Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![Production](https://img.shields.io/badge/status-production-green)](https://protenders.co.za)

**Live Platform:** [https://protenders.co.za](https://protenders.co.za)

---

## 🚀 About

ProTenders provides **AI-powered government tender discovery** for South African businesses:

- 🎯 **48,000+ OCDS Tenders** from National Treasury
- 🔍 **Advanced Search & Filtering** with smart algorithms
- 🔔 **Real-Time Alerts** for new opportunities
- 📊 **BEE Intelligence** and demographic insights
- 💰 **Funding Discovery** - 100+ grants and loans
- 📈 **Procurement Analytics** with payment tracking

---

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/thrifts-za/protenders-platform.git
cd protenders-platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 📚 Documentation

**All documentation is in the [`/Documentation`](./Documentation/) folder.**

### Quick Links

| What You Need | Where to Find It |
|---------------|------------------|
| 📖 **Getting Started** | [Documentation/README.md](./Documentation/README.md) |
| ⚡ **Quick Reference** | [Documentation/QUICK_REFERENCE.md](./Documentation/QUICK_REFERENCE.md) |
| 🚀 **Deployment Guide** | [Documentation/Deployment/](./Documentation/Deployment/) |
| 🎯 **SEO Implementation** | [Documentation/SEO/](./Documentation/SEO/) |
| 🏗️ **Architecture** | [Documentation/Architecture/](./Documentation/Architecture/) |
| ⚙️ **Admin Panel** | [Documentation/Admin/](./Documentation/Admin/) |
| 📦 **Features** | [Documentation/Features/](./Documentation/Features/) |
| 🗺️ **Roadmap** | [Documentation/Planning/](./Documentation/Planning/) |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js v5
- **Jobs:** Inngest (background processing)
- **Hosting:** Vercel (Edge) + Render (DB)
- **Analytics:** Mixpanel, GA4, Microsoft Clarity

---

## 📊 Features

### Core Platform
✅ Advanced tender search across 48K+ opportunities
✅ Multi-faceted filtering (province, category, buyer, value)
✅ Automated daily sync with National Treasury OCDS API
✅ Email alerts for saved searches
✅ Tender collections and bookmarking

### Phase 2 Enhancements (Completed)
✅ Data enrichment (briefings, contacts, documents)
✅ Deep filtering (organ type, estimated value)
✅ Mobile-first responsive design
✅ Performance optimizations (SSR, edge caching)

### Phase 3 Features (In Progress)
✅ Funding discovery engine (100+ programs)
✅ Procurement payment analytics
✅ BEE demographic insights
🔄 Advanced tender scoring

### Latest: SEO Enhancements (RankMath-Inspired)
✅ Comprehensive schema markup (FAQ, HowTo, Product, LocalBusiness)
✅ 404 monitoring & redirect manager
✅ Automated internal linking (related tenders)
✅ News sitemap & RSS feed
✅ Image SEO automation
✅ Local SEO for provinces/municipalities

[See full SEO implementation details →](./Documentation/SEO/SEO_IMPLEMENTATION_SUMMARY.md)

---

## 💻 Development

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Database
npx prisma studio    # Database GUI
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes

# Deployment
vercel               # Deploy preview
vercel --prod        # Deploy production
```

---

## 🚢 Deployment

**Hosting:** Vercel (auto-deploys from `main` branch)
**Database:** Render PostgreSQL
**Domain:** protenders.co.za

[Full deployment guide →](./Documentation/Deployment/DEPLOYMENT_GUIDE.md)

---

## 🗂️ Project Structure

```
protenders-platform/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── lib/              # Utilities & helpers
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── Documentation/        # 📚 All project documentation
│   ├── SEO/             # SEO guides
│   ├── Deployment/      # Deployment docs
│   ├── Architecture/    # System design
│   ├── Features/        # Feature docs
│   ├── Admin/           # Admin guides
│   └── Planning/        # Roadmaps
└── scripts/             # Utility scripts
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📈 Status

**Version:** 3.0 (Next.js 15 Migration Complete)
**Phase:** Phase 3 - Funding Discovery Engine
**Environment:** Production
**Uptime:** 99.9% (Vercel Edge)

### Recent Updates
- ✅ Next.js 15 migration complete
- ✅ RankMath-inspired SEO enhancements
- ✅ Funding discovery engine launched
- ✅ Procurement analytics integrated
- ✅ Mobile optimization complete

---

## 📞 Contact

- **Website:** [https://protenders.co.za](https://protenders.co.za)
- **Admin Panel:** [https://protenders.co.za/admin](https://protenders.co.za/admin)
- **Support:** support@protenders.co.za
- **Development:** development@protenders.co.za

---

## 📝 License

Proprietary - All rights reserved by ProTenders

---

**Built with ❤️ for South African entrepreneurs and businesses**

*For detailed documentation, see the [Documentation](./Documentation/) folder.*
