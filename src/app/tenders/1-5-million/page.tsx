import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Briefcase } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { ValueFilteredTenders } from "@/components/ValueFilteredTenders";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Government Tenders R1 Million - R5 Million | Medium-Scale Opportunities | ProTenders",
  description: "Browse medium-scale government tenders valued between R1 million and R5 million in South Africa. Perfect for growing businesses and established SMEs with proven track records.",
  keywords: "tenders 1 million to 5 million, medium value tenders south africa, tenders r1m to r5m, mid-scale government contracts, growing business tenders",
  openGraph: {
    title: "Government Tenders R1 Million - R5 Million",
    description: "Medium-scale government tenders valued between R1M and R5M. Perfect for growing businesses.",
    url: "https://protenders.co.za/tenders/1-5-million",
    type: "website",
  },
};

export default function OneToFiveMillionPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "R1M - R5M", url: "https://protenders.co.za/tenders/1-5-million" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tenders", href: "/etenders" },
        { label: "R1M - R5M" },
      ]} />

      <header className="w-full border-b bg-gradient-to-br from-blue-50 via-cyan-50 to-background dark:from-blue-950/20 dark:via-cyan-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-blue-600">Medium-Scale Contracts</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Government Tenders R1 Million - R5 Million</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Medium-scale projects perfect for growing businesses and established SMEs with proven track records and capacity for expansion.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <span className="font-semibold">Growth Opportunities:</span> These medium-scale tenders are ideal for businesses ready to scale up.
            </AlertDescription>
          </Alert>

          <ValueFilteredTenders
            minValue={1000000}
            maxValue={5000000}
            showStats={true}
            emptyIcon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No Medium-Scale Tenders Currently"
            emptyDescription="No government tenders in the R1M - R5M range are currently active."
            emptyAction={
              <div className="flex gap-3 justify-center">
                <Link href="/tenders/sme-opportunities"><Button variant="outline">SME Opportunities</Button></Link>
                <Link href="/tenders/over-10-million"><Button variant="outline">Over R10M</Button></Link>
                <Link href="/etenders"><Button>Browse All Tenders</Button></Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
