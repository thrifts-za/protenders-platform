import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import SessionProvider from "@/components/SessionProvider";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://protenders.co.za"),
  title: {
    default: "ProTenders | South Africa's Premier Government Tender Portal",
    template: "%s | ProTenders",
  },
  description:
    "Search 10,000+ government tenders, RFQs & RFPs across South Africa. AI-powered tender alerts, BEE opportunities & real-time procurement intelligence.",
  keywords: [
    "government tenders South Africa",
    "RFQ",
    "RFP",
    "procurement opportunities",
    "BEE tenders",
    "government contracts",
    "tender alerts",
    "South African tenders",
    "government procurement",
    "tender portal",
  ],
  authors: [{ name: "ProTenders" }],
  creator: "ProTenders",
  publisher: "ProTenders",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://protenders.co.za",
    title: "ProTenders | Find Government Tenders in South Africa",
    description:
      "Access 10,000+ government tenders, RFQs & RFPs. AI-powered alerts for procurement opportunities across all provinces.",
    siteName: "ProTenders",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTenders | Find Government Tenders in South Africa",
    description:
      "Access 10,000+ government tenders, RFQs & RFPs. AI-powered alerts for procurement opportunities.",
    creator: "@protenders",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(websiteSchema),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <SessionProvider>
            <TooltipProvider>
            <div className="min-h-screen flex flex-col">
            {/* Header/Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    ProTenders
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
                  <Link href="/provinces" className="text-sm font-medium hover:text-primary transition-colors">Provinces</Link>
                  <Link href="/alerts" className="text-sm font-medium hover:text-primary transition-colors">Alerts</Link>
                  <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
                  <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                </div>
              </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <Footer />
          </div>
              <Toaster />
              <SonnerToaster position="top-right" />
            </TooltipProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
