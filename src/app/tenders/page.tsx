import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Search, Clock, TrendingUp, Target, MapPin, Grid3x3, Calendar, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Browse Government Tenders | Protenders",
  description: "Explore government tenders by latest updates, closing dates, opportunities, categories, provinces, and more. Find the perfect tender for your business.",
};

export default function TendersHub() {
  const browseOptions = [
    {
      title: "Search All Tenders",
      description: "Advanced search with filters for categories, provinces, buyers, and more",
      icon: Search,
      href: "/search",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "10,000+ active tenders",
    },
    {
      title: "Latest Tenders",
      description: "Recently published tenders from the last 24 hours",
      icon: Clock,
      href: "/latest",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Updated hourly",
    },
    {
      title: "Closing Soon",
      description: "Urgent tenders with approaching deadlines",
      icon: AlertCircle,
      href: "/closing-soon",
      color: "text-red-600",
      bgColor: "bg-red-50",
      stats: "Don't miss out",
    },
    {
      title: "Active Opportunities",
      description: "All currently open tender opportunities",
      icon: Target,
      href: "/opportunities",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "100+ new weekly",
    },
    {
      title: "Browse by Province",
      description: "Find tenders specific to your province or region",
      icon: MapPin,
      href: "/provinces",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: "All 9 provinces",
    },
    {
      title: "Browse by Category",
      description: "Explore tenders by procurement category",
      icon: Grid3x3,
      href: "/categories",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "91+ categories",
    },
    {
      title: "Public Sector Tenders",
      description: "Government departments, SOEs, and state entities",
      icon: TrendingUp,
      href: "/public-sector-tenders",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      stats: "Verified sources",
    },
    {
      title: "eTenders Portal",
      description: "Electronic tender submissions and management",
      icon: Calendar,
      href: "/etenders",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      stats: "Digital first",
    },
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Browse Tenders' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="w-full border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="content-container py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Government Tenders
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            Find the perfect tender opportunities for your business. Search by category, location,
            deadline, or explore our curated collections.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/search">
              <Button size="lg">
                <Search className="h-5 w-5 mr-2" />
                Search All Tenders
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" size="lg">
                Set Up Alerts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse Options Grid */}
      <section className="w-full py-12">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-8">Explore Tenders</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {browseOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link key={option.href} href={option.href}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary cursor-pointer group">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${option.color}`} />
                      </div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground font-medium">
                        {option.stats}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="w-full py-12 bg-muted/30">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Tenders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">91+</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">9</div>
                <div className="text-sm text-muted-foreground">Provinces Covered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Live Updates</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12">
        <div className="content-container">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Never Miss an Opportunity</h2>
              <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                Set up custom alerts and get notified when new tenders matching your criteria are published.
              </p>
              <Link href="/alerts">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Create Your First Alert
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
