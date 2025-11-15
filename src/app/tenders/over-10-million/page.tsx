import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Building2 } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { ValueFilteredTenders } from "@/components/ValueFilteredTenders";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Government Tenders Over R10 Million | High-Value Opportunities | ProTenders",
  description: "Browse large-scale government tenders valued over R10 million in South Africa. Major infrastructure projects, construction tenders, and enterprise-level contracts. Perfect for established businesses and consortiums.",
  keywords: "tenders over 10 million, high value tenders south africa, large government contracts, tenders above r10 million, major infrastructure tenders, enterprise tenders",
  openGraph: {
    title: "Government Tenders Over R10 Million",
    description: "Major government tenders valued over R10 million. Infrastructure, construction, and enterprise-level contracts.",
    url: "https://protenders.co.za/tenders/over-10-million",
    type: "website",
  },
};

export default function Over10MillionPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "Over R10 Million", url: "https://protenders.co.za/tenders/over-10-million" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tenders", href: "/etenders" },
        { label: "Over R10 Million" },
      ]} />

      <header className="w-full border-b bg-gradient-to-br from-purple-50 via-indigo-50 to-background dark:from-purple-950/20 dark:via-indigo-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-purple-600">High-Value Contracts</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Government Tenders Over R10 Million</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Major infrastructure projects, construction tenders, and enterprise-level contracts for established businesses and consortiums.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <Building2 className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <span className="font-semibold">Enterprise Opportunities:</span> These high-value tenders require substantial capacity, experience, and often consortium arrangements.
            </AlertDescription>
          </Alert>

          <ValueFilteredTenders
            minValue={10000000}
            showStats={true}
            emptyIcon={<Building2 className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No High-Value Tenders Currently"
            emptyDescription="No government tenders over R10 million are currently active."
            emptyAction={
              <div className="flex gap-3 justify-center">
                <Link href="/tenders/1-5-million"><Button variant="outline">R1M - R5M</Button></Link>
                <Link href="/etenders"><Button>Browse All Tenders</Button></Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
