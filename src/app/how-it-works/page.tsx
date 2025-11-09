import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  ArrowLeft,
  Search,
  Filter,
  Bell,
  FileText,
  Brain,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Download,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works - Find eTenders & Government Tenders in South Africa",
  description:
    "Learn how to use ProTenders to find etenders, government tenders, and procurement opportunities in South Africa. Step-by-step guide to searching, alerts, and AI-powered insights.",
  keywords: [
    "how to find tenders",
    "tender search guide",
    "etenders tutorial",
    "government tenders guide",
    "ProTenders guide",
    "tender alerts setup",
  ],
  openGraph: {
    title: "How It Works - Find eTenders & Government Tenders",
    description: "Step-by-step guide to finding government tenders in South Africa with ProTenders",
    url: "https://protenders.co.za/how-it-works",
  },
};

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Create Your Free Account",
      description:
        "Sign up in minutes with just your email address. No credit card required to start searching for etenders and government tenders across South Africa.",
      icon: Users,
      features: [
        "Instant access to tender database",
        "Free basic search functionality",
        "Create saved searches",
        "Set up limited alerts",
      ],
    },
    {
      number: "2",
      title: "Search with Advanced Filters",
      description:
        "Use our powerful search engine to find relevant tenders. Filter by keywords, categories, provinces, buyers, closing dates, and more.",
      icon: Filter,
      features: [
        "Search across all South African tenders",
        "Filter by industry and category",
        "Location-based search (provinces)",
        "Buyer and department filters",
        "Date range and deadline filters",
      ],
    },
    {
      number: "3",
      title: "Review Tender Details",
      description:
        "Click on any tender to view complete details including requirements, specifications, documents, closing dates, and contact information.",
      icon: FileText,
      features: [
        "Complete tender specifications",
        "Download all documents",
        "View buyer information",
        "See closing dates and deadlines",
        "Access historical awards data",
      ],
    },
    {
      number: "4",
      title: "Get AI-Powered Insights",
      description:
        "Let our AI analyze tenders for you. Get opportunity scores, competitive intelligence, and smart recommendations tailored to your business.",
      icon: Brain,
      features: [
        "Opportunity scoring and matching",
        "Competitive intelligence",
        "Document analysis and extraction",
        "Buyer insights and patterns",
        "Personalized recommendations",
      ],
      premium: true,
    },
    {
      number: "5",
      title: "Set Up Real-Time Alerts",
      description:
        "Never miss an opportunity. Create custom alerts based on your criteria and get instant notifications when matching tenders are published.",
      icon: Bell,
      features: [
        "Custom alert criteria",
        "Email and in-app notifications",
        "Multiple alerts per account",
        "Instant new tender notifications",
        "Daily/weekly digest options",
      ],
    },
    {
      number: "6",
      title: "Track & Manage Opportunities",
      description:
        "Save tenders to your workspace, track deadlines, export data, and collaborate with your team to manage your tender pipeline effectively.",
      icon: Rocket,
      features: [
        "Personal workspace and dashboard",
        "Deadline tracking and reminders",
        "Export to CSV/Excel",
        "Calendar integration",
        "Team collaboration tools",
      ],
      premium: true,
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description:
        "Stop checking multiple government portals. Find all tenders in one centralized platform with real-time updates.",
    },
    {
      icon: TrendingUp,
      title: "Increase Win Rate",
      description:
        "AI-powered insights help you identify the best opportunities and understand what it takes to win each tender.",
    },
    {
      icon: Bell,
      title: "Never Miss Opportunities",
      description:
        "Get instant alerts when new relevant tenders are published. Be the first to know and respond quickly.",
    },
    {
      icon: Brain,
      title: "Competitive Advantage",
      description:
        "Access competitive intelligence, buyer insights, and historical data to give you an edge over competitors.",
    },
    {
      icon: Download,
      title: "Easy Access",
      description:
        "Download all tender documents in one place. No more navigating complex government websites.",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description:
        "Find exactly what you're looking for with powerful filters and search capabilities across all tender data.",
    },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "How It Works" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="max-w-3xl">
            <Badge className="mb-4">How It Works</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find eTenders in South Africa
              <br />
              <span className="text-primary">In 6 Simple Steps</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              ProTenders makes it easy to search government tenders, set up alerts, and win more opportunities with AI-powered intelligence.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/">
                <Button size="lg">
                  Start Searching
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg">
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-16">
        <div className="content-container">
        {/* Steps */}
        <div className="max-w-5xl mx-auto space-y-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={idx}
                className={`flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 items-center`}
              >
                {/* Icon/Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                      {step.number}
                    </div>
                    {step.premium && (
                      <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <Card className="flex-1 p-8">
                  <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {step.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">Why ProTenders</Badge>
            <h2 className="text-3xl font-bold mb-4">
              The Smartest Way to Find Government Tenders
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join hundreds of South African businesses using ProTenders to discover opportunities and win more contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Next Tender?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              Join ProTenders today and get instant access to thousands of etenders and government tenders across South Africa.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <Button size="lg" className="text-lg px-8">
                  Start Searching - It's Free
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Tenders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">Real-Time</div>
                <div className="text-sm text-muted-foreground">Updates Daily</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">All Provinces</div>
                <div className="text-sm text-muted-foreground">South Africa Coverage</div>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
