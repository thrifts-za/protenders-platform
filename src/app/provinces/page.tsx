import { Metadata } from 'next';
import Link from "next/link";
import { getAllProvinceSlugs, getProvinceBySlug } from "@/data/provinces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { MapPin, Building2, TrendingUp, ArrowRight, Search } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Browse Tenders by Province | All 9 South African Provinces | ProTenders',
  description: 'Find government tenders across all 9 South African provinces. Search procurement opportunities from Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, and more. Free tender alerts.',
  keywords: 'south africa provinces, provincial tenders, government tenders by province, gauteng tenders, western cape tenders, kzn tenders, provincial procurement',
};

export default function ProvincesIndex() {
  const slugs = getAllProvinceSlugs();
  const provinces = slugs.map((slug) => {
    const data = getProvinceBySlug(slug);
    return {
      slug,
      name: data?.name || slug,
      capital: data?.capital,
      description: data?.description,
      keyIndustries: data?.keyIndustries || [],
      statistics: data?.statistics,
    };
  });

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Provinces' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">All 9 Provinces</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Browse Government Tenders by Province
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore tender opportunities across all 9 South African provinces. Find procurement opportunities
              from provincial departments, municipalities, and government entities in your region.
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
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">9</p>
                  <p className="text-sm text-muted-foreground">Provinces</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">100+</p>
                  <p className="text-sm text-muted-foreground">Provincial Departments</p>
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

          {/* Province Cards */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Select Your Province</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinces.map((province) => (
                <Link key={province.slug} href={`/province/${province.slug}`}>
                  <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="group-hover:text-primary transition-colors">
                          {province.name}
                        </span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {province.description?.split('.')[0]}.
                        </p>

                        {province.capital && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Capital: {province.capital}
                            </span>
                          </div>
                        )}

                        {province.statistics?.population && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Population: {province.statistics.population}
                            </span>
                          </div>
                        )}

                        {province.keyIndustries && province.keyIndustries.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Key Industries:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {province.keyIndustries.slice(0, 3).map((industry) => (
                                <Badge key={industry} variant="secondary" className="text-xs">
                                  {industry}
                                </Badge>
                              ))}
                              {province.keyIndustries.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{province.keyIndustries.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="pt-8 pb-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Why Browse Tenders by Province?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Each province in South Africa has its own procurement budget and priorities. By focusing on
                  specific provinces, you can target opportunities that align with your business location,
                  capacity, and local content requirements. Provincial tenders often favor local suppliers
                  and SMMEs, making them ideal entry points for growing businesses.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild>
                    <Link href="/search">
                      Browse All Tenders
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/alerts">
                      Set Up Tender Alerts
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

