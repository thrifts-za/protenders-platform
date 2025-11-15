import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Clock, AlertTriangle } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

// ISR: Revalidate every 30 minutes (tenders closing today need frequent updates)
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    title: `Government Tenders Closing Today - ${today} | ProTenders`,
    description: `View all government tenders closing today (${today}) in South Africa. Don't miss these critical deadlines! Browse urgent tender opportunities from national and provincial departments.`,
    keywords: [
      'tenders closing today',
      'government tenders closing today',
      'urgent tenders south africa',
      'tenders closing today south africa',
      `tenders closing ${today}`,
      'etenders closing today',
      'urgent government opportunities',
      'last minute tenders',
    ].join(', '),
    openGraph: {
      title: `Government Tenders Closing Today - ${today}`,
      description: `Critical: Government tenders closing today in South Africa. Act now to submit your bids.`,
      url: 'https://protenders.co.za/tenders/closing-today',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Government Tenders Closing Today - ${today}`,
      description: `Critical: Government tenders closing today in South Africa. Act now!`,
    },
  };
}

export default function ClosingTodayPage() {
  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/etenders' },
    { label: 'Closing Today' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Closing Today", url: "https://protenders.co.za/tenders/closing-today" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="w-full border-b bg-gradient-to-br from-red-50 via-orange-50 to-background dark:from-red-950/20 dark:via-orange-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-red-600">Critical - Last Day</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Government Tenders Closing Today
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {today} - These tenders close today! Ensure your bids are submitted before the deadline.
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
              <div className="text-lg font-semibold">Every 30 minutes</div>
            </Card>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <span className="font-semibold">Urgent Action Required!</span> These tenders close today.
              Make sure all documents are ready and submitted before the closing time specified on each tender.
            </AlertDescription>
          </Alert>

          {/* Live tender data loaded client-side */}
          <LiveTendersFiltered
            filters={{
              closingInDays: 0,
              page: 1,
              pageSize: 100,
              sort: "-closingDate"
            }}
            emptyIcon={<Clock className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No Tenders Closing Today"
            emptyDescription="No government tenders are closing today. Check back tomorrow or browse other opportunities."
            emptyAction={
              <div className="flex gap-3 justify-center">
                <Link href="/tenders/closing-this-week">
                  <Button variant="outline">Closing This Week</Button>
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
