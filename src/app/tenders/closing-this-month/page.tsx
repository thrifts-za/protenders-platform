import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CalendarDays, Info } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

// ISR: Revalidate every 6 hours
export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });

  return {
    title: `Government Tenders Closing This Month - ${currentMonth} | ProTenders`,
    description: `Browse all government tenders closing in ${currentMonth} in South Africa. Plan ahead with 30-day visibility of upcoming tender deadlines. Comprehensive list updated every 6 hours with new opportunities.`,
    keywords: [
      'tenders closing this month',
      'government tenders closing this month',
      'monthly tenders south africa',
      `tenders ${currentMonth.toLowerCase()}`,
      'upcoming tender deadlines',
      'etenders this month',
      '30 day tenders',
      'monthly government opportunities',
    ].join(', '),
    openGraph: {
      title: `Government Tenders Closing This Month - ${currentMonth}`,
      description: `Browse government tenders closing in the next 30 days. Plan your bid strategy ahead.`,
      url: 'https://protenders.co.za/tenders/closing-this-month',
      type: 'website',
    },
  };
}

export default function ClosingThisMonthPage() {
  const today = new Date();
  const monthEnd = new Date(today);
  monthEnd.setDate(monthEnd.getDate() + 30);

  const currentMonth = today.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const dateRange = `${today.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })} - ${monthEnd.toLocaleDateString('en-ZA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tenders', href: '/etenders' },
    { label: 'Closing This Month' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Closing This Month", url: "https://protenders.co.za/tenders/closing-this-month" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="w-full border-b bg-gradient-to-br from-blue-50 via-sky-50 to-background dark:from-blue-950/20 dark:via-sky-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarDays className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-blue-600">Next 30 Days</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Government Tenders Closing This Month
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {dateRange} - Plan ahead with visibility of tenders closing in the next 30 days.
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
              <div className="text-lg font-semibold">Every 6 hours</div>
            </Card>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <span className="font-semibold">Strategic Planning:</span> Use this view to plan your bid pipeline
              for the next 30 days. Set up alerts for specific tenders to get notified of any updates.
            </AlertDescription>
          </Alert>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Tenders Closing This Month</h2>
              <p className="text-muted-foreground">
                Updated every 6 hours - sorted by closing date (earliest first)
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/tenders/closing-today">
                <Button variant="outline" size="sm">Today</Button>
              </Link>
              <Link href="/tenders/closing-this-week">
                <Button variant="outline" size="sm">This Week</Button>
              </Link>
            </div>
          </div>

          <LiveTendersFiltered
            filters={{
              closingInDays: 30,
              page: 1,
              pageSize: 100,
              sort: "-closingDate"
            }}
            emptyIcon={<CalendarDays className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No Tenders Closing This Month"
            emptyDescription="No government tenders are closing in the next 30 days. Browse all opportunities."
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
