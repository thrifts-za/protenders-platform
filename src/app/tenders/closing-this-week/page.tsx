import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Calendar, AlertTriangle } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

// ISR: Revalidate every 2 hours
export const revalidate = 7200;

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dateRange = `${today.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return {
    title: `Government Tenders Closing This Week - ${dateRange} | ProTenders`,
    description: `Browse all government tenders closing this week (${dateRange}) in South Africa. Plan your bid submissions for upcoming deadlines. Updated every 2 hours with fresh opportunities from national and provincial departments.`,
    keywords: [
      'tenders closing this week',
      'government tenders closing this week',
      'weekly tenders south africa',
      'upcoming tender deadlines',
      'etenders this week',
      'government opportunities this week',
      '7 day tenders',
      'weekly government tenders',
    ].join(', '),
    openGraph: {
      title: `Government Tenders Closing This Week - ${dateRange}`,
      description: `Browse government tenders closing in the next 7 days. Plan your bid submissions now.`,
      url: 'https://protenders.co.za/tenders/closing-this-week',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Government Tenders Closing This Week - ${dateRange}`,
      description: `Browse government tenders closing in the next 7 days.`,
    },
  };
}

export default function ClosingThisWeekPage() {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dateRange = `${today.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })} - ${weekEnd.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/etenders' },
    { label: 'Closing This Week' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Closing This Week", url: "https://protenders.co.za/tenders/closing-this-week" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="w-full border-b bg-gradient-to-br from-orange-50 via-amber-50 to-background dark:from-orange-950/20 dark:via-amber-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-orange-600">Urgent - Next 7 Days</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Government Tenders Closing This Week
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {dateRange} - Plan your bid submissions for tenders closing in the next 7 days.
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
          <Alert className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <span className="font-semibold">Plan Ahead!</span> These tenders close within the next 7 days.
              Start preparing your bid documents and ensure you meet all requirements.
            </AlertDescription>
          </Alert>

          <LiveTendersFiltered
            filters={{
              closingInDays: 7,
              page: 1,
              pageSize: 100,
              sort: "-closingDate"
            }}
            emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No Tenders Closing This Week"
            emptyDescription="No government tenders are closing in the next 7 days. Browse other opportunities."
            emptyAction={
              <div className="flex gap-3 justify-center">
                <Link href="/tenders/closing-this-month">
                  <Button variant="outline">Closing This Month</Button>
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
