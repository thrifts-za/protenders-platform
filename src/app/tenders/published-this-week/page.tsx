import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Newspaper, TrendingUp } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

// ISR: Revalidate every 2 hours
export const revalidate = 7200;

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const dateRange = `${weekStart.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return {
    title: `Government Tenders Published This Week - ${dateRange} | ProTenders`,
    description: `Browse all government tenders published in the last 7 days (${dateRange}) in South Africa. Stay updated with the latest tender opportunities from national and provincial departments. Updated every 2 hours.`,
    keywords: [
      'tenders published this week',
      'new tenders this week',
      'latest tenders south africa',
      'weekly new tenders',
      'recent government tenders',
      'this week\'s tenders',
      'new etenders this week',
      'fresh tender opportunities',
    ].join(', '),
    openGraph: {
      title: `New Government Tenders Published This Week - ${dateRange}`,
      description: `Browse fresh government tenders published in the last 7 days. Discover new opportunities.`,
      url: 'https://protenders.co.za/tenders/published-this-week',
      type: 'website',
    },
  };
}

export default function PublishedThisWeekPage() {
  // Calculate 7 days ago for filter
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const publishedSince = weekAgo.toISOString();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const dateRange = `${weekStart.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })} - ${today.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/etenders' },
    { label: 'Published This Week' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Published This Week", url: "https://protenders.co.za/tenders/published-this-week" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="w-full border-b bg-gradient-to-br from-emerald-50 via-teal-50 to-background dark:from-emerald-950/20 dark:via-teal-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-emerald-600">Last 7 Days</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                New Government Tenders Published This Week
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {dateRange} - Stay updated with fresh tender opportunities from the past week.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg font-semibold">Live Data</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Page Updates</div>
              <div className="text-lg font-semibold">Every 2 hours</div>
            </Card>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <AlertDescription>
              <span className="font-semibold">Fresh Opportunities:</span> These tenders were published in the last
              7 days, giving you ample time to prepare competitive bids.
            </AlertDescription>
          </Alert>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">New Tenders This Week</h2>
              <p className="text-muted-foreground">
                Updated every 2 hours - sorted by published date (newest first)
              </p>
            </div>
            <Link href="/tenders/published-today">
              <Button variant="outline" size="sm">Today's Tenders</Button>
            </Link>
          </div>

          <LiveTendersFiltered
            filters={{
              publishedSince,
              page: 1,
              pageSize: 100,
              sort: "-publishedDate"
            }}
            emptyIcon={<Newspaper className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No Tenders Published This Week"
            emptyDescription="No government tenders have been published in the last 7 days. Browse all opportunities."
            emptyAction={
              <Link href="/etenders">
                <Button>Browse All Tenders</Button>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
