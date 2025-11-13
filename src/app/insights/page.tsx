import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Building2, Shield, AlertCircle, Sparkles, Users, Package, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentAnalytics from "@/components/PaymentAnalytics";

export const metadata: Metadata = {
  title: "Procurement Insights",
  description: "Explore government procurement payment data and spending trends across South Africa. New anti-corruption dashboard launched by Finance Minister Godongwana.",
};

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="content-container py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">New</Badge>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Anti-Corruption Tool
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Procurement Insights Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Government procurement payment data to track spending and combat tender corruption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Announcement */}
      <div className="content-container pt-6">
        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">
                <strong>Launched November 12, 2025:</strong> Finance Minister Enoch Godongwana unveiled this dashboard during the Medium Term Budget Policy Statement (MTBPS) to enhance transparency and prevent corruption schemes in public procurement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="content-container py-8">
        <h2 className="text-xl font-semibold mb-4">Dashboard Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Spending Trends</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track government spending patterns across departments and time periods to identify anomalies
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Payment Transparency</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View actual payments made to suppliers from national and provincial governments
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Supplier Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Analyze which suppliers do business with the state and monitor contract awards
            </p>
          </div>
        </div>

        {/* Interactive Analytics */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Payment Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Interactive analysis of BAS/CSD payment data • Real-time insights from {' '}
              <span className="font-medium text-foreground">29,999+ transactions</span>
            </p>
          </div>
          <PaymentAnalytics />
        </div>

        {/* Coming Soon: Demographic Analytics */}
        <div className="mb-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Coming Soon: Demographic Insights</h2>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">Preview</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced demographic analytics powered by National Treasury data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">PPPFA Categories</CardTitle>
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">6</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Black, Women, Youth, Disabled, Military Veteran, Rural Township ownership tracking
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Monthly Trends</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">R58.5B</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Track demographic spend changes month-over-month (6 months available)
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Supplier Classification</CardTitle>
                  <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">9 Types</div>
                <p className="text-xs text-muted-foreground mt-1">
                  CIPC Company, Government Entity, SOE, NPO, and more (R93.5B tracked)
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Commodity Breakdown</CardTitle>
                  <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">50+</div>
                <p className="text-xs text-muted-foreground mt-1">
                  UNSPSC commodity segments with complete spend analysis (R85.7B tracked)
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 p-4 rounded-lg border bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Launching Soon: ProTenders will be the <span className="text-amber-600 dark:text-amber-400">ONLY platform</span> offering all 6 PPPFA demographic categories with monthly trends
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Filter opportunities by demographic ownership (Black, Women, Youth-owned businesses)</li>
                  <li>• Track B-BBEE compliance across all 6 PPPFA categories</li>
                  <li>• Analyze supplier type preferences by department</li>
                  <li>• Identify high-spend commodity categories for market intelligence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* PowerBI Dashboard */}
        <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Procurement Payments Dashboard (BAS)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Data from Basic Accounting System (BAS) and Central Supplier Database (CSD) • Powered by National Treasury
            </p>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <iframe
              src="https://app.powerbi.com/view?r=eyJrIjoiNDExMmNjOTUtYmNjOS00NzAyLTk2ZGItMjZjOWRkODAxYzA4IiwidCI6IjFhNDUzNDhmLTAyYjQtNGY5YS1hN2E4LTc3ODZmNmRkMzI0NSIsImMiOjh9"
              className="w-full h-[637px] border-0"
              allowFullScreen
              title="Procurement Payments Dashboard"
            />
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <iframe
              src="https://app.powerbi.com/view?r=eyJrIjoiNDExMmNjOTUtYmNjOS00NzAyLTk2ZGItMjZjOWRkODAxYzA4IiwidCI6IjFhNDUzNDhmLTAyYjQtNGY5YS1hN2E4LTc3ODZmNmRkMzI0NSIsImMiOjh9"
              className="w-full h-[500px] border-0"
              allowFullScreen
              title="Procurement Payments Dashboard"
            />
          </div>
        </div>

        {/* Anti-Corruption Impact */}
        <div className="mt-6 p-6 rounded-lg border bg-card">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Fighting Procurement Corruption</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This dashboard was specifically designed to prevent corruption schemes like those exposed at Tembisa Hospital,
                where officials manipulated procurement processes to award numerous small contracts to associates,
                bypassing the scrutiny applied to larger tenders.
              </p>
              <p className="text-sm text-muted-foreground">
                By making payment data public, citizens, academics, oversight institutions, and civil society can now
                track how public money is spent, who gets paid, and when payments are made—enabling accountability
                and early detection of suspicious patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Source Attribution */}
        <div className="mt-6 p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Data Source:</strong> National Treasury eTender Portal • Basic Accounting System (BAS) and Central Supplier Database (CSD)
            {" "}
            <Link
              href="https://data.etenders.gov.za/Home/SpendData"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View original source →
            </Link>
          </p>
        </div>

        {/* Additional Resources */}
        <div className="mt-6 p-6 rounded-lg border bg-card">
          <h3 className="font-semibold mb-4">Additional Resources</h3>
          <div className="space-y-3">
            <Link
              href="https://data.etenders.gov.za/Home/DownloadFile/?fileName=Procurement Payments Dashboard (BAS) User Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              📄 Download PowerBI User Guide (PDF)
            </Link>
            <Link
              href="https://data.etenders.gov.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              🌐 Visit eTenders Data Portal
            </Link>
            <Link
              href="https://ocds-api.etenders.gov.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              🔌 Explore eTenders API Documentation
            </Link>
            <Link
              href="https://www.sanews.gov.za/south-africa/public-procurement-payments-dashboard-goes-live"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              📰 Read Official Government Announcement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
