import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Rocket } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { ValueFilteredTenders } from "@/components/ValueFilteredTenders";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "SME Tender Opportunities Under R1 Million | Small Business Tenders | ProTenders",
  description: "Browse SME-friendly government tenders valued under R1 million in South Africa. Perfect opportunities for small businesses, startups, and emerging entrepreneurs to enter government procurement.",
  keywords: "sme tenders south africa, small business tenders, tenders under 1 million, tenders under r1m, startup tenders, eme opportunities, qse tenders",
  openGraph: {
    title: "SME Tender Opportunities Under R1 Million",
    description: "SME-friendly government tenders under R1M. Perfect for small businesses and startups.",
    url: "https://protenders.co.za/tenders/sme-opportunities",
    type: "website",
  },
};

export default function SMEOpportunitiesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tenders", url: "https://protenders.co.za/etenders" },
    { name: "SME Opportunities", url: "https://protenders.co.za/tenders/sme-opportunities" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tenders", href: "/etenders" },
        { label: "SME Opportunities" },
      ]} />

      <header className="w-full border-b bg-gradient-to-br from-green-50 via-teal-50 to-background dark:from-green-950/20 dark:via-teal-950/20">
        <div className="content-container py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-green-600">SME-Friendly</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">SME Tender Opportunities Under R1 Million</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Entry-level government contracts perfect for small businesses, startups, EMEs, and QSEs.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <Alert className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
            <Rocket className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <span className="font-semibold">Perfect Starting Point:</span> These tenders are ideal for small businesses and startups entering government procurement.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">EME/QSE</Badge>
                BBBEE Preferences
              </h3>
              <p className="text-sm text-muted-foreground">Many SME tenders offer 80/20 or 90/10 preference point systems favoring EMEs and QSEs.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">Lower Risk</Badge>
                Manageable Scale
              </h3>
              <p className="text-sm text-muted-foreground">Smaller contract values mean lower financial risk and easier cash flow management.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">Growth</Badge>
                Build Track Record
              </h3>
              <p className="text-sm text-muted-foreground">Successfully delivering on SME tenders creates the track record needed for larger contracts.</p>
            </Card>
          </div>

          <ValueFilteredTenders
            maxValue={1000000}
            showStats={true}
            emptyIcon={<Rocket className="h-12 w-12 text-muted-foreground" />}
            emptyTitle="No SME Opportunities Currently"
            emptyDescription="No SME-friendly tenders are currently active. Check back soon or browse all opportunities."
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
