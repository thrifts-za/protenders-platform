# ProTenders Platform

> South Africa's Premier Government Tender Discovery & Procurement Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)

---

## 🚀 About ProTenders

ProTenders is a comprehensive government procurement intelligence platform for South Africa, providing:

- **48,000+ OCDS Tenders** from National Treasury
- **AI-Powered Tender Discovery** with intelligent search and filtering
- **Real-Time Alerts** for new tender opportunities
- **BEE Opportunity Tracking** for Black Economic Empowerment
- **Funding Discovery Engine** for grants and loans
- **Procurement Analytics** with payment insights and demographics

**Live Platform:** [https://protenders.co.za](https://protenders.co.za)

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/thrifts-za/protenders-platform.git
cd protenders-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## ✨ Features

### Core Features

- **Advanced Search** - Multi-faceted search across 48K+ government tenders
- **Smart Filters** - Filter by province, category, closing date, buyer, value
- **Real-Time Sync** - Automated daily sync with National Treasury OCDS API
- **Tender Alerts** - Email notifications for saved searches
- **Saved Tenders** - Bookmark and organize tender opportunities
- **Tender Packs** - Create collections of related tenders

### Phase 2 Features

- **Data Enrichment** - Briefing details, contact info, document links
- **Deep Filtering** - Organ of state, estimated value, document availability
- **Mobile Optimization** - Fully responsive design
- **Performance** - Server-side rendering, edge caching, image optimization

### Phase 3 Features (In Progress)

- **Funding Discovery** - Database of 100+ funding opportunities
- **Procurement Insights** - Payment analytics and demographic trends
- **BEE Intelligence** - Track BEE spend and opportunities

### Latest: SEO Enhancements (RankMath-Inspired)

- **Schema Markup** - FAQ, HowTo, Product, LocalBusiness schemas
- **404 Monitor** - Track and redirect broken links
- **Internal Linking** - Automated related tender suggestions
- **News Sitemap** - Google News integration
- **RSS Feed** - Content distribution
- **Image SEO** - Automated alt text generation
- **Local SEO** - Province and municipality optimization

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **State Management:** TanStack Query
- **Forms:** React Hook Form + Zod

### Backend
- **Database:** PostgreSQL (Render.com)
- **ORM:** Prisma 6
- **Authentication:** NextAuth.js v5
- **Background Jobs:** Inngest
- **API:** Next.js API Routes (Server Actions)

### Infrastructure
- **Hosting:** Vercel (Edge Network)
- **Database:** Render PostgreSQL
- **Analytics:** Mixpanel + Google Analytics 4 + Microsoft Clarity
- **Monitoring:** Vercel Analytics + Speed Insights

### Data Sources
- **National Treasury OCDS API** (etenders.gov.za)
- **PowerBI Dashboard** (payment analytics)
- **Web Scraping** (enrichment data)

---

## 📚 Documentation

All platform documentation is located in the **[`/Documentation`](./Documentation/)** folder.

### Key Documentation

| Topic | Location | Description |
|-------|----------|-------------|
| **Getting Started** | [Documentation/README.md](./Documentation/README.md) | Documentation index |
| **SEO Guide** | [Documentation/SEO/](./Documentation/SEO/) | SEO implementation and strategy |
| **Deployment** | [Documentation/Deployment/](./Documentation/Deployment/) | Deployment guides |
| **Architecture** | [Documentation/Architecture/](./Documentation/Architecture/) | System architecture |
| **Admin Panel** | [Documentation/Admin/](./Documentation/Admin/) | Admin dashboard guide |
| **Migration** | [Documentation/Migration/](./Documentation/Migration/) | Vite → Next.js migration |
| **Features** | [Documentation/Features/](./Documentation/Features/) | Feature documentation |

### Quick Links

- 📖 [Full Documentation Index](./Documentation/README.md)
- 🚀 [Deployment Guide](./Documentation/Deployment/DEPLOYMENT_GUIDE.md)
- 🎯 [SEO Implementation Summary](./Documentation/SEO/SEO_IMPLEMENTATION_SUMMARY.md)
- 🏗️ [Data ETL Guide](./Documentation/Architecture/DATA_ETL_GUIDE.md)
- ⚙️ [Admin Panel Guide](./Documentation/Admin/ADMIN_PANEL_GUIDE.md)

---

## 💻 Development

### Development Workflow

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

### Database Commands

```bash
# Run migrations
npx prisma migrate dev

# Push schema changes (development)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN="..."
NEXT_PUBLIC_GA_ID="..."

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Setup

1. **Database:** Set up PostgreSQL on Render.com
2. **Environment Variables:** Configure in Vercel dashboard
3. **Build Settings:** Already configured in `vercel.json`
4. **Domain:** Configure custom domain in Vercel

See [Deployment Guide](./Documentation/Deployment/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🏗️ Project Structure

```
protenders-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # User dashboard
│   │   └── tenders/           # Public tender pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # Prisma client
│   │   ├── auth.ts          # NextAuth config
│   │   └── ...              # Other utilities
│   └── styles/              # Global styles
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── Documentation/           # 📚 All documentation
│   ├── SEO/                # SEO guides
│   ├── Deployment/         # Deployment docs
│   ├── Architecture/       # Architecture docs
│   ├── Features/           # Feature docs
│   ├── Admin/              # Admin guides
│   ├── Migration/          # Migration docs
│   └── Planning/           # Project planning
├── ToCheck/                # Files to review
└── .claude/                # Claude Code config
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Reporting Issues

- Use GitHub Issues
- Provide clear description and reproduction steps
- Include screenshots if applicable
- Label appropriately (`bug`, `enhancement`, `documentation`)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Prettier for formatting
- Write clear commit messages
- Add tests for new features
- Update documentation

---

## 📊 Project Status

### Current Version
- **Version:** 3.0 (Next.js 15 Migration Complete)
- **Phase:** Phase 3 - Funding Discovery Engine
- **Status:** Production Ready

### Recent Updates
- ✅ Migrated from Vite/Express to Next.js 15
- ✅ Implemented comprehensive SEO enhancements
- ✅ Added 404 monitoring and redirect management
- ✅ Launched funding discovery engine
- ✅ Integrated procurement payment analytics
- ✅ Mobile optimization complete

### Roadmap
- [ ] Rank tracking dashboard (Google Search Console API)
- [ ] Content AI for meta optimization
- [ ] Advanced tender scoring algorithm
- [ ] Supplier intelligence features
- [ ] API for third-party integrations

---

## 📝 License

Proprietary - All rights reserved by ProTenders

---

## 📞 Contact & Support

### Team
- **Development:** development@protenders.co.za
- **Support:** support@protenders.co.za
- **General:** info@protenders.co.za

### Links
- **Website:** [https://protenders.co.za](https://protenders.co.za)
- **Admin Panel:** [https://protenders.co.za/admin](https://protenders.co.za/admin)
- **GitHub:** [https://github.com/thrifts-za/protenders-platform](https://github.com/thrifts-za/protenders-platform)

---

## 🙏 Acknowledgments

- **National Treasury** - OCDS data source
- **eTenders Portal** - Government tender platform
- **Vercel** - Hosting platform
- **Render** - Database hosting
- **Inngest** - Background job processing

---

**Built with ❤️ for South African entrepreneurs and businesses**

---

*For detailed documentation, see the [Documentation](./Documentation/) folder.*
