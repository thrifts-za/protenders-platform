import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Building2, Factory, Zap, Hammer, Laptop, Briefcase, GraduationCap,
  Heart, Truck, ShieldCheck, Trees, Droplet, Shirt, Package, FileText,
  Search, TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: 'Browse All Tender Categories | Government Procurement Categories | ProTenders',
  description: 'Explore all government tender categories in South Africa. Find procurement opportunities across construction, IT services, consulting, healthcare, manufacturing, and 80+ official eTenders categories.',
  keywords: 'tender categories, procurement categories, government categories, etenders categories, construction tenders, IT tenders, consulting tenders, service categories, supply categories',
};

// Official eTenders categories organized by sector
const categoryGroups = [
  {
    sector: "Services: Professional & Technical",
    icon: Briefcase,
    color: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    categories: [
      "Activities of head offices; management consultancy activities",
      "Architectural and engineering activities; technical testing and analysis",
      "Computer programming, consultancy and related activities",
      "Legal and accounting activities",
      "Professional, scientific and technical activities",
      "Other professional, scientific and technical activities",
      "Scientific research and development",
      "Advertising and market research",
    ]
  },
  {
    sector: "Services: Functional & Operations",
    icon: ShieldCheck,
    color: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    categories: [
      "Services: Functional (Including Cleaning and Security Services)",
      "Security and investigation activities",
      "Services to buildings and landscape activities",
      "Administrative and support activities",
      "Office administrative, office support and other business support activities",
      "Employment activities",
      "Rental and leasing activities",
      "Travel agency, tour operator, reservation service and related activities",
    ]
  },
  {
    sector: "Construction & Engineering",
    icon: Hammer,
    color: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    categories: [
      "Construction",
      "Construction of buildings",
      "Civil engineering",
      "Specialised construction activities",
      "Services: Building",
      "Services: Civil",
      "Services: Electrical",
    ]
  },
  {
    sector: "Information & Communication",
    icon: Laptop,
    color: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    categories: [
      "Information and communication",
      "Publishing activities",
      "Motion picture, video and television programme production, sound recording and music publishing activities",
      "Programming and broadcasting activities",
      "Telecommunications",
      "Information service activities",
      "Printing and reproduction of recorded media",
    ]
  },
  {
    sector: "Healthcare & Social Services",
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-600 dark:text-red-400",
    categories: [
      "Human health and social work activities",
      "Human health activities",
      "Residential care activities",
      "Supplies: Medical",
    ]
  },
  {
    sector: "Education & Culture",
    icon: GraduationCap,
    color: "bg-indigo-100 dark:bg-indigo-900",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    categories: [
      "Education",
      "Libraries, archives, museums and other cultural activities",
      "Arts, entertainment and recreation",
      "Creative, arts and entertainment activities",
      "Sports activities and amusement and recreation activities",
    ]
  },
  {
    sector: "Manufacturing & Production",
    icon: Factory,
    color: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    categories: [
      "Manufacturing",
      "Other manufacturing",
      "Manufacture of textiles",
      "Manufacture of paper and paper products",
      "Manufacture of coke and refined petroleum products",
      "Manufacture of chemicals and chemical products",
      "Manufacture of rubber and plastics products",
      "Manufacture of other non-metallic mineral products",
      "Manufacture of basic metals",
      "Manufacture of fabricated metal products, except machinery and equipment",
      "Manufacture of computer, electronic and optical products",
      "Manufacture of electrical equipment",
      "Manufacture of machinery and equipment n.e.c.",
      "Manufacture of motor vehicles, trailers and semi-trailers",
      "Manufacture of furniture",
      "Repair and installation of machinery and equipment",
    ]
  },
  {
    sector: "Transportation & Logistics",
    icon: Truck,
    color: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    categories: [
      "Transportation and storage",
      "Land transport and transport via pipelines",
      "Water transport",
      "Air transport",
      "Warehousing and support activities for transportation",
      "Postal and courier activities",
    ]
  },
  {
    sector: "Utilities & Infrastructure",
    icon: Zap,
    color: "bg-yellow-100 dark:bg-yellow-900",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    categories: [
      "Electricity, gas, steam and air conditioning",
      "Water supply; sewerage, waste management and remediation activities",
      "Water collection, treatment and supply",
      "Sewerage",
      "Waste collection, treatment and disposal activities; materials recovery",
      "Remediation activities and other waste management services",
    ]
  },
  {
    sector: "Supplies & Equipment",
    icon: Package,
    color: "bg-teal-100 dark:bg-teal-900",
    iconColor: "text-teal-600 dark:text-teal-400",
    categories: [
      "Supplies: General",
      "Supplies: Computer Equipment",
      "Supplies: Electrical Equipment",
      "Supplies: Clothing/Textiles/Footwear",
      "Supplies: Stationery/Printing",
      "Supplies: Perishable Provisions",
    ]
  },
  {
    sector: "Mining & Extraction",
    icon: Trees,
    color: "bg-emerald-100 dark:bg-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    categories: [
      "Mining and quarrying",
      "Mining of coal and lignite",
      "Mining support service activities",
    ]
  },
  {
    sector: "Financial & Insurance",
    icon: Building2,
    color: "bg-cyan-100 dark:bg-cyan-900",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    categories: [
      "Financial and insurance activities",
      "Financial service activities, except insurance and pension funding",
      "Insurance, reinsurance and pension funding, except compulsory social security",
      "Activities auxiliary to financial service and insurance activities",
    ]
  },
  {
    sector: "Accommodation & Food Services",
    icon: Building2,
    color: "bg-pink-100 dark:bg-pink-900",
    iconColor: "text-pink-600 dark:text-pink-400",
    categories: [
      "Accommodation",
      "Food and beverage service activities",
    ]
  },
  {
    sector: "Real Estate & Property",
    icon: Building2,
    color: "bg-violet-100 dark:bg-violet-900",
    iconColor: "text-violet-600 dark:text-violet-400",
    categories: [
      "Real estate activities",
    ]
  },
  {
    sector: "Other Services",
    icon: FileText,
    color: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    categories: [
      "Services: General",
      "Other service activities",
      "Other personal service activities",
      "Activities of households as employers of domestic personnel",
      "Wholesale and retail trade and repair of motor vehicles and motorcycles",
      "Disposals: General",
    ]
  },
];

export default function CategoriesPage() {
  const totalCategories = categoryGroups.reduce((sum, group) => sum + group.categories.length, 0);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">All Categories</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Browse Government Tenders by Category
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore {totalCategories}+ official eTenders categories across all sectors. Find procurement opportunities
              that match your business capabilities and expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search All Tenders
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/etenders">View eTenders Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full py-12">
        <div className="content-container">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{totalCategories}+</p>
                  <p className="text-sm text-muted-foreground">Official Categories</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{categoryGroups.length}</p>
                  <p className="text-sm text-muted-foreground">Major Sectors</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">10,000+</p>
                  <p className="text-sm text-muted-foreground">Active Tenders</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Notice */}
          <Card className="mb-12 bg-gradient-to-br from-primary/5 to-background border-primary/20">
            <CardContent className="pt-6 pb-6">
              <div className="text-center max-w-2xl mx-auto">
                <Badge className="mb-3" variant="secondary">Coming Soon</Badge>
                <h2 className="text-2xl font-bold mb-3">
                  Category-Specific Pages In Development
                </h2>
                <p className="text-muted-foreground">
                  We're currently backfilling tender data for all official eTenders categories. Soon you'll be able
                  to browse dedicated pages for each category with filtered tenders, insights, and requirements.
                  In the meantime, use our search to find tenders across all categories.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Groups */}
          {categoryGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${group.color} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${group.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{group.sector}</h2>
                    <p className="text-sm text-muted-foreground">{group.categories.length} categories</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.categories.map((category, catIdx) => (
                    <Card key={catIdx} className="relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm leading-tight">
                            {category}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Soon
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Tender data for this category is currently being backfilled.
                          Check back soon for dedicated pages and filtered results.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Search Tenders Across All Categories Now
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  While we're building category-specific pages, you can already search and filter
                  tenders across all {totalCategories}+ categories using our advanced search.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/search">
                      Advanced Search
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link href="/alerts">
                      Set Up Alerts
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
