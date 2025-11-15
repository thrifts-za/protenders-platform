import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Newspaper, Sparkles } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    title: `New Government Tenders Published Today - ${today} | ProTenders`,
    description: `Fresh government tender opportunities published today (${today}) in South Africa. Be the first to discover new tenders from national and provincial departments. Updated hourly with the latest opportunities.`,
    keywords: [
      'new tenders today',
      'tenders published today',
      'latest government tenders',
      'fresh tenders south africa',
      `tenders ${today}`,
      'new etenders today',
      'latest tender opportunities',
      'today\'s tenders',
    ].join(', '),
    openGraph: {
      title: `New Government Tenders Published Today - ${today}`,
      description: `Fresh government tenders published today in South Africa. Be the first to bid!`,
      url: 'https://protenders.co.za/tenders/published-today',
      type: 'website',
    },
  };
}

export default function PublishedTodayPage() {
  // Calculate today's date (start of day) for filter
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const publishedSince = todayDate.toISOString();

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/etenders' },
    { label: 'Published Today' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Published Today", url: "https://protenders.co.za/tenders/published-today" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="w-full border-b bg-gradient-to-br from-green-50 via-emerald-50 to-background dark:from-green-950/20 dark:via-emerald-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Newspaper className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-green-600">Fresh Opportunities</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                New Government Tenders Published Today
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {today} - Be the first to discover new tender opportunities published in the last 24 hours.
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
              <div className="text-lg font-semibold">Every hour</div>
            </Card>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <span className="font-semibold">Early Bird Advantage!</span> These are brand new tenders
              published today. Getting in early gives you more time to prepare quality bids.
            </AlertDescription>
          </Alert>

          <LiveTendersFiltered
            filters={{
              publishedSince,
              page: 1,
              pageSize: 100,
              sort: "-publishedDate"
            }}
            emptyIcon={<Newspaper className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No New Tenders Published Today"
            emptyDescription="No government tenders have been published today yet. Check back later or browse recent tenders."
            emptyAction={
              <div className="flex gap-3 justify-center">
                <Link href="/tenders/published-this-week">
                  <Button variant="outline">Published This Week</Button>
                </Link>
                <Link href="/etenders">
                  <Button>Browse All Tenders</Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
